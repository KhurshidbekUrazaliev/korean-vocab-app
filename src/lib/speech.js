import { clipFor } from '../data/index.js';

// Recorded clips (natural voice) play first. The device voice is the fallback.
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

export function rankVoice(voice, want = 'ko') {
  const lang = (voice.lang || '').replace('_', '-').toLowerCase();
  if (!lang.startsWith(want)) return -Infinity;
  let score = lang === `${want}-${want === 'ko' ? 'kr' : 'sa'}` ? 5 : 0;
  for (const [pattern, points] of QUALITY) if (pattern.test(voice.name)) score += points;
  if (voice.localService === false) score += 10;
  return score;
}

export function bestVoice(voices, want = 'ko') {
  let best = null;
  let bestScore = -Infinity;
  for (const v of voices) {
    const s = rankVoice(v, want);
    if (s > bestScore) [best, bestScore] = [v, s];
  }
  return best;
}
export const bestKoreanVoice = (voices) => bestVoice(voices, 'ko');

const voices = { ko: null, ar: null };
const SPEECH_LANG = { ko: 'ko-KR', ar: 'ar-SA' };
const langOfText = (text) => (/[\u0600-\u06FF]/.test(text) ? 'ar' : 'ko');

function pickVoice() {
  const all = window.speechSynthesis?.getVoices() ?? [];
  voices.ko = bestVoice(all, 'ko');
  voices.ar = bestVoice(all, 'ar');
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

const hasAudio = () => typeof window !== 'undefined' && typeof window.Audio === 'function';
const hasTTS = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
export const canSpeak = () => hasAudio() || hasTTS();

const clips = new Map();
let playing = null;
let playbackRequest = 0;

function clip(src) {
  let a = clips.get(src);
  if (!a) {
    a = new window.Audio(src);
    a.preload = 'auto';
    clips.set(src, a);
  }
  return a;
}

/** Start loading a word's clip before it is needed (hover, next card). */
export function warm(text, clipSrc) {
  const src = hasAudio() && (clipSrc ?? clipFor(text));
  if (src) clip(src);
}

function speakTTS(text, rate) {
  if (!hasTTS()) return false;
  const lang = langOfText(text);
  if (!voices[lang]) pickVoice();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = SPEECH_LANG[lang];
  u.rate = rate;
  if (voices[lang]) u.voice = voices[lang];
  window.speechSynthesis.speak(u);
  return true;
}

/**
 * Play a word: its recorded clip if there is one, otherwise the device voice.
 * `src` picks a clip directly (letters). `slow` replays at 70% speed, keeping the pitch.
 */
export function speak(text, { rate = 0.9, src: clipSrc, slow = false } = {}) {
  const request = ++playbackRequest;
  playing?.pause();
  playing = null;
  const src = hasAudio() && (clipSrc ?? clipFor(text));
  if (!src) return speakTTS(text, slow ? 0.6 : rate);
  if (hasTTS()) window.speechSynthesis.cancel();
  const a = clip(src);
  playing = a;
  try {
    a.currentTime = 0;
    a.playbackRate = slow ? 0.7 : 1;
    a.preservesPitch = true;
    a.play()?.catch(err => {
      // A second click can interrupt a pending play(), even on the same clip.
      if (request === playbackRequest && err?.name !== 'NotAllowedError') speakTTS(text, rate);
    });
    return true;
  } catch {
    return speakTTS(text, rate);
  }
}
