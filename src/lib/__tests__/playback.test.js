// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

async function player() {
  const requests = [];
  const speak = vi.fn();
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), getVoices: () => [], speak });
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text; } });
  vi.stubGlobal('Audio', class {
    play() { return new Promise((resolve, reject) => requests.push({ resolve, reject })); }
    pause() {}
  });
  const audio = await import('../speech.js');
  return { play: audio.speak, speak, requests };
}

it.each(['다양하다', '외식'])('ignores interrupted playback when the next request is %s', async next => {
  const { play, speak, requests } = await player();
  play('외식');
  play(next);
  requests[0].reject(new DOMException('interrupted', 'AbortError'));
  await Promise.resolve();
  expect(speak).not.toHaveBeenCalled();
  requests[1].reject(new Error('clip unavailable'));
  await Promise.resolve();
  expect(speak).toHaveBeenCalledTimes(1);
  expect(speak.mock.calls[0][0].text).toBe(next);
});

it('keeps autoplay denial silent and speaks unrecorded text only once', async () => {
  const { play, speak, requests } = await player();
  play('외식');
  requests[0].reject(new DOMException('gesture required', 'NotAllowedError'));
  await Promise.resolve();
  expect(speak).not.toHaveBeenCalled();
  play('외식');
  play('없는 단어');
  requests[1].reject(new Error('old clip unavailable'));
  await Promise.resolve();
  expect(speak.mock.calls.map(([u]) => u.text)).toEqual(['없는 단어']);
});
