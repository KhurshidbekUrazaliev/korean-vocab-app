import { describe, expect, it } from 'vitest';
import { shuffle } from '../shuffle.js';
import { buildMultipleChoice, checkTyped } from '../quiz.js';
import { schedule, getDueWords, INTERVAL_DAYS } from '../srs.js';
import { getStreak } from '../streak.js';
import { loadProgress, saveProgress, emptyProgress } from '../progress.js';

const words = [
  { id: 'a', korean: '외식', english: 'dining out' },
  { id: 'b', korean: '마늘', english: 'garlic' },
  { id: 'c', korean: '후식', english: 'dessert' },
  { id: 'd', korean: '야경', english: 'night view' },
  { id: 'e', korean: '취소하다', english: 'to cancel' },
];

describe('shuffle', () => {
  it('keeps every element and does not mutate', () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(src).toEqual([1, 2, 3, 4, 5]);
  });
  it('is roughly uniform', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 30000; i++) counts[shuffle([0, 1, 2])[0]]++;
    counts.forEach((c) => expect(c).toBeGreaterThan(9000));
  });
});

describe('buildMultipleChoice', () => {
  it('returns 4 unique options including the answer', () => {
    const q = buildMultipleChoice(words[0], words);
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
    expect(q.options.some((o) => o.id === q.answerId)).toBe(true);
    expect(q.prompt).toBe('외식');
  });
  it('flips direction', () => {
    const q = buildMultipleChoice(words[1], words, { direction: 'en-ko' });
    expect(q.prompt).toBe('garlic');
    expect(q.options.find((o) => o.id === 'b').label).toBe('마늘');
  });
});

describe('checkTyped', () => {
  it('accepts any listed meaning, ignoring case and a leading "to"', () => {
    expect(checkTyped('Cancel', words[4], { direction: 'ko-en' }).correct).toBe(true);
    expect(checkTyped('night view', words[3], { direction: 'ko-en' }).correct).toBe(true);
  });
  it('scores near misses as close but not correct', () => {
    const r = checkTyped('desert', words[2], { direction: 'ko-en' });
    expect(r.correct).toBe(false);
    expect(r.closeness).toBeGreaterThan(0.8);
  });
  it('rejects empty input', () => {
    expect(checkTyped('  ', words[0], { direction: 'ko-en' })).toEqual({ correct: false, closeness: 0 });
  });
});

describe('srs', () => {
  const now = new Date('2026-01-01T10:00:00Z');
  it('moves up a box on correct answers and back to 1 on a miss', () => {
    let s = schedule(undefined, true, now);
    expect(s.box).toBe(1);
    s = schedule(s, true, now);
    expect(s.box).toBe(2);
    expect(new Date(s.dueAt) - now).toBe(INTERVAL_DAYS[1] * 86_400_000);
    s = schedule(s, false, now);
    expect(s.box).toBe(1);
    expect(s.seen).toBe(3);
    expect(s.correctCount).toBe(2);
  });
  it('lists only due words', () => {
    const progress = { words: { a: { dueAt: '2025-12-31T00:00:00Z' }, b: { dueAt: '2026-02-01T00:00:00Z' } } };
    expect(getDueWords(progress, words, now).map((w) => w.id)).toEqual(['a']);
  });
});

describe('streak', () => {
  it('counts consecutive days ending today or yesterday', () => {
    const now = new Date(2026, 0, 10, 12);
    expect(getStreak({ activity: ['2026-01-08', '2026-01-09', '2026-01-10'] }, now)).toMatchObject({ current: 3, practicedToday: true });
    expect(getStreak({ activity: ['2026-01-08', '2026-01-09'] }, now)).toMatchObject({ current: 2, practicedToday: false });
    expect(getStreak({ activity: ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-09'] }, now)).toMatchObject({ current: 1, best: 3 });
  });
});

describe('progress storage', () => {
  const mem = () => {
    const m = new Map();
    return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  };
  it('round-trips and ignores unknown versions', () => {
    const s = mem();
    const p = { ...emptyProgress(), activity: ['2026-01-01'] };
    saveProgress(p, s);
    expect(loadProgress(s).activity).toEqual(['2026-01-01']);
    s.setItem('kv.progress.v1', JSON.stringify({ version: 99 }));
    expect(loadProgress(s)).toEqual(emptyProgress());
    s.setItem('kv.progress.v1', '{broken');
    expect(loadProgress(s)).toEqual(emptyProgress());
  });
});
