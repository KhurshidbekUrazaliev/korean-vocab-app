# Shared plan

This file is how the two coding agents on this repo coordinate. Read all of it before you start, and again before each new task.

- **Lead**: content, data, all UI, the course refactor, reviews and merges every pull request.
- **Builder**: artwork, language review, engine functions, tests, CI, sharing images.

The owner tells each agent which role it has. Architecture, data format, design system and past decisions are in [docs/PROJECT.md](docs/PROJECT.md).

## Rules

1. Work only on tasks assigned to your role, in the files your role owns (section 5). If you need a change elsewhere, add a line under "Requests" and keep going.
2. One branch per task, named `<area>/<task-id>-<short-name>`, for example `art/B1-arabic-covers`. Areas: `art`, `review`, `engine`, `build`, `test`, `ui`, `data`. **No agent or tool names** in branch names, commit messages, file contents, code comments or pull request text. Commits are authored as the owner, with no AI attribution lines.
3. Open a pull request into `main`. The Lead reviews and merges.
4. When you start, finish or get blocked on a task, update its row in the task board and add one line to the status log. Never delete other lines.
5. Never invent facts: no made-up testimonials, prices, user counts, names or claims. Write `TODO(owner): ...` and list it under "Open questions".
6. No secrets in the repo.
7. `npm test`, `npm run build` and `npm run test:a11y` pass on every pull request.

## Goal of this phase

Add an **Arabic** course next to the Korean one, under the new site name **Essential Vocabulary**:

