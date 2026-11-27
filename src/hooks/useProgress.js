import { useSyncExternalStore } from 'react';
import { loadProgress, saveProgress, localDateKey } from '../lib/progress.js';
import { schedule } from '../lib/srs.js';

let state = typeof window === 'undefined' ? { version: 1, words: {}, days: {}, activity: [] } : loadProgress();
const listeners = new Set();

function set(next) {
  state = next;
  saveProgress(state);
  listeners.forEach((l) => l());
}

export const progressStore = {
  get: () => state,
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  recordAnswer(wordId, correct) {
    const today = localDateKey();
    set({
      ...state,
      words: { ...state.words, [wordId]: schedule(state.words[wordId], correct) },
      activity: state.activity.includes(today) ? state.activity : [...state.activity, today],
    });
  },
  recordSession(dayId, mode, score, total) {
    if (!dayId) return;
    const prev = state.days[dayId] ?? { best: 0, modes: [] };
    set({
      ...state,
      days: {
        ...state.days,
        [dayId]: {
          best: Math.max(prev.best, Math.round((score / total) * 100)),
          modes: prev.modes.includes(mode) ? prev.modes : [...prev.modes, mode],
          lastAt: new Date().toISOString(),
        },
      },
    });
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'kv.progress.v1') {
      state = loadProgress();
      listeners.forEach((l) => l());
    }
  });
}

export const useProgress = () => useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.get);

/** Number of a day's words the learner has answered correctly at least once. */
export const learnedCount = (progress, day) => day.words.filter((w) => progress.words[w.id]?.correctCount > 0).length;
