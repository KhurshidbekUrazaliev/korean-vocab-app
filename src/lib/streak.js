import { localDateKey } from './progress.js';

/** progress.activity holds local date keys (YYYY-MM-DD) of days with practice. */
export function getStreak(progress, now = new Date()) {
  const active = new Set(progress.activity);
  const day = new Date(now);
  const practicedToday = active.has(localDateKey(day));
  if (!practicedToday) day.setDate(day.getDate() - 1);
  let current = 0;
  while (active.has(localDateKey(day))) {
    current++;
    day.setDate(day.getDate() - 1);
  }
  const sorted = [...active].sort();
  let best = 0, run = 0, prev = null;
  for (const key of sorted) {
    const d = new Date(`${key}T12:00:00`);
    run = prev && (d - prev) / 86_400_000 < 1.5 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best: Math.max(best, current), practicedToday };
}
