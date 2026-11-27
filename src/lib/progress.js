import { legacyWordIds } from './legacyWordIds.js';

export const PROGRESS_KEY = 'kv.progress.v2';
const LEGACY_KEY = 'kv.progress.v1';
export const emptyProgress = () => ({ version: 2, words: {}, days: {}, activity: [] });

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function migrate(legacy) {
  const next = emptyProgress();
  if (Array.isArray(legacy.activity)) next.activity = legacy.activity;
  for (const [id, score] of Object.entries(legacy.days ?? {})) {
    if (/^day(?:0[1-9]|1[0-5])$/.test(id) && isRecord(score)) next.days[id] = score;
  }
  for (const [oldId, word] of Object.entries(legacy.words ?? {})) {
    const unchanged = /^day(?:0[1-9]|1[0-5])-(?:0[1-9]|10)$/.test(oldId);
    const id = unchanged ? oldId : legacyWordIds[oldId];
    if (typeof id === 'string' && isRecord(word)) next.words[id] = word;
  }
  return next;
}

export function loadProgress(storage) {
  try {
    storage ??= globalThis.localStorage;
    const saved = storage?.getItem(PROGRESS_KEY);
    if (saved != null) {
      const current = JSON.parse(saved);
      return current?.version === 2 ? { ...emptyProgress(), ...current } : emptyProgress();
    }
    const legacy = JSON.parse(storage?.getItem(LEGACY_KEY) ?? 'null');
    if (legacy?.version !== 1) return emptyProgress();
    const next = migrate(legacy);
    saveProgress(next, storage);
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
