// Leitner boxes 1-5. A correct answer moves a word up one box, a miss sends it back to box 1.
export const INTERVAL_DAYS = [0, 1, 3, 7, 16];
const DAY_MS = 86_400_000;

export function schedule(state, correct, now = new Date()) {
  const prev = state ?? { box: 0, seen: 0, correctCount: 0 };
  const box = correct ? Math.min(prev.box + 1, 5) : 1;
  return {
    box,
    dueAt: new Date(now.getTime() + INTERVAL_DAYS[box - 1] * DAY_MS).toISOString(),
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
