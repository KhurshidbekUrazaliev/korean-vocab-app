// Leitner boxes 1-5. A miss sends a word to box 1 (due again today).
// A correct answer moves it up one box, but only when it was due: practicing the same word
// in four modes in one sitting must not jump it from new to mastered. A new word answered
// correctly counts as box 1 passed, so it comes back tomorrow rather than right away.
export const INTERVAL_DAYS = [0, 1, 3, 7, 16];
const DAY_MS = 86_400_000;

export function schedule(state, correct, now = new Date()) {
  const prev = state ?? { box: 0, seen: 0, correctCount: 0 };
  const early = Boolean(prev.box && prev.dueAt && new Date(prev.dueAt) > now);
  const keepDue = correct && early;
  const box = !correct ? 1 : !prev.box ? 2 : early ? prev.box : Math.min(prev.box + 1, 5);
  return {
    box,
    dueAt: keepDue ? prev.dueAt : new Date(now.getTime() + INTERVAL_DAYS[box - 1] * DAY_MS).toISOString(),
    seen: prev.seen + 1,
    correctCount: prev.correctCount + (correct ? 1 : 0),
  };
}

export function getDueWords(progress, allWords, now = new Date()) {
  return allWords.filter((w) => {
    const s = progress.words[w.id];
    return s && new Date(s.dueAt) <= now;
  });
}
