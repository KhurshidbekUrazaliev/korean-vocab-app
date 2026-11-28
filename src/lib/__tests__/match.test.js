import { describe, expect, it } from 'vitest';
import { buildMatchRound, isPair } from '../match.js';

const words = [
  { id: 'ar-day01-01', term: 'مَرْحَبًا', english: 'hello' },
  { id: 'ar-day01-07', term: 'نَعَم', english: 'yes' },
  { id: 'ar-day01-08', term: 'لَا', english: 'no' },
  { id: 'ar-day01-09', term: 'رَجَاءً', english: 'please' },
  { id: 'ar-day01-10', term: 'آسِف', english: 'sorry' },
  { id: 'ar-day01-05', term: 'شُكْرًا', english: 'thank you' },
];
const keepOrder = () => 0.99;

describe('buildMatchRound', () => {
  it('draws five by default using the supplied source of randomness', () => {
    const unchanged = buildMatchRound(words, { random: keepOrder });
    const rotated = buildMatchRound(words, { random: () => 0 });
    expect(unchanged.left.map(({ id }) => id)).toEqual(words.slice(0, 5).map(({ id }) => id));
    expect(rotated).toEqual(buildMatchRound(words, { random: () => 0 }));
    expect(rotated.left.map(({ id }) => id).sort()).toEqual(words.slice(1).map(({ id }) => id).sort());

    for (const round of [unchanged, rotated]) {
      for (const leftCard of round.left) {
        const answers = round.right.filter((card) => isPair(leftCard.id, card.id));
        const word = words.find(({ id }) => id === leftCard.id);
        expect(leftCard.text).toBe(word.term);
        expect(answers).toEqual([{ id: word.id, text: word.english }]);
      }
    }
  });

  it('shuffles both columns independently and leaves the source words in order', () => {
    const pool = Object.freeze(words.slice(0, 3).map((word) => Object.freeze({ ...word })));
    const values = [0.99, 0.99, 0, 0, 0.99, 0][Symbol.iterator]();
    const round = buildMatchRound(pool, { pairs: 3, random: () => values.next().value });
    expect(round.left.map(({ text }) => text)).toEqual(['نَعَم', 'لَا', 'مَرْحَبًا']);
    expect(round.right.map(({ text }) => text)).toEqual(['yes', 'hello', 'no']);
  });

  it('supports Korean words before and after the data field rename', () => {
    const legacy = { id: 'day01-03', korean: '마늘', english: 'garlic' };
    const current = { id: legacy.id, term: legacy.korean, english: legacy.english };
    const expected = { left: [{ id: legacy.id, text: '마늘' }], right: [{ id: legacy.id, text: 'garlic' }] };
    expect(buildMatchRound([legacy])).toEqual(expected);
    expect(buildMatchRound([current])).toEqual(expected);
  });

  it('skips repeated ids or visible labels and keeps looking for usable pairs', () => {
    const garlic = { id: 'day01-03', term: '마늘', english: 'garlic' };
    const dessert = { id: 'day01-05', term: '후식', english: 'dessert' };
    const pool = [
      garlic,
      { ...words[0], id: garlic.id },
      { ...words[1], term: garlic.term.normalize('NFD') },
      { ...words[2], english: ' GARLIC ' },
      { ...words[3], term: '' },
      { ...words[4], english: ' ' },
      { ...words[5], id: '' },
      dessert,
    ];
    expect(buildMatchRound(pool, { pairs: 8, random: keepOrder })).toEqual({
      left: [{ id: garlic.id, text: garlic.term }, { id: dessert.id, text: dessert.term }],
      right: [{ id: garlic.id, text: garlic.english }, { id: dessert.id, text: dessert.english }],
    });
  });

  it('bounds a round by the requested size and available words', () => {
    const empty = { left: [], right: [] };
    expect(buildMatchRound([])).toEqual(empty);
    expect(buildMatchRound(words, { pairs: 0 })).toEqual(empty);
    expect(buildMatchRound(words, { pairs: -1 })).toEqual(empty);
    expect(buildMatchRound(words, { pairs: 2.5 }).left).toHaveLength(2);
    expect(buildMatchRound(words, { pairs: 10 }).right).toHaveLength(words.length);
  });
});

describe('isPair', () => {
  it('compares full word ids across courses and rejects missing selections', () => {
    expect(isPair('day01-01', 'day01-01')).toBe(true);
    expect(isPair('day01-01', 'ar-day01-01')).toBe(false);
    expect(isPair('ar-day01-01', 'ar-day01-02')).toBe(false);
    for (const missing of [null, undefined, '', ' ']) expect(isPair(missing, missing)).toBe(false);
  });
});
