"""Record every vocabulary word to public/audio/<word id>.mp3.

Voice: Supertonic 3 (Supertone), an open text-to-speech model that runs on the CPU.
Model weights are under the BigScience Open RAIL-M license; generated audio is ours to use.

Dev-only. Setup, once:
    python3 -m venv .venv-audio && .venv-audio/bin/pip install supertonic soundfile numpy
    # optional, for --check: .venv-audio/bin/pip install faster-whisper
Run:
    .venv-audio/bin/python scripts/make-audio.py            # only words without a clip
    .venv-audio/bin/python scripts/make-audio.py --force    # redo every clip
    .venv-audio/bin/python scripts/make-audio.py --check    # also transcribe each clip and report mismatches
Needs ffmpeg with libmp3lame on PATH.
"""

import argparse
import glob
import json
import os
import re
import subprocess
import tempfile

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'audio')
VOICE = 'F1'
STEPS = 16  # more denoising steps than the default 8: cleaner, still about 1 s per word
SPEED = 0.9  # a little slower than conversational, for learners


def load_words():
    words = []
    for path in sorted(glob.glob(os.path.join(ROOT, 'src', 'data', 'days', 'day*.json'))):
        with open(path, encoding='utf-8') as f:
            words += json.load(f)['words']
    return words


def trim(audio, sr, threshold=0.012, pad=0.06):
    """Cut silence at both ends, keep a short pad, and fade the edges to avoid clicks."""
    loud = np.flatnonzero(np.abs(audio) > threshold)
    if loud.size:
        start = max(0, loud[0] - int(pad * sr))
        end = min(len(audio), loud[-1] + int(pad * sr))
        audio = audio[start:end]
    fade = min(len(audio) // 4, int(0.012 * sr))
    if fade:
        ramp = np.linspace(0, 1, fade, dtype=audio.dtype)
        audio[:fade] *= ramp
        audio[-fade:] *= ramp[::-1]
    return audio


def level(audio, target_rms=0.1, peak=0.89):
    """Even loudness across clips without clipping."""
    rms = float(np.sqrt(np.mean(audio**2))) or 1.0
    audio = audio * (target_rms / rms)
    top = float(np.max(np.abs(audio))) or 1.0
    return audio * min(1.0, peak / top)


def encode(audio, sr, path):
    with tempfile.NamedTemporaryFile(suffix='.wav') as wav:
        sf.write(wav.name, audio, sr)
        subprocess.run(
            ['ffmpeg', '-v', 'error', '-y', '-i', wav.name, '-ac', '1', '-ar', '24000',
             '-c:a', 'libmp3lame', '-b:a', '48k', '-map_metadata', '-1', path],
            check=True,
        )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--voice', default=VOICE)
    ap.add_argument('--only', nargs='*', help='word ids to (re)record')
    args = ap.parse_args()

    from supertonic import TTS

    tts = TTS(model='supertonic-3')
    style = tts.get_voice_style(args.voice)
    os.makedirs(OUT, exist_ok=True)
    words = load_words()
    if args.only:
        words = [w for w in words if w['id'] in args.only]

    made = 0
    for w in words:
        path = os.path.join(OUT, f"{w['id']}.mp3")
        if os.path.exists(path) and not (args.force or args.only):
            continue
        wav, _ = tts.synthesize(w['korean'], style, lang='ko', total_steps=STEPS, speed=SPEED)
        audio = np.asarray(wav, dtype=np.float32).squeeze()
        encode(level(trim(audio, 44100)), 44100, path)
        made += 1
    print(f'recorded {made} clips, {len(words)} words total, voice {args.voice}')

    if args.check:
        check(words)


def check(words):
    """Transcribe each clip with Whisper and list words it hears differently."""
    from faster_whisper import WhisperModel

    model = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')
    norm = lambda s: re.sub(r'[\s.,!?~]', '', s)
    misses = []
    for w in words:
        audio, sr = sf.read(os.path.join(OUT, f"{w['id']}.mp3"), dtype='float32')
        n = int(len(audio) * 16000 / sr)
        audio = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype('float32')
        segs, _ = model.transcribe(audio, language='ko', beam_size=5, condition_on_previous_text=False)
        heard = ''.join(s.text for s in segs).strip()
        if norm(heard) != norm(w['korean']):
            misses.append({'id': w['id'], 'korean': w['korean'], 'heard': heard})
    print(f'{len(words) - len(misses)}/{len(words)} clips transcribed exactly')
    for m in misses:
        print(f"  {m['id']}  {m['korean']}  heard: {m['heard']}")


if __name__ == '__main__':
    main()
