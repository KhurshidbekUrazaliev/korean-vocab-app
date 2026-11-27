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
  const lastAnswer = (word) => Date.parse(word.dueAt) - INTERVAL_DAYS[word.box - 1] * 86_400_000;
  const latest = lastAnswer(legacy) > lastAnswer(current) ? legacy : current;
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

export function loadProgress(storage) {
  try {
    storage ??= globalThis.localStorage;
    const saved = read(storage, PROGRESS_KEY);
    if (saved && saved.version !== 2) return emptyProgress();
    const current = { ...emptyProgress(), ...saved };
    const legacy = read(storage, LEGACY_KEY);
    if (legacy?.version !== 1) return current;
    const next = importLegacy(legacy, current);
    if (JSON.stringify(next) !== JSON.stringify(saved)) saveProgress(next, storage);
    return next;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress, storage) {
  try {
    storage ??= globalThis.localStorage;
    storage?.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked (private mode). Progress just won't persist.
  }
}

export const localDateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
