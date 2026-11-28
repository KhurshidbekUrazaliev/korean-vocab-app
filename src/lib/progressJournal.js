// Each synchronous grade gets a separate key. Only cleanup needs an asynchronous lock.
import { INTERVAL_DAYS, schedule } from './srs.js';

export const JOURNAL_PREFIX = 'kv.progress.op.';
export const CHECKPOINT_KEY = 'kv.progress.checkpoint';
export const COMPACT_AFTER = 32;

export const isProgressKey = key => key === null || key === CHECKPOINT_KEY ||
  key === 'kv.progress.v1' || key === 'kv.progress.v2' || key?.startsWith(JOURNAL_PREFIX);

export function operationWriter() {
  const id = globalThis.crypto.randomUUID?.() ??
    Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8, '0')).join('');
  let sequence = 0;
  return (fields, now = new Date(), observedSequence = 0) => {
    // Preserve observed order even for two actions in the same millisecond.
    // Truly concurrent writers tie-break by their unique identifier.
    sequence = Math.max(sequence, observedSequence) + 1;
    return {
      key: JOURNAL_PREFIX + String(sequence).padStart(16, '0') + '.' + id,
      value: { ...fields, at: now.toISOString() },
    };
  };
}

// The old word schema records a due date and box, but no grading timestamp.
export const scheduledAt = word => Date.parse(word.dueAt) - INTERVAL_DAYS[word.box - 1] * 86_400_000;

export function applyOperation(state, op) {
  if (op.kind === 'replace') return op.progress;
  if (op.kind === 'answer') {
    const previous = state.words[op.word];
    const graded = schedule(previous, op.correct, new Date(op.at));
    // A still-open legacy tab may have changed the schedule after this journal
    // entry. Count the grade while preserving that demonstrably newer schedule.
    if (previous && scheduledAt(previous) > Date.parse(op.at)) {
      graded.box = previous.box;
      graded.dueAt = previous.dueAt;
    }
    return {
      ...state,
      words: { ...state.words, [op.word]: graded },
      daily: { ...state.daily, [op.date]: (state.daily[op.date] ?? 0) + 1 },
      activity: state.activity.includes(op.date) ? state.activity : [...state.activity, op.date].sort(),
    };
  }
  const previous = state.days[op.day] ?? { best: 0, modes: [] };
  return {
    ...state,
    days: { ...state.days, [op.day]: {
      best: Math.max(previous.best, op.percent),
      modes: previous.modes.includes(op.mode) ? previous.modes : [...previous.modes, op.mode],
      lastAt: previous.lastAt > op.at ? previous.lastAt : op.at,
    } },
  };
}

function parseEntry(raw) {
  try {
    const op = JSON.parse(raw);
    if (!op || !Number.isFinite(Date.parse(op.at))) return null;
    if (op.kind === 'answer' && typeof op.word === 'string' && typeof op.correct === 'boolean' &&
      /^\d{4}-\d{2}-\d{2}$/.test(op.date)) return op;
    if (op.kind === 'session' && typeof op.day === 'string' && typeof op.mode === 'string' &&
      Number.isFinite(op.percent)) return op;
    if (op.kind === 'replace' && op.progress?.version === 2) return op;
  } catch { /* A damaged entry does not invalidate the other grades. */ }
  return null;
}

export function journalView(storage, base, volatile = []) {
  let raw, entries;
  // A compactor may delete folded keys while we enumerate. Retry if its snapshot changed.
  do {
    raw = storage?.getItem(CHECKPOINT_KEY);
    entries = new Map();
    for (let i = 0; i < (storage?.length ?? 0); i++) {
      const key = storage.key(i);
      if (key?.startsWith(JOURNAL_PREFIX)) {
        const value = parseEntry(storage.getItem(key));
        if (value) entries.set(key, value);
      }
    }
  } while (raw !== storage?.getItem(CHECKPOINT_KEY));
  const checkpoint = raw ? JSON.parse(raw) : null;
  const { progress: initial, baseline } = base(checkpoint);
  let progress = initial;
  const applied = new Set(checkpoint?.applied ?? []);
  const keys = [...entries.keys()];
  for (const { key, value } of volatile) entries.set(key, value);
  let sequence = checkpoint?.sequence ?? 0;
  for (const key of [...entries.keys()].sort()) {
    sequence = Math.max(sequence, Number(key.slice(JOURNAL_PREFIX.length).split('.')[0]) || 0);
    if (!applied.has(key)) progress = applyOperation(progress, entries.get(key));
  }
  return { progress, baseline, keys, sequence };
}

export function compactJournal(storage, base) {
  const { progress, baseline, keys, sequence } = journalView(storage, base);
  if (!keys.length) return;
  // The receipt and state are one atomic write. A crash during deletion is safe to replay.
  storage.setItem(CHECKPOINT_KEY, JSON.stringify({ progress, baseline, applied: keys, sequence }));
  for (const key of keys) storage.removeItem(key);
}

// Older browsers can serialize cleanup with an IndexedDB read/write transaction.
// If neither API is available, the journal remains the durable source of truth.
export async function withProgressLock(compact) {
  if (globalThis.navigator?.locks) return navigator.locks.request(CHECKPOINT_KEY, compact);
  if (!globalThis.indexedDB) return;
  await new Promise((resolve, reject) => {
    const open = indexedDB.open(CHECKPOINT_KEY, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('lock');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('lock', 'readwrite');
      const request = tx.objectStore('lock').get(0);
      request.onsuccess = () => {
        try { compact(); } catch { tx.abort(); }
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    };
  });
}
