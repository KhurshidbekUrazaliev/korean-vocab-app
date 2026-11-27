// Soft feedback tones made with Web Audio (no files). Off when the user turns sound off.
const KEY = 'kv.sound';
let ctx = null;

export const soundOn = () => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
};
export const setSound = (on) => {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {}
};

function tone(freq, start, dur, gain = 0.08, type = 'sine') {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

export function feedback(kind) {
  if (typeof window === 'undefined') return;
  if (kind === 'right') navigator.vibrate?.(12);
  if (kind === 'wrong') navigator.vibrate?.([18, 40, 18]);
  if (!soundOn()) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (kind === 'right') {
      tone(784, 0, 0.18); // G5
      tone(1175, 0.07, 0.28, 0.06); // D6
    } else if (kind === 'wrong') {
      tone(196, 0, 0.22, 0.07, 'triangle');
    } else if (kind === 'done') {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.4, 0.05));
    }
  } catch {
    // Audio blocked: ignore.
  }
}
