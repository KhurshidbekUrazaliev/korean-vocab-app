import { describe, expect, it } from 'vitest';
import { dayStatus, currentDay, weakWords, masteryBreakdown, weekActivity, answersOn } from '../stats.js';
import { emptyProgress, localDateKey } from '../progress.js';

const mkDay = (n) => ({ id: `day0${n}`, number: n, words: Array.from({ length: 10 }, (_, i) => ({ id: `day0${n}-${i}`, korean: `w${n}${i}` })) });
const days = [mkDay(1), mkDay(2), mkDay(3)];
const all = days.flatMap((d) => d.words);

describe('stats', () => {
  it('reports a new day', () => {
    const s = dayStatus(emptyProgress(), days[0]);
    expect(s).toMatchObject({ state: 'new', nextMode: 'flashcards', learned: 0, mastery: 0 });
  });
  it('tracks modes, learned and mastered words', () => {
    const p = emptyProgress();
    p.days.day01 = { modes: ['flashcards', 'choice'], best: 80, lastAt: '2026-01-02T00:00:00Z' };
    days[0].words.forEach((w, i) => (p.words[w.id] = { box: i < 3 ? 5 : 1, seen: 2, correctCount: i < 3 ? 2 : 0 }));
    const s = dayStatus(p, days[0]);
    expect(s).toMatchObject({ state: 'active', nextMode: 'typing', learned: 3, mastered: 3, best: 80 });
  });
  it('continues the most recently touched unfinished day', () => {
    const p = emptyProgress();
    p.days.day01 = { modes: ['flashcards'], lastAt: '2026-01-01T00:00:00Z' };
    p.days.day02 = { modes: ['flashcards'], lastAt: '2026-01-03T00:00:00Z' };
    expect(currentDay(p, days).id).toBe('day02');
    p.days.day02.modes = ['flashcards', 'choice', 'typing', 'listening'];
    expect(currentDay(p, days).id).toBe('day01');
    expect(currentDay(emptyProgress(), days).id).toBe('day01');
  });
  it('finds weak words and the box breakdown', () => {
    const p = emptyProgress();
    p.words[all[0].id] = { box: 1, seen: 3, correctCount: 0 };
    p.words[all[1].id] = { box: 5, seen: 5, correctCount: 5 };
    expect(weakWords(p, all).map((w) => w.id)).toEqual([all[0].id]);
    expect(masteryBreakdown(p, all)).toEqual([28, 1, 0, 0, 0, 1]);
  });
  it('builds a Monday-first week and counts answers today', () => {
    const now = new Date(2026, 10, 27, 12); // Friday
    const p = { ...emptyProgress(), activity: [localDateKey(now)], daily: { [localDateKey(now)]: 7 } };
    const week = weekActivity(p, now);
    expect(week).toHaveLength(7);
    expect(week[0].label).toBe('M');
    expect(week[4]).toMatchObject({ today: true, active: true, count: 7 });
    expect(answersOn(p, now)).toBe(7);
  });
});
