import { CHECKPOINT_KEY, compactJournal, journalView, operationWriter, scheduledAt } from './progressJournal.js';
import { legacyWordIds } from './legacyWordIds.js';
import { INTERVAL_DAYS } from './srs.js';

export const PROGRESS_KEY = 'kv.progress.v2';
export const LEGACY_KEY = 'kv.progress.v1';
export const emptyProgress = () => ({ version: 2, words: {}, days: {}, activity: [], daily: {} });

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isCount = (value) => Number.isSafeInteger(value) && value >= 0;
const isDayKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isTimestamp = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const validWord = (word) => isRecord(word) && Number.isInteger(word.box) && word.box >= 1
  && word.box <= INTERVAL_DAYS.length && isTimestamp(word.dueAt)
  && isCount(word.seen) && isCount(word.correctCount) && word.correctCount <= word.seen;
const validDay = (day) => isRecord(day) && isCount(day.best) && day.best <= 100
  && Array.isArray(day.modes) && day.modes.every((mode) => typeof mode === 'string')
  && (day.lastAt === undefined || isTimestamp(day.lastAt));

// Both deployments may include the same answers. Keep the newest schedule and
// take the higher counters without counting a shared history twice.
function mergeWord(legacy, current) {
  if (!validWord(current)) return legacy;
  const latest = scheduledAt(legacy) > scheduledAt(current) ? legacy : current;
  return {
    ...legacy, ...current, ...latest,
    seen: Math.max(legacy.seen, current.seen),
    correctCount: Math.max(legacy.correctCount, current.correctCount),
  };
}

function mergeDay(legacy, current) {
  if (!validDay(current)) return legacy;
  return {
    ...legacy, ...current,
    best: Math.max(legacy.best, current.best),
    modes: [...new Set([...current.modes, ...legacy.modes])],
    lastAt: [current.lastAt, legacy.lastAt].filter(Boolean).sort().at(-1),
  };
}

function importLegacy(legacy, current) {
  const words = { ...current.words };
  for (const [oldId, word] of Object.entries(legacy.words ?? {})) {
    const unchanged = /^day(?:0[1-9]|1[0-5])-(?:0[1-9]|10)$/.test(oldId);
    const id = unchanged ? oldId : legacyWordIds[oldId];
    if (typeof id === 'string' && validWord(word)) words[id] = mergeWord(word, words[id]);
  }

  const days = { ...current.days };
  for (const [id, score] of Object.entries(legacy.days ?? {})) {
    if (/^day(?:0[1-9]|1[0-5])$/.test(id) && validDay(score)) days[id] = mergeDay(score, days[id]);
  }

  const activeDates = Array.isArray(legacy.activity) ? legacy.activity.filter(isDayKey) : [];
  const activity = [...new Set([...current.activity, ...activeDates])].sort();
  const daily = { ...current.daily };
  for (const [date, count] of Object.entries(legacy.daily ?? {})) {
    if (isDayKey(date) && isCount(count)) daily[date] = Math.max(daily[date] ?? 0, count);
  }
  return { ...current, words, days, activity, daily };
}

function read(storage, key) {
  try {
    return JSON.parse(storage?.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

function legacyProgress(storage) {
  try {
    const saved = read(storage, PROGRESS_KEY);
    if (saved && saved.version !== 2) return emptyProgress();
    const current = { ...emptyProgress(), ...saved };
    const legacy = read(storage, LEGACY_KEY);
    if (legacy?.version !== 1) return current;
    // An older tab can still update v2. Cache the migration only in our locked
    // checkpoint; a read/merge/write here could overwrite that tab's grade.
    return importLegacy(legacy, current);
  } catch {
    return emptyProgress();
  }
}

export function browserStorage() {
  try { return globalThis.localStorage; } catch { return undefined; }
}

// Older, still-open tabs write cumulative v2 snapshots. Import only advances since
// the last checkpoint, separately from grades written by journal-aware tabs.
function readBaseline(storage, checkpoint) {
  const live = legacyProgress(storage);
  if (!checkpoint) return { progress: live, baseline: live };
  const prior = checkpoint.baseline;
  const saved = checkpoint.progress;
  if (JSON.stringify(live) === JSON.stringify(prior)) return { progress: saved, baseline: prior };

  const progress = { ...saved, words: { ...saved.words }, days: { ...saved.days }, daily: { ...saved.daily } };
  const baseline = { ...prior, words: { ...prior.words }, days: { ...prior.days }, daily: { ...prior.daily } };
  for (const [id, word] of Object.entries(live.words)) {
    if (!validWord(word)) continue;
    const before = prior.words[id];
    const seen = Math.max(0, word.seen - (before?.seen ?? 0));
    const correct = Math.max(0, word.correctCount - (before?.correctCount ?? 0));
    baseline.words[id] = mergeWord(word, before);
    if (!seen && !correct) continue;
    const current = saved.words[id];
    const merged = validWord(current) ? mergeWord(current, word) : word;
    progress.words[id] = {
      ...merged, seen: (current?.seen ?? 0) + seen, correctCount: (current?.correctCount ?? 0) + correct,
    };
  }
  for (const [id, day] of Object.entries(live.days)) {
    if (!validDay(day)) continue;
    baseline.days[id] = mergeDay(day, prior.days[id]);
    progress.days[id] = mergeDay(day, saved.days[id]);
  }
  for (const [date, count] of Object.entries(live.daily)) {
    if (!isDayKey(date) || !isCount(count)) continue;
    const before = prior.daily[date] ?? 0;
    baseline.daily[date] = Math.max(before, count);
    progress.daily[date] = (saved.daily[date] ?? 0) + Math.max(0, count - before);
  }
  baseline.activity = [...new Set([...prior.activity, ...live.activity])].sort();
  progress.activity = [...new Set([...saved.activity, ...live.activity])].sort();
  return { progress, baseline };
}

export function readProgress(storage, volatile) {
  return journalView(storage, checkpoint => readBaseline(storage, checkpoint), volatile);
}

export function compactProgress(storage) {
  return compactJournal(storage, checkpoint => readBaseline(storage, checkpoint));
}

export function loadProgress(storage = browserStorage()) {
  try { return readProgress(storage).progress; } catch { return legacyProgress(storage); }
}

// Explicit snapshot replacement for callers importing or restoring progress.
export function saveProgress(progress, storage = browserStorage()) {
  try {
    if (!storage) return;
    const view = readProgress(storage);
    if (view.sequence || storage.getItem(CHECKPOINT_KEY)) {
      const op = operationWriter()({ kind: 'replace', progress }, new Date(), view.sequence);
      storage.setItem(op.key, JSON.stringify(op.value));
    } else storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch { /* The caller can still use the supplied snapshot in memory. */ }
}

export const localDateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
