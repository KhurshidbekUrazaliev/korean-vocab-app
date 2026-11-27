# Word audio

Every word has a recorded clip at `public/audio/<word id>.mp3` (24 kHz mono MP3, about 7 KB each, 3.4 MB in total). The app plays the clip and falls back to the device's best Korean voice if a clip can't load (`src/lib/speech.js`).

## How the clips are made

`scripts/make-audio.py` uses [Supertonic 3](https://huggingface.co/Supertone/supertonic-3), an open text-to-speech model that runs on the CPU. The model weights are under the BigScience Open RAIL-M license, which restricts harmful uses of the model and claims no rights over generated audio. Settings: voice F1, 16 denoising steps, speed 0.9, silence trimmed on a 10 ms loudness envelope, loudness levelled across clips.

With `--check`, each clip is transcribed by Whisper (large-v3-turbo). A word Whisper hears differently is recorded again, up to four times in voice F1 and then four times in voice F2, and the first version heard as written is kept.

- Words whose standard pronunciation differs from the spelling are synthesized from the pronounced form: 알약 as 알략, 산기슭 as 산기슥.
- Words Whisper writes with a different spelling of the same sound count as heard, for example 볶다/복다, 쟤/제, 문고리/문꼬리, 짖다/짙다.

## Result of the 2026-11-27 run

495 of 500 clips were heard exactly as written. Two words use voice F2 because F1 was misheard: 실내 (day13-09) and 학위 (day50-05).

These five were still transcribed differently after every attempt. They are most likely limits of the speech recognizer, not of the clip, but a person should listen to them:

| Word | Id | Whisper heard | Likely reason |
| --- | --- | --- | --- |
| 오븐 | day25-08 | 5분 | Biased toward the common phrase "5 minutes" |
| 교가 | day50-09 | 교과 | Every voice tested was heard as the more common 교과 |
| 못 | day49-06 | 1 | Single syllable |
| 빗 | day41-08 | 핏 | Single syllable; check that ㅂ is not aspirated |
| 짖다 | day44-10 | 짙다 | Same pronunciation [짇따]; now listed as a same-sound spelling |

To redo one word: `.venv-audio/bin/python scripts/make-audio.py --check --only day41-08`.
