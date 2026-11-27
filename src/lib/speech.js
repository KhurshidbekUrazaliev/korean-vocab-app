let koreanVoice = null;

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  koreanVoice = voices.find((v) => v.lang === 'ko-KR') ?? voices.find((v) => v.lang.startsWith('ko')) ?? null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text, { rate = 0.9 } = {}) {
  if (!canSpeak()) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = rate;
  if (koreanVoice) u.voice = koreanVoice;
  window.speechSynthesis.speak(u);
  return true;
}
