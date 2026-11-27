import { shuffle } from './shuffle.js';

const label = (word, side) => (side === 'ko' ? word.korean : word.english);

/** direction 'ko-en': show Korean, pick English. 'en-ko': the reverse. */
export function buildMultipleChoice(word, pool, { count = 4, direction = 'ko-en' } = {}) {
  const answerSide = direction === 'ko-en' ? 'en' : 'ko';
  const distractors = shuffle(pool.filter((w) => w.id !== word.id && label(w, answerSide) !== label(word, answerSide)))
    .slice(0, count - 1);
  const options = shuffle([word, ...distractors]).map((w) => ({ id: w.id, label: label(w, answerSide) }));
  return { prompt: label(word, answerSide === 'en' ? 'ko' : 'en'), options, answerId: word.id };
}

const normalize = (s) =>
  s.toLowerCase().normalize('NFC').replace(/\(.*?\)/g, '').replace(/^to\s+(be\s+)?/, '').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

function similarity(a, b) {
  if (!a.length && !b.length) return 1;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - dp[a.length][b.length] / Math.max(a.length, b.length);
}

/** Typed answer check. English answers accept any comma/slash-separated meaning. */
export function checkTyped(input, word, { direction = 'en-ko' } = {}) {
  const typed = normalize(input);
  if (!typed) return { correct: false, closeness: 0 };
  const targets = direction === 'en-ko' ? [word.korean] : word.english.split(/[,/;]/);
  const closeness = Math.max(...targets.map((t) => similarity(typed, normalize(t))));
  return { correct: closeness === 1, closeness };
}
