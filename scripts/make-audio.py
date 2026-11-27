"""Record every vocabulary word to public/audio/<word id>.mp3.

Voice: Supertonic 3 (Supertone), an open text-to-speech model that runs on the CPU.
Model weights are under the BigScience Open RAIL-M license; generated audio is ours to use.

Dev-only. Setup, once:
    python3 -m venv .venv-audio && .venv-audio/bin/pip install supertonic soundfile numpy
    # optional, for --check: .venv-audio/bin/pip install faster-whisper
Run:
    .venv-audio/bin/python scripts/make-audio.py            # only words without a clip
    .venv-audio/bin/python scripts/make-audio.py --force    # redo every clip
    .venv-audio/bin/python scripts/make-audio.py --check    # transcribe each clip; re-record misheard words
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
FALLBACK_VOICE = 'F2'  # closest-sounding voice, used only for words the main voice says unclearly
STEPS = 16  # more denoising steps than the default 8: cleaner, still about 1 s per word
SPEED = 0.9  # a little slower than conversational, for learners


def load_words():
    words = []
    for path in sorted(glob.glob(os.path.join(ROOT, 'src', 'data', 'days', 'day*.json'))):
        with open(path, encoding='utf-8') as f:
            words += json.load(f)['words']
    return words


def trim(audio, sr, threshold=0.002, pad=0.08):
    """Cut the model's silent lead-in and tail, keep a short pad, and fade the edges.

    Uses a 10 ms loudness envelope with a low threshold: the model's silence is near zero,
    and a per-sample cut-off clips quiet onsets such as the hiss of ㅅ in 셔터.
    """
    frame = max(1, int(0.01 * sr))
    env = np.sqrt(np.convolve(audio**2, np.ones(frame) / frame, mode='same'))
    loud = np.flatnonzero(env > threshold)
    if loud.size:
        start = max(0, loud[0] - int(pad * sr))
        end = min(len(audio), loud[-1] + int(pad * sr))
        audio = audio[start:end].copy()
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


# Whisper writes some correctly spoken words with a different spelling of the same sound
# (final-consonant neutralization, ㅐ/ㅔ merger, linking, tensing, weak ㅎ). These count as heard.
SOUNDS_LIKE = {
    '볶다': ['복다'], '깎다': ['깍다'], '짖다': ['짓다', '짙다'], '쟤': ['제', '재'], '헹구다': ['행구다'],
    '머그잔': ['먹으잔'], '꾸미다': ['꿈이다'], '문고리': ['문꼬리'], '공구함': ['공구암'],
    '알약': ['알략'], '산기슭': ['산기슥'],
}

# The model reads spelling literally. Where standard pronunciation (표준 발음법) differs,
# give it the pronounced form: ㄴ-insertion + liquidization in 알약, ㄺ → [ㄱ] in 산기슭.
SAY = {'알약': '알략', '산기슭': '산기슥'}


def norm(text):
    return re.sub(r'[\s.,!?~]', '', text)


class Listener:
    """Transcribes a clip with Whisper (large-v3-turbo, CPU)."""

    def __init__(self):
        from faster_whisper import WhisperModel

        self.model = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')

    def hears(self, path, korean):
        audio, sr = sf.read(path, dtype='float32')
        n = int(len(audio) * 16000 / sr)
        audio = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype('float32')
        segs, _ = self.model.transcribe(audio, language='ko', beam_size=5, condition_on_previous_text=False)
        heard = norm(''.join(s.text for s in segs))
        return heard in [norm(korean), *map(norm, SOUNDS_LIKE.get(korean, []))], heard


def record(tts, style, korean, path):
    wav, _ = tts.synthesize(SAY.get(korean, korean), style, lang='ko', total_steps=STEPS, speed=SPEED)
    audio = np.asarray(wav, dtype=np.float32).squeeze()
    encode(level(trim(audio, 44100)), 44100, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true', help='redo clips that already exist')
    ap.add_argument('--check', action='store_true', help='transcribe each clip and re-record mismatches')
    ap.add_argument('--tries', type=int, default=4, help='recording attempts per word with --check')
    ap.add_argument('--voice', default=VOICE)
    ap.add_argument('--only', nargs='*', help='word ids to (re)record')
    args = ap.parse_args()

    from supertonic import TTS

    tts = TTS(model='supertonic-3')
    style = tts.get_voice_style(args.voice)
    fallback = tts.get_voice_style(FALLBACK_VOICE)
    listener = Listener() if args.check else None
    os.makedirs(OUT, exist_ok=True)
    words = load_words()
    if args.only:
        words = [w for w in words if w['id'] in args.only]

    made, unclear = 0, []
    for i, w in enumerate(words, 1):
        path = os.path.join(OUT, f"{w['id']}.mp3")
        if args.force or args.only or not os.path.exists(path):
            record(tts, style, w['korean'], path)
            made += 1
        if listener:
            ok, heard = listener.hears(path, w['korean'])
            # Synthesis varies from run to run, so a misheard word gets fresh attempts,
            # first in the main voice, then in the fallback voice.
            for n in range(2 * args.tries - 1):
                if ok:
                    break
                attempt = path + '.try.mp3'
                record(tts, style if n < args.tries - 1 else fallback, w['korean'], attempt)
                ok, heard = listener.hears(attempt, w['korean'])
                if ok:
                    os.replace(attempt, path)
                    made += 1
                    if n >= args.tries - 1:
                        print(f"  {w['id']} {w['korean']}: {FALLBACK_VOICE} voice", flush=True)
                else:
                    os.remove(attempt)
            if not ok:
                unclear.append((w['id'], w['korean'], heard))
        if i % 50 == 0:
            print(f'{i}/{len(words)}', flush=True)

    print(f'recorded {made} clips, {len(words)} words, voice {args.voice}')
    if listener:
        print(f'{len(words) - len(unclear)}/{len(words)} heard as written')
        for wid, korean, heard in unclear:
            print(f'  {wid}  {korean}  heard: {heard}')


if __name__ == '__main__':
    main()
