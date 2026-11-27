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
  it('provides distinct answer labels for every illustrated lesson quiz', () => {
    const illustratedLessons = days.filter((day) => day.number >= 16 && day.number <= 50);
    expect(illustratedLessons).toHaveLength(35);
    for (const day of illustratedLessons) {
      expect(day.cover).toBe(`images/days/${day.id}.webp`);
      for (const field of ['english', 'korean']) {
        const labels = day.words.map((word) => word[field].trim().toLowerCase());
        expect(new Set(labels).size).toBe(day.words.length);
      }
    }
  });
  it('fills every field', () => {
    allWords.forEach((w) => {
      expect(w.korean).toMatch(/[가-힣]/);
      expect(w.romanization).toMatch(/^[a-z' -]+$/);
      expect(w.english.length).toBeGreaterThan(1);
    });
  });
});