- A sign-in page at the start: the learner enters a name, picks a language (Korean or Arabic) and a daily goal. The profile is saved on the device only; there is no server and no password (owner's decision, 2026-11-28).
- After signing in, the learner can switch language from the app bar at any time.
- **500 Arabic words in 50 days of 10**, selected from the owner's copy of *Collins Arabic: 3000 Words and Phrases*. Lists are in `src/data/ar/`.
- Same design system as Korean, with its own illustrations.
- New features borrowed from established language apps: a daily goal chosen at sign-in, a Letters page (Hangul and the Arabic alphabet), slow replay of audio, and a Match game.

## Contract (both roles build against this)

**Courses.** `ko` (Korean) keeps its current URLs. `ar` (Arabic) lives under `/ar`.

| Route | Korean | Arabic |
| --- | --- | --- |
| Today (signed in) / landing | `/` | `/ar` |
| Course index | `/course` | `/ar/course` |
| Day | `/day/:n` | `/ar/day/:n` |
| Practice (noindex) | `/day/:n/practice/:mode` | `/ar/day/:n/practice/:mode` |
| Review | `/review` | `/ar/review` |
| Progress (noindex) | `/progress` | `/ar/progress` |
| Letters | `/letters` | `/ar/letters` |
| Sign in (noindex) | `/welcome` | |

Modes: `flashcards`, `choice`, `typing`, `listening`, `match`.

**Data.** One JSON file per day:

- Korean: `src/data/ko/dayNN.json`. Task L2 moves the files from `src/data/days/` and renames the fields: `korean` → `term`, `titleKo` → `titleNative`.
- Arabic: `src/data/ar/dayNN.json`. Day ids are `ar-dayNN`, word ids `ar-dayNN-MM`, so both courses share one progress store with no collisions.

```json
{ "id": "ar-day07", "course": "ar", "number": 7, "slug": "time-of-day", "title": "Time of day",
  "titleNative": "أَوْقَاتُ الْيَوْم", "status": "draft", "source": "collins-3000", "cover": null,
  "words": [{ "id": "ar-day07-01", "term": "الصَّبَاح", "romanization": "as-sabaah", "english": "morning" }] }
```

`src/data/courses.js` (from L2) exports `COURSES.ko` and `COURSES.ar`, each with `id, name, nativeName, lang, dir, base ('' or '/ar'), days, allWords, getDay(n)`.

**Arabic text conventions.** Modern Standard Arabic with full vowel marks. Nouns carry the article, as in the source. Verbs are given in the past tense (huwa form), the source's convention for English infinitives. Transliteration uses:

- aa, ii, uu for long vowels;
- ‘ for ع and ’ for hamza;
- th = ث, dh = ذ and ظ, kh, gh, sh;
- sun-letter assimilation (`ash-shams`);
- `-at` for ة in a construct phrase (`sayyaarat al-ujra`).

**Profile.** `localStorage["kv.profile"] = { name, course: "ko" | "ar", goal: 10 | 20 | 30, createdAt }`.

**Assets.**

- Arabic covers go in `public/images/ar/days/dayNN.webp`, and the Arabic home scene is `public/images/ar/hero.webp`.
- Arabic sharing cards go in `public/og/ar/dayNN.jpg` and `public/og/ar/home.jpg`.
- Word audio: `public/audio/<word id>.mp3`. The Lead records it with `scripts/make-audio.py`.

## Task board

Status: `todo` · `doing` · `review` · `done` · `blocked`

| ID | Task | Role | Depends on | Status |
|----|------|------|-----------|--------|
| L1 | Select 500 Arabic words from Collins into 50 themed days with vowel marks, transliteration and English; cross-check letters against the book | Lead | | done (status `draft` until B2) |
| L2 | Multi-course refactor: data move and rename, `courses.js`, course-aware routes and pages, Arabic font and right-to-left text, titles, metadata, sitemap and llms.txt for `/ar` | Lead | | doing |
| L3 | Sign-in page (device profile: name, language, daily goal), language switcher in the app bar, `/` and `/ar` routing by profile | Lead | L2 | todo |
| L4 | Arabic word audio for all 500 words, checked with Whisper | Lead | L1 | todo |
| L5 | Letters page for both scripts, slow replay, Match game UI | Lead | L2, B4 | todo |
| L6 | Merge every Builder pull request, full QA in both courses and themes, deploy | Lead | all | todo |
| B1 | **Arabic artwork**: 50 day covers and the home scene, following [docs/ASSETS-AR.md](docs/ASSETS-AR.md). Set each day's `cover` field when its image lands | Builder | L1 | review. 50 illustrated lesson covers and one home scene are ready. |
| B2 | **Arabic language review** of all 500 entries: spelling, vowel marks, transliteration (conventions above), meaning. Correct in place, record each change in `docs/VOCABULARY-REVIEW-AR.md`, then set every day's `status` to `reviewed` | Builder | L1 | done. Merged 2026-11-28 (15 corrections) |
| B3 | **Sharing cards** for both courses in `scripts/make-images.cjs`: site name "Essential Vocabulary", Arabic titles in Noto Naskh Arabic rendered right to left, outputs listed under Assets, JPEG under 60 KB | Builder | B1, L2 | review |
| B4 | **Match engine**: `src/lib/match.js` with `buildMatchRound(words, { pairs = 5, random })` returning `{ left: [{ id, text }], right: [{ id, text }] }` (Arabic or Korean term on the left, English on the right, each shuffled) and `isPair(leftId, rightId)`. Unit tests | Builder | | done. Merged 2026-11-28 |
| B5 | **Tests and accessibility** for the new screens: Testing Library tests for sign-in, language switch and Match. Extend `e2e/` scans to `/welcome`, `/ar`, `/ar/day/1`, every Arabic practice mode, `/ar/letters`, both themes and viewports | Builder | L3, L5 | todo |
| B6 | **Performance** with the Arabic font: measure Home, `/ar` and `/ar/day/1` on mobile Lighthouse; keep Home at 80 or above; report in `.github/PERFORMANCE.md` | Builder | L2, L3 | todo |

## File ownership

| Role | Owns |
|------|------|
| Lead | `AGENTS.md` structure, `src/data/**`, `src/styles/**`, `src/components/**`, `src/pages/**`, `src/hooks/**`, `src/main.jsx`, `src/App.jsx`, `index.html`, `docs/**`, `README.md`, `scripts/postbuild.js`, `scripts/make-audio.py`, `public/audio/**`. L2 also edits `src/lib/pageMetadata.js` for the new routes |
| Builder | `.github/**`, `src/lib/**` (keep the contract in docs/PROJECT.md), `**/__tests__/**`, `e2e/**`, `vite.config.*`, `scripts/make-images.cjs`, `public/og/**`, `public/images/**`, `package.json` and lockfile. For B2, also `src/data/ar/**` and `docs/VOCABULARY-REVIEW-AR.md`. For B1, the `cover` field in `src/data/ar/**` |

## Decisions

| Date | Decision |
|------|----------|
| 2026-11-28 | Sign-in is a device profile (name, language, goal) with no server. Real accounts would need a backend service (owner's choice) |
| 2026-11-28 | Site name: Essential Vocabulary. Korean keeps its URLs; Arabic lives under `/ar` |
| 2026-11-28 | Arabic vocabulary comes from the owner's Collins book: 413 of the 500 entries match a Collins headword directly. The rest are basics the book teaches inside phrases (numbers, eat, drink) or very common words (car, bank, house) |
| 2026-11-28 | One progress store for both courses; ids are prefixed per course |

## Open questions for the owner

- **Q1** Arabic: should practice later also ask learners to type Arabic? This needs an Arabic keyboard on their device.

## Requests

_(format: `- [from → to] request (status)`)_

- [Builder → Lead] On merge, set the Arabic home scene to `images/ar/hero.webp` and add alt text for the old-city lane with a carved doorway, mashrabiya balcony, bicycle and café chair.
- [Builder → Lead] On the signed-in home screen, an empty loading state shifts the footer when Today appears. A direct Today import in `src/pages/Home.jsx` removed the measured layout shift in both courses. (open)

## Status log (append only, newest at bottom)

_(format: `YYYY-MM-DD HH:MM UTC | role | task | note`)_

- 2026-11-28 | Lead | setup | New phase: Arabic course, sign-in, language switch. Plan and task board written. L1 done: 500 Arabic entries in `src/data/ar/` (draft). B1, B2 and B4 can start now.
- 2026-11-28 03:02 UTC | Builder | B4 | Started the Match round engine and tests for both course schemas.
- 2026-11-28 03:04 UTC | Builder | B4 | Match engine ready for review. Verified 3,000 rounds across all 100 lessons. All 57 unit tests, the production build and 72 accessibility scans passed.
- 2026-11-28 03:01 UTC | Builder | B2 | Started the entry-by-entry review of all 50 Arabic lessons.
- 2026-11-28 03:09 UTC | Builder | B2 | Reviewed all 500 Arabic entries, corrected 15 and recorded each edit in docs/VOCABULARY-REVIEW-AR.md. Ready for review.
- 2026-11-28 | Lead | B2, B4 | Reviewed and merged the Arabic language review (15 corrections, all 50 days `reviewed`) and the Match engine. The kasra added under silent initial alifs does not change pronunciation, so no clip needs re-recording.
- 2026-11-28 | Builder | B1 | Started the 50 Arabic lesson covers and the home illustration, using the course vocabulary and the existing paper-and-ink artwork as references.
- 2026-11-28 | Builder | B1 | Added all 50 lesson covers and the home scene. Each 1600 × 1000 WebP is under 140 KB. The cover paths and thumbnail and sharing-card crops were checked across the set. Ready for review.
- 2026-11-28 03:15 UTC | Builder | B3 | Started the Korean and Arabic sharing cards using the course data and illustrations.
- 2026-11-28 03:20 UTC | Builder | B3 | Rendered and inspected 102 course sharing cards; verified both preview tags in all 102 generated pages and the 60 KB size limit.
