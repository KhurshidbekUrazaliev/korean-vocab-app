import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { days, allWords, clipFor } from './index.js';

describe('vocabulary data', () => {
  it('has days 1..N in order with 10 words each', () => {
    days.forEach((d, i) => {
      expect(d.number).toBe(i + 1);
      expect(d.words).toHaveLength(10);
      expect(['verified', 'reviewed', 'draft']).toContain(d.status);
    });
  });
  it('has a recorded clip for every word (scripts/make-audio.py)', () => {
    const missing = allWords.filter((w) => !existsSync(new URL(`../../public/audio/${w.id}.mp3`, import.meta.url)));
    expect(missing.map((w) => w.id)).toEqual([]);
    expect(clipFor(allWords[0].korean)).toBe(`/audio/${allWords[0].id}.mp3`);
    expect(clipFor('없는 단어')).toBeNull();
  });
  it('has unique word ids and no repeated Korean words', () => {
    expect(new Set(allWords.map((w) => w.id)).size).toBe(allWords.length);
    expect(new Set(allWords.map((w) => w.korean)).size).toBe(allWords.length);
  });
  it('publishes reviewed vocabulary and distinct quiz answers for Days 16–50', () => {
    const illustratedLessons = days.filter((day) => day.number >= 16 && day.number <= 50);
    expect(illustratedLessons).toHaveLength(35);
    for (const day of illustratedLessons) {
      expect(day.status).toBe('reviewed');
      expect(day.source).toBe('generated');
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
