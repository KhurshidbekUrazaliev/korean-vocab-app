# Project notes

How the app is built, the data format, the design system and the decisions behind them.

## Goal

Turn the existing Korean vocabulary app into a polished, professional
learning product with **50 vocabulary days**. It should be engaging enough
that people come back daily, look like a designed product (not a template),
and be findable by search engines and AI assistants.

Live site: https://khurshidbekurazaliev.github.io/korean-vocab-app/

## Current state (2026-11-28)

- Vite + React 19 + React Router 7. GSAP (ScrollTrigger, SplitText, CustomEase), Lenis smooth
  scroll, three.js hero (lazy chunk). Plain CSS with tokens. Vitest. Every push to `main` is tested and
  published to GitHub Pages (`gh-pages` branch) by GitHub Actions.
- **Two courses, 50 days and 500 words each.**
  - **Korean** (`/`): Days 01–15 come from the owner's notes (`status: verified`), with 4 typos fixed
    (동특증→동아리 활동, 짐장히→굉장히, 마지다→마치다, 영덩이→엉덩이; each has a `note`). Days 16–50
    are generated lists matched to the illustrations, reviewed against a dictionary (`status: reviewed`).
    See [the Korean vocabulary review](VOCABULARY-REVIEW.md).
  - **Arabic** (`/ar`): Modern Standard Arabic with full vowel marks, selected from *Collins Arabic: 3000
    Words and Phrases* (`source: collins-3000`). See [the Arabic review](VOCABULARY-REVIEW-AR.md).
- Sign-in is a device profile (name, course, daily goal) in `localStorage["kv.profile"]`. New visitors
  see it at `/` and `/ar`. The app bar has a Korean | العربية switch that moves to the same page in the
  other course.
- Practice: flashcards, multiple choice (both directions), typing, listening, and a bonus Match game.
  Every word has a recorded clip (see [docs/AUDIO.md](AUDIO.md)); tapping the speaker again plays it slowly.
  A Letters page per course teaches Hangul or the Arabic alphabet, with audio.
- Every public route gets static HTML from `scripts/postbuild.js`: own title, description,
  canonical, OG/Twitter tags, per-day 1200x630 preview image, JSON-LD, and the word list as
  plain HTML inside `#root`. Sitemap, robots.txt (AI bots allowed), llms.txt, 404.html.
- Hanji paper tones, seal red, Noto Serif KR for Hangul, Noto Naskh Arabic for Arabic, Pretendard for UI text.
- Motion: hero particle field that forms real words in either script (cursor pushes particles), line-mask
  text reveals, scroll-velocity word ticker, pinned "four ways to practice" scene, ink curtain page
  transitions showing the destination's native title, 3D flashcard flip, answer pop/shake, animated score
  ring. Arabic titles animate word by word, never letter by letter, so the joined script stays intact.
  All off under `prefers-reduced-motion`.

## Architecture

```
src/
  data/ko/dayNN.json        Korean day files (schema below), data/ko/letters.json
  data/ar/dayNN.json        Arabic day files, data/ar/letters.json
  data/index.js             COURSES.ko / COURSES.ar (days, allWords, getDay, path(), letters, labels),
                            courseFromPath, switchPath, clipFor, clipUrl, pad, initialOf
  lib/                      pure logic, unit-tested in lib/__tests__
    shuffle.js quiz.js srs.js progress.js progressJournal.js streak.js speech.js match.js
    stats.js                dayStatus, currentDay, weakWords, activity, mastery breakdown, MODE_TITLES
    pageMetadata.js         titles, descriptions, canonical URLs, sharing tags, JSON-LD for every route
    sound.js                feedback tones (Web Audio) + vibration
    motion.js               GSAP plugin registration + reducedMotion()
  hooks/                    useProgress, useProfile (device sign-in), useCourse (from the URL), useTheme
  components/               Header (with LanguageSwitch), Footer, Motion (Lenis + curtain + TLink), Reveal,
                            WordField (three.js), Session (all practice modes, Match, results),
                            SpeakButton, PageHead, Icons
  pages/                    Home (Welcome or Today), Welcome (sign-in), Course, Day, Practice, Review,
                            Progress, Letters, Legal (Privacy, Terms), NotFound
  styles/                   tokens.css, base.css, landing.css, app.css, day.css, practice.css
scripts/postbuild.js        per-route HTML + SEO files for both courses (runs in `npm run build`)
scripts/make-images.cjs     OG images + icons (dev-only, Playwright)
scripts/make-audio.py       word and letter clips with Supertonic 3 (dev-only; --course ko|ar, --check)
```

**Routes** (Korean / Arabic): `/` · `/ar` (sign-in or Today), `/course` · `/ar/course`,
`/day/:n` · `/ar/day/:n`, `/day/:n/practice/:mode` · `/ar/day/:n/practice/:mode`
(flashcards|choice|typing|listening|match, noindex), `/review` · `/ar/review`, `/progress` · `/ar/progress`
(noindex), `/letters` · `/ar/letters`, plus `/welcome` (noindex), `/privacy`, `/terms`. Anything else → 404.
Title pattern: `Day 07: Travel · Korean | Essential Vocabulary`.

Links between pages use `TLink` (a real `<a href>` that plays the curtain). The shared route metadata supplies the React document head and the static HTML, including indexing, sharing cards and structured data.

### Data schema (`src/data/<course>/dayNN.json`)

