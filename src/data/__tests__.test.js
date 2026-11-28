import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALL_WORDS, COURSES, clipFor, courseFromPath, switchPath } from './index.js';

const hasClip = (id) => existsSync(new URL(`../../public/audio/${id}.mp3`, import.meta.url));

describe.each(Object.values(COURSES))('$name course data', (course) => {
  const { days, allWords } = course;
  it('has days 1..50 in order with 10 words each', () => {
    expect(days).toHaveLength(50);
    days.forEach((d, i) => {
      expect(d.number).toBe(i + 1);
      expect(d.course).toBe(course.id);
      expect(d.words).toHaveLength(10);
      expect(['verified', 'reviewed', 'draft']).toContain(d.status);
    });
  });
  it('has unique ids and no repeated words', () => {
    expect(new Set(allWords.map((w) => w.id)).size).toBe(allWords.length);
    expect(new Set(allWords.map((w) => w.term)).size).toBe(allWords.length);
  });
  it('gives every day distinct answers for the quiz', () => {
    for (const day of days) {
      for (const field of ['english', 'term']) {
        expect(new Set(day.words.map((w) => w[field].trim().toLowerCase())).size).toBe(day.words.length);
      }
    }
  });
  it('fills every field in the right script', () => {
    const script = course.id === 'ar' ? /[؀-ۿ]/ : /[가-힣]/;
    allWords.forEach((w) => {
      expect(w.term).toMatch(script);
      expect(w.romanization).toMatch(/^[a-z'‘’ -]+$/);
      expect(w.english.length).toBeGreaterThan(1);
    });
  });
  it('has a recorded clip for every word and letter (scripts/make-audio.py)', () => {
    const letters = course.letters.flatMap((g) => g.items);
    expect([...allWords, ...letters].filter((w) => !hasClip(w.id)).map((w) => w.id)).toEqual([]);
  });
});

describe('course registry', () => {
  it('keeps word and day ids distinct across courses', () => {
    expect(new Set(ALL_WORDS.map((w) => w.id)).size).toBe(ALL_WORDS.length);
    expect(COURSES.ar.days.every((d) => d.id.startsWith('ar-'))).toBe(true);
  });
  it('finds clips by term', () => {
    const [ko, ar] = [COURSES.ko.allWords[0], COURSES.ar.allWords[0]];
    expect(clipFor(ko.term)).toBe(`/audio/${ko.id}.mp3`);
    expect(clipFor(ar.term)).toBe(`/audio/${ar.id}.mp3`);
    expect(clipFor('없는 단어')).toBeNull();
  });
  it('maps routes between courses', () => {
    expect(courseFromPath('/ar/day/3').id).toBe('ar');
    expect(courseFromPath('/arabic').id).toBe('ko');
    expect(switchPath('/day/7/practice/choice', COURSES.ar)).toBe('/ar/day/7/practice/choice');
    expect(switchPath('/ar', COURSES.ko)).toBe('/');
    expect(switchPath('/', COURSES.ar)).toBe('/ar');
  });
  it('keeps the Korean lists for Days 16–50 reviewed and illustrated', () => {
    for (const day of COURSES.ko.days.filter((d) => d.number >= 16)) {
      expect(day.status).toBe('reviewed');
      expect(day.cover).toBe(`images/days/${day.id}.webp`);
    }
  });
});
