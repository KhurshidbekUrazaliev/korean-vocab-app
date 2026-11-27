import { describe, expect, it } from 'vitest';
import { bestKoreanVoice } from '../speech.js';

const v = (name, lang = 'ko-KR', localService = true) => ({ name, lang, localService });

describe('bestKoreanVoice', () => {
  it('prefers a neural voice over an older one listed first', () => {
    const voices = [v('Microsoft Heami - Korean (Korean)'), v('Samantha', 'en-US'), v('Microsoft SunHi Online (Natural) - Korean (Korea)', 'ko-KR', false)];
    expect(bestKoreanVoice(voices).name).toMatch(/SunHi/);
  });
  it('prefers Apple Premium and Google voices over the basic one', () => {
    expect(bestKoreanVoice([v('Yuna'), v('Yuna (Premium)')]).name).toBe('Yuna (Premium)');
    expect(bestKoreanVoice([v('Yuna'), v('Google 한국의', 'ko-KR', false)]).name).toBe('Google 한국의');
  });
  it('ignores non-Korean voices and handles none', () => {
    expect(bestKoreanVoice([v('Samantha', 'en-US')])).toBeNull();
    expect(bestKoreanVoice([])).toBeNull();
    expect(bestKoreanVoice([v('Android', 'ko_KR')]).name).toBe('Android');
  });
});
