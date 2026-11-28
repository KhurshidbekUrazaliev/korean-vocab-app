import { useRef, useState } from 'react';
import { speak, canSpeak, warm } from '../lib/speech.js';
import { Speaker } from './Icons.jsx';

/** Plays a word. Tapping again within a few seconds replays it slowly. */
export function SpeakButton({ text, src, label, className = 'icon-btn', size = 20 }) {
  const [playing, setPlaying] = useState(null);
  const last = useRef(0);
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      className={className}
      data-playing={Boolean(playing)}
      data-slow={playing === 'slow'}
      aria-label={label ?? `Play pronunciation of ${text}`}
      title="Tap again to hear it slowly"
      onPointerEnter={() => warm(text, src)}
      onFocus={() => warm(text, src)}
      onClick={(e) => {
        e.stopPropagation();
        const slow = Date.now() - last.current < 3000;
        last.current = slow ? 0 : Date.now();
        speak(text, { src, slow });
        setPlaying(slow ? 'slow' : 'normal');
        setTimeout(() => setPlaying(null), slow ? 1400 : 900);
      }}
    >
      <Speaker width={size} height={size} />
    </button>
  );
}
