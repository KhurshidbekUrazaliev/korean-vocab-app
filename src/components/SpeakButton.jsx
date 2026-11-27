import { useState } from 'react';
import { speak, canSpeak } from '../lib/speech.js';
import { Speaker } from './Icons.jsx';

export function SpeakButton({ text, label, className = 'icon-btn', size = 20 }) {
  const [playing, setPlaying] = useState(false);
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      className={className}
      data-playing={playing}
      aria-label={label ?? `Play pronunciation of ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
        setPlaying(true);
        setTimeout(() => setPlaying(false), 900);
      }}
    >
      <Speaker width={size} height={size} />
    </button>
  );
}
