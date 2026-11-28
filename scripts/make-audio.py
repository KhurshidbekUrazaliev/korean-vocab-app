"""Record every vocabulary word of a course to public/audio/<word id>.mp3.

Voice: Supertonic 3 (Supertone), an open text-to-speech model that runs on the CPU.
Model weights are under the BigScience Open RAIL-M license; generated audio is ours to use.

Dev-only. Setup, once:
    python3 -m venv .venv-audio && .venv-audio/bin/pip install supertonic soundfile numpy
    # optional, for --check: .venv-audio/bin/pip install faster-whisper
Run:
    .venv-audio/bin/python scripts/make-audio.py --course ar   # Arabic (default: ko)
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


def load_words(course):
    folder = os.path.join(ROOT, 'src', 'data', course)
    words = []
    for path in sorted(glob.glob(os.path.join(folder, 'day*.json'))):
        with open(path, encoding='utf-8') as f:
            words += json.load(f)['words']
    for w in words:
        w.setdefault('term', w.get('korean'))
    # Letters page: each letter is spoken in a syllable (Korean) or by its name (Arabic).
    letters = os.path.join(folder, 'letters.json')
    if os.path.exists(letters):
        with open(letters, encoding='utf-8') as f:
            words += [item for group in json.load(f)['groups'] for item in group['items']]
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

# Whisper writes Arabic number words as digits.
SOUNDS_LIKE_AR = {
    'واحد': ['1'], 'اثنان': ['2'], 'ثلاثه': ['3'], 'اربعه': ['4'], 'خمسه': ['5'],
    'سته': ['6'], 'سبعه': ['7'], 'ثمانيه': ['8'], 'تسعه': ['9'], 'عشره': ['10'],
}

# The model reads spelling literally. Where standard pronunciation (표준 발음법) differs,
# give it the pronounced form: ㄴ-insertion + liquidization in 알약, ㄺ → [ㄱ] in 산기슭.
SAY = {'알약': '알략', '산기슭': '산기슥'}


def norm(text):
    return re.sub(r'[\s.,!?~،؟!]', '', text)


ARABIC_MARKS = re.compile(r'[\u064B-\u0652\u0670\u0640]')


def norm_ar(text):
    """Whisper writes Arabic without vowel marks and with loose hamza and ta marbuta spelling."""
    text = ARABIC_MARKS.sub('', norm(text))
    text = re.sub('[أإآٱ]', 'ا', text).replace('ة', 'ه').replace('ى', 'ي').replace('ؤ', 'و').replace('ئ', 'ي')
    return re.sub(r'ا$', '', text)  # final alef of -an (شكرًا / شكر)


class Listener:
    """Transcribes a clip with Whisper (large-v3-turbo, CPU)."""

    def __init__(self, lang):
        from faster_whisper import WhisperModel

        self.lang = lang
        self.model = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')

    def hears(self, path, term):
        audio, sr = sf.read(path, dtype='float32')
        n = int(len(audio) * 16000 / sr)
        audio = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype('float32')
        segs, _ = self.model.transcribe(audio, language=self.lang, beam_size=5, condition_on_previous_text=False)
        heard = ''.join(s.text for s in segs)
        if self.lang == 'ar':
            ok = norm_ar(heard) in [norm_ar(term), *SOUNDS_LIKE_AR.get(norm_ar(term), [])]
            return ok, heard.strip()
        heard = norm(heard)
        return heard in [norm(term), *map(norm, SOUNDS_LIKE.get(term, []))], heard


def record(tts, style, term, path, lang):
    wav, _ = tts.synthesize(SAY.get(term, term), style, lang=lang, total_steps=STEPS, speed=SPEED)
    audio = np.asarray(wav, dtype=np.float32).squeeze()
    encode(level(trim(audio, 44100)), 44100, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true', help='redo clips that already exist')
    ap.add_argument('--check', action='store_true', help='transcribe each clip and re-record mismatches')
    ap.add_argument('--tries', type=int, default=4, help='recording attempts per word with --check')
    ap.add_argument('--voice', default=VOICE)
    ap.add_argument('--only', nargs='*', help='word ids to (re)record')
    ap.add_argument('--course', default='ko', choices=['ko', 'ar'])
    args = ap.parse_args()

    from supertonic import TTS

    tts = TTS(model='supertonic-3')
    style = tts.get_voice_style(args.voice)
    fallback = tts.get_voice_style(FALLBACK_VOICE)
    lang = args.course
    listener = Listener(lang) if args.check else None
    os.makedirs(OUT, exist_ok=True)
    words = load_words(args.course)
    if args.only:
        words = [w for w in words if w['id'] in args.only]

    made, unclear = 0, []
    for i, w in enumerate(words, 1):
        path = os.path.join(OUT, f"{w['id']}.mp3")
        if args.force or args.only or not os.path.exists(path):
            record(tts, style, w['term'], path, lang)
            made += 1
        if listener:
            ok, heard = listener.hears(path, w['term'])
            # Synthesis varies from run to run, so a misheard word gets fresh attempts,
            # first in the main voice, then in the fallback voice.
            for n in range(2 * args.tries - 1):
                if ok:
                    break
                attempt = path + '.try.mp3'
                record(tts, style if n < args.tries - 1 else fallback, w['term'], attempt, lang)
                ok, heard = listener.hears(attempt, w['term'])
                if ok:
                    os.replace(attempt, path)
                    made += 1
                    if n >= args.tries - 1:
                        print(f"  {w['id']} {w['term']}: {FALLBACK_VOICE} voice", flush=True)
                else:
                    os.remove(attempt)
            if not ok:
                unclear.append((w['id'], w['term'], heard))
        if i % 50 == 0:
            print(f'{i}/{len(words)}', flush=True)

    print(f'recorded {made} clips, {len(words)} words, voice {args.voice}')
    if listener:
        print(f'{len(words) - len(unclear)}/{len(words)} heard as written')
        for wid, term, heard in unclear:
            print(f'  {wid}  {term}  heard: {heard}')


if __name__ == '__main__':
    main()
