// Browsers often list an old robotic Korean voice first and a neural one further down
// (Edge "Online (Natural)", Chrome "Google 한국의", Apple "Premium"/"Enhanced"), so rank them.
const QUALITY = [
  [/natural|neural/i, 100],
  [/premium/i, 90],
  [/enhanced/i, 80],
  [/google/i, 70],
  [/siri/i, 60],
  [/online/i, 40],
  [/heami|compact|espeak/i, -50],
];

export function rankVoice(voice) {
  const lang = (voice.lang || '').replace('_', '-').toLowerCase();
  if (!lang.startsWith('ko')) return -Infinity;
  let score = lang === 'ko-kr' ? 5 : 0;
  for (const [pattern, points] of QUALITY) if (pattern.test(voice.name)) score += points;
  if (voice.localService === false) score += 10;
  return score;
}

export function bestKoreanVoice(voices) {
  let best = null;
  let bestScore = -Infinity;
  for (const v of voices) {
    const s = rankVoice(v);
    if (s > bestScore) [best, bestScore] = [v, s];
  }
  return best;
}

let koreanVoice = null;

function pickVoice() {
  koreanVoice = bestKoreanVoice(window.speechSynthesis?.getVoices() ?? []);
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text, { rate = 0.9 } = {}) {
  if (!canSpeak()) return false;
  if (!koreanVoice) pickVoice();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = rate;
  if (koreanVoice) u.voice = koreanVoice;
  window.speechSynthesis.speak(u);
  return true;
}