```json
{
  "id": "day07", "course": "ko", "number": 7, "slug": "travel", "title": "Travel", "titleNative": "여행",
  "status": "verified", "source": "owner-notes", "cover": "images/days/day07.webp",
  "words": [{ "id": "day07-01", "term": "기대하다", "romanization": "gidaehada", "english": "to expect", "note": "optional" }]
}
```
Arabic ids are prefixed: `ar-day07`, `ar-day07-01`. `status`: `verified` (class notes) | `reviewed`
(language review) | `draft`. `source`: `owner-notes` | `generated` | `collins-3000`. Tests enforce 50 days of
10 words per course, sequential numbers, unique ids and terms, distinct quiz answers per day, the script of
each term, and a recorded clip for every word and letter.

### Practice engine (`src/lib`)

```js
shuffle(array) -> new array                       // Fisher-Yates
buildMultipleChoice(word, pool, { count = 4, direction = 'ko-en' }) -> { prompt, options, answerId }
checkTyped(input, word, { direction }) -> { correct, closeness }   // UI accepts closeness >= 0.8
schedule(state, correct, now) -> { box, dueAt, seen, correctCount } // boxes 1-5, [0,1,3,7,16] days; new+correct -> box 2;
                                                  // correct before dueAt keeps box and dueAt; miss -> box 1
getDueWords(progress, allWords, now) -> word[]
loadProgress() / saveProgress(p)                  // imports existing v1/v2 data, with per-grade writes and periodic checkpoints
getStreak(progress, now) -> { current, best, practicedToday }
speak(text, { rate })                             // recorded clip public/audio/<id>.mp3, else best ko-KR device voice
warm(text)                                        // preload a clip (hover, next card)
```

## Design system (v2, 2026-11-27)

See `docs/DESIGN-CRITIQUE.md`: it explains why v1 looked like a template and what v2 changes.

- **Identity**: hanji paper that matches the illustrations' ground (#F6ECDF), warm ink, and one
  seal-red accent (인주) taken from the art. No lime, no gradients, no glass, no emoji.
- **Type**: Hangul display in **Noto Serif KR** (Myeongjo, Google Fonts) via `.ko`; UI in
  Pretendard. Use `.ko-ui` for small Hangul inside UI text. Tabular numbers via `.num`.
- **Tokens** (`src/styles/tokens.css`): paper `#f6ede2`, surface `#fffaf3`, surface-2 `#ece2d3`,
  ink `#1c1a16`, ink-2 `#5f584d`, ink-3 `#8a8172` (large/decorative only), line `#e0d5c4`,
  accent `#a8322a` + soft `#f2ddd2`, good `#2e6440` + soft `#dde9d7`, dark band `#24201b`.
- **Contrast** (WCAG AA, checked 2026-11-27): ink/paper 15.00, ink-2/paper 6.06,
  ink-2/surface-2 5.48, accent/paper 5.75, white-on-accent 6.41, good/paper 6.02;
  dark: ink/paper 15.11, ink-2/surface 6.56, accent/paper 5.86, accent/surface 5.37, good 8.61.
  ink-3 is 3.32 and is only for large or decorative text.
- **App structure**: top app bar (brand seal, Today / Course / Review / Progress, streak, theme)
  and a bottom tab bar under 820px. Practice runs full-screen without them.
- **Components**: `.btn` (ink), `.btn--accent` (the one primary action per screen), `.btn--ghost`,
  `.card`, `.badge(--accent|--good|--ink)`, `Ring`, `Mastery` (5 bars = review box).
- Spacing 4/8/12/16/24/32/48/64 (+96/128). Radius 8/14/24/pill.
- Motion: GSAP for entrances, scroll scenes and the curtain; CSS for hover. All off for reduced motion.
- Practice feedback: soft Web Audio tones + vibration on mobile, toggle in the session bar
  (`kv.sound` in localStorage).

## Decisions

| Date | Decision |
|------|----------|
| 2026-11-27 | One data file per day + one shared lesson UI instead of per-day components |
| 2026-11-27 | Move off Create React App (deprecated) to Vite; pre-render every route |
| 2026-11-27 | Progress kept in localStorage; no paid/permission state on the client |
| 2026-11-27 | Plain CSS + tokens instead of Tailwind (fewer deps, design needs custom motion styles) |
| 2026-11-27 | Days 16-50 drafted so the course is complete; marked draft until checked |
| 2026-11-27 | No background video. Motion, the WebGL hero and the illustrations carry the visual weight |
| 2026-11-27 | v2 design: app structure (Today/Course/Review/Progress), hanji + seal red palette from the art, Noto Serif KR for Hangul. Replaces v1's lime/pine landing-page look |
| 2026-11-28 | Use the original Day 16–50 illustration topics for the replacement lessons and keep their generated vocabulary marked as draft. |
| 2026-11-28 | Complete the dictionary review of Days 16–50, record the corrections and merge PR #2 into the v2 design. |

## Open questions for the owner

- **Q1 resolved** The owner requested a language review of the generated entries. The review and corrections are recorded in [the vocabulary review](docs/VOCABULARY-REVIEW.md).
- **Q2** "Conversion" means what: sign-ups, paid plan, or daily return? (Paid plan = backend + payment provider = new plan section.)
- **Q3** Stay on GitHub Pages, or move to Vercel/Netlify (needed if we add accounts/payments)?
- **Q5** Site name and domain. Current candidates: "한국어 공부", "Essential Korean Vocabulary".
- **Q6 resolved** Footer, Privacy and Terms name Khurshidbek with ummahfaris@gmail.com. Country not given.
- **Q7 resolved** Sign-in is a device profile with no server (owner, 2026-11-28). Site name: Essential Vocabulary.
