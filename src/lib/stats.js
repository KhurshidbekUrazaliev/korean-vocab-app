import { localDateKey } from './progress.js';

export const MODE_ORDER = ['flashcards', 'choice', 'typing', 'listening'];
export const DAILY_GOAL = 20; // answers per day
const MASTERED_BOX = 4;

/** 0 = never seen, 1-5 = Leitner box */
export const wordLevel = (progress, word) => progress.words[word.id]?.box ?? 0;

export function dayStatus(progress, day) {
  const levels = day.words.map((w) => wordLevel(progress, w));
  const seen = levels.filter((l) => l > 0).length;
  const learned = day.words.filter((w) => progress.words[w.id]?.correctCount > 0).length;
  const mastered = levels.filter((l) => l >= MASTERED_BOX).length;
  const modes = progress.days[day.id]?.modes ?? [];
  const nextMode = MODE_ORDER.find((m) => !modes.includes(m)) ?? null;
  const state = mastered === day.words.length ? 'mastered' : modes.length === MODE_ORDER.length ? 'complete' : seen > 0 || modes.length ? 'active' : 'new';
  // Mastery 0..1: average box level out of 5
  const mastery = levels.reduce((a, l) => a + l, 0) / (day.words.length * 5);
  return { seen, learned, mastered, modes, nextMode, state, mastery, best: progress.days[day.id]?.best ?? null };
}

/** The day to continue: most recent unfinished day, else first unfinished, else last. */
export function currentDay(progress, days) {
  const touched = days
    .filter((d) => progress.days[d.id]?.lastAt && dayStatus(progress, d).nextMode)
    .sort((a, b) => progress.days[b.id].lastAt.localeCompare(progress.days[a.id].lastAt));
  return touched[0] ?? days.find((d) => dayStatus(progress, d).nextMode) ?? days[days.length - 1];
}

export function answersOn(progress, date = new Date()) {
  return progress.daily?.[localDateKey(date)] ?? 0;
}

export function weekActivity(progress, now = new Date()) {
  // Monday-first week containing `now`
  const d = new Date(now);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    const key = localDateKey(day);
    return { key, label: day.toLocaleDateString('en', { weekday: 'narrow' }), count: progress.daily?.[key] ?? 0, active: progress.activity.includes(key), today: key === localDateKey(now), future: day > now };
  });
}

export function activityGrid(progress, weeks = 12, now = new Date()) {
  const end = new Date(now);
  end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7))); // to Sunday
  const cells = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const day = new Date(end);
    day.setDate(end.getDate() - i);
    const key = localDateKey(day);
    cells.push({ key, count: progress.daily?.[key] ?? (progress.activity.includes(key) ? 1 : 0), future: day > now });
  }
  return cells;
}

export function masteryBreakdown(progress, allWords) {
  const counts = [0, 0, 0, 0, 0, 0];
  allWords.forEach((w) => counts[wordLevel(progress, w)]++);
  return counts; // index = box (0 = not started)
}

export function weakWords(progress, allWords, limit = 6) {
  return allWords
    .map((w) => ({ w, s: progress.words[w.id] }))
    // Only words that were missed at least once and are still in the first two boxes.
    .filter(({ s }) => s && s.seen > 0 && s.box <= 2 && s.correctCount < s.seen)
    .sort((a, b) => a.s.box - b.s.box || a.s.correctCount / a.s.seen - b.s.correctCount / b.s.seen)
    .slice(0, limit)
    .map(({ w }) => w);
}

// Match is a bonus game: it has a title and a route, but it is not one of the four lesson steps.
export const MODE_TITLES = { flashcards: 'Flashcards', choice: 'Multiple choice', typing: 'Typing', listening: 'Listening', match: 'Match' };
export const MODE_STEPS = { flashcards: 'Learn', choice: 'Recall', typing: 'Produce', listening: 'Listen' };
