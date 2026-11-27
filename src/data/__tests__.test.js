import { describe, expect, it } from 'vitest';
import { days, allWords } from './index.js';

describe('vocabulary data', () => {
  it('has days 1..N in order with 10 words each', () => {
    days.forEach((d, i) => {
      expect(d.number).toBe(i + 1);
      expect(d.words).toHaveLength(10);
      expect(['verified', 'draft']).toContain(d.status);
    });
  });
  it('has unique word ids and no repeated Korean words', () => {
    expect(new Set(allWords.map((w) => w.id)).size).toBe(allWords.length);
    expect(new Set(allWords.map((w) => w.korean)).size).toBe(allWords.length);
  });
  it('fills every field', () => {
    allWords.forEach((w) => {
      expect(w.korean).toMatch(/[가-힣]/);
      expect(w.romanization).toMatch(/^[a-z' -]+$/);
      expect(w.english.length).toBeGreaterThan(1);
    });
  });
});
