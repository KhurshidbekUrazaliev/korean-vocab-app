import { describe, expect, it } from 'vitest';
import { ALL_WORDS } from '../../data/index.js';
import { checkTyped } from '../quiz.js';

const english = { direction: 'ko-en' };

describe('typed English definitions', () => {
  it('accepts every definition exactly as it appears on the flashcards of both courses', () => {
    const rejected = ALL_WORDS.filter((word) => !checkTyped(word.english, word, english).correct);
    expect(rejected.map((word) => word.id)).toEqual([]);
  });

  it('also accepts individual meanings, with optional infinitives and surrounding whitespace', () => {
    const word = { term: '제안하다', english: 'to suggest, to propose / to put forward; to recommend' };
    for (const answer of ['suggest', 'propose', 'put forward', ' TO RECOMMEND ']) {
      expect(checkTyped(answer, word, english)).toEqual({ correct: true, closeness: 1 });
    }
    expect(checkTyped('to reject', word, english).closeness).toBeLessThan(0.8);
  });

  it('applies the existing near-miss scoring to the full definition', () => {
    const word = { term: '일정', english: 'schedule, itinerary' };
    const result = checkTyped('schedule, itineray', word, english);
    expect(result.correct).toBe(false);
    expect(result.closeness).toBeGreaterThanOrEqual(0.8);
  });
});
