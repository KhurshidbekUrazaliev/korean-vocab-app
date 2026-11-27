import { describe, expect, it, vi } from 'vitest';
import { shuffle } from '../shuffle.js';
import { buildMultipleChoice, checkTyped } from '../quiz.js';
import { schedule, getDueWords, INTERVAL_DAYS } from '../srs.js';
import { getStreak } from '../streak.js';
import { loadProgress, saveProgress, emptyProgress, localDateKey, PROGRESS_KEY } from '../progress.js';

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
    s.setItem(PROGRESS_KEY, JSON.stringify({ version: 99 }));
    expect(loadProgress(s)).toEqual(emptyProgress());
    s.setItem(PROGRESS_KEY, '{broken');
    expect(loadProgress(s)).toEqual(emptyProgress());
  });
  it('preserves activity, unchanged lessons and same-sense words without reusing replaced positions', () => {
    const storage = mem();
    const state = { seen: 4, correctCount: 3, box: 2, dueAt: '2026-12-01T00:00:00.000Z' };
    const score = { best: 80, modes: ['typing'], lastAt: '2026-11-21T10:00:00.000Z' };
    const activity = ['2026-11-20', '2026-11-21'];
    const legacy = JSON.stringify({
      version: 1, activity, days: { day15: score, day17: score },
      words: { 'day15-10': state, 'day17-03': state, 'day21-03': state, 'day16-01': state },
    });
    storage.setItem('kv.progress.v1', legacy);
    const migrated = loadProgress(storage);
    expect(migrated).toEqual({
      version: 2, activity, daily: {}, days: { day15: score },
      words: { 'day15-10': state, 'day27-07': state }, // 증상 moved from Day 17 to Day 27
    });
    expect(storage.getItem('kv.progress.v1')).toBe(legacy);
    expect(JSON.parse(storage.getItem(PROGRESS_KEY))).toEqual(migrated);
    migrated.words['day16-01'] = { ...state, seen: 1 };
    saveProgress(migrated, storage);
    expect(loadProgress(storage)).toEqual(migrated);
  });
  it('keeps migrated progress available when the browser refuses to write it', () => {
    const legacy = JSON.stringify({ version: 1, activity: ['2026-11-21'] });
    const storage = {
      getItem: (key) => key === 'kv.progress.v1' ? legacy : null,
      setItem: () => { throw new Error('Storage full'); },
    };
    expect(loadProgress(storage)).toEqual({ ...emptyProgress(), activity: ['2026-11-21'] });
  });
  it('combines both live curricula, including daily goals, without double-counting shared history', () => {
    const storage = mem();
    const first = '2026-11-26';
    const second = '2026-11-27';
    const earlier = { box: 5, dueAt: '2026-12-12T12:00:00Z', seen: 6, correctCount: 5 };
    const latest = { box: 1, dueAt: '2026-11-27T12:00:00Z', seen: 5, correctCount: 3 };
    const prDay = { best: 80, modes: ['flashcards'], lastAt: first + 'T12:00:00Z' };
    const mainDay = { best: 60, modes: ['choice'], lastAt: second + 'T12:00:00Z' };
    const main = JSON.stringify({
      version: 1, activity: [first, second], daily: { [second]: 12 },
      days: { day01: mainDay, day16: mainDay }, words: { 'day17-03': latest, 'day16-01': latest },
    });
    storage.setItem('kv.progress.v1', main);
    // The previous PR deployment saved the revised word positions before daily counts existed.
    storage.setItem(PROGRESS_KEY, JSON.stringify({
      version: 2, activity: [first], days: { day01: prDay, day16: prDay },
      words: { 'day27-07': earlier, 'day16-01': earlier }, marker: 'existing metadata',
    }));
    const combined = loadProgress(storage);
    expect(combined).toEqual({
      version: 2, activity: [first, second], daily: { [second]: 12 }, marker: 'existing metadata',
      days: {
        day01: { best: 80, modes: ['flashcards', 'choice'], lastAt: mainDay.lastAt },
        day16: prDay,
      },
      words: { 'day27-07': { ...latest, seen: 6, correctCount: 5 }, 'day16-01': earlier },
    });
    expect(loadProgress(storage)).toEqual(combined);
    expect(storage.getItem('kv.progress.v1')).toBe(main);
  });
  it('keeps revised progress when archived data is malformed and still imports intact daily counts', () => {
    const storage = mem();
    const word = { seen: 3, correctCount: 2, box: 1, dueAt: '2026-11-26T12:00:00Z' };
    const day = { best: 90, modes: ['typing'] };
    const current = { ...emptyProgress(), words: { 'day01-01': word }, days: { day01: day } };
    saveProgress(current, storage);
    storage.setItem('kv.progress.v1', '{broken');
    expect(loadProgress(storage)).toEqual(current);
    storage.setItem('kv.progress.v1', JSON.stringify({
      version: 1, activity: {}, daily: { '2026-11-27': 4, '2026-11-28': 'oops' },
      days: { day01: { best: 80, modes: false } }, words: { 'day01-01': { ...word, seen: 'oops' } },
    }));
    expect(loadProgress(storage)).toEqual({ ...current, daily: { '2026-11-27': 4 } });
  });
  it('continues recording answers, daily goals and modes on the revised word IDs', async () => {
    const storage = mem();
    const today = localDateKey();
    storage.setItem('kv.progress.v1', JSON.stringify({ version: 1, daily: { [today]: 7 } }));
    vi.stubGlobal('window', new EventTarget());
    vi.stubGlobal('localStorage', storage);
    try {
      const { progressStore } = await import('../../hooks/useProgress.js');
      progressStore.recordAnswer('day16-01', true);
      progressStore.recordSession('day16', 'flashcards', 8, 10);
      expect(loadProgress(storage)).toEqual(progressStore.get());
      expect(progressStore.get()).toMatchObject({
        version: 2, words: { 'day16-01': { seen: 1, correctCount: 1 } },
        activity: [today], daily: { [today]: 8 },
        days: { day16: { best: 80, modes: ['flashcards'] } },
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
