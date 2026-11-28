import { useSyncExternalStore } from 'react';
import { browserStorage, compactProgress, emptyProgress, localDateKey, readProgress } from '../lib/progress.js';
import { applyOperation, COMPACT_AFTER, isProgressKey, operationWriter, withProgressLock } from '../lib/progressJournal.js';

export function createProgressStore(storage, lock = withProgressLock) {
  const listeners = new Set();
  const operation = operationWriter();
  let state = emptyProgress();
  let volatile = [];
  let scheduled = false;

  function flushVolatile() {
    while (volatile.length) {
      const { key, value } = volatile[0];
      try { storage.setItem(key, JSON.stringify(value)); } catch { break; }
      volatile.shift();
    }
  }

  function refresh() {
    if (storage) {
      try {
        flushVolatile();
        const view = readProgress(storage, volatile);
        state = view.progress;
        if (!scheduled && (view.keys.length >= COMPACT_AFTER || (volatile.length && view.keys.length))) {
          scheduled = true;
          Promise.resolve().then(() => lock(() => {
            compactProgress(storage);
            flushVolatile();
          })).catch(() => { /* The journal survives a failed cleanup. */ })
            .finally(() => { scheduled = false; });
        }
      } catch { /* Keep the last in-memory view if storage becomes unavailable. */ }
    }
    listeners.forEach(listener => listener());
  }

  function record(fields, now = new Date()) {
    let observed = 0;
    try { observed = readProgress(storage, volatile).sequence; } catch { /* Storage unavailable. */ }
    const entry = operation(fields, now, observed);
    state = applyOperation(state, entry.value);
    // A successful synchronous setItem survives immediate tab closure.
    if (storage) volatile.push(entry);
    refresh();
  }

  refresh();
  return {
    get: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh,
    recordAnswer(word, correct) {
      const now = new Date();
      record({ kind: 'answer', word, correct, date: localDateKey(now) }, now);
    },
    recordSession(day, mode, score, total) {
      if (day) record({ kind: 'session', day, mode, percent: Math.round(score / total * 100) });
    },
  };
}

export const progressStore = createProgressStore(typeof window === 'undefined' ? undefined : browserStorage());

if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (isProgressKey(e.key)) progressStore.refresh();
  });
}

export const useProgress = () => useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.get);

/** Number of a day's words the learner has answered correctly at least once. */
export const learnedCount = (progress, day) => day.words.filter((w) => progress.words[w.id]?.correctCount > 0).length;
