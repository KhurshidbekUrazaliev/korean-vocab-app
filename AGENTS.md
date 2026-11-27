# AGENTS.md: shared plan for Claude, Codex, Cursor and Gemini

This file is the single source of truth for everyone working on this repo:
Claude Code, Codex, Cursor, Gemini, and the owner. `CLAUDE.md` and
`GEMINI.md` only point here.

**Rules for every agent**
1. Read this whole file before you start. Re-read it before each new task.
2. Work only on tasks assigned to you and only in the files you own (see
   "File ownership"). If you need a change in someone else's files, add a
   line under "Requests between agents" and keep going on something else.
3. One branch per task: `<agent>/<task-id>-<short-name>`, e.g.
   `codex/T03-vite-migration`. Open a PR into `main`. Claude reviews and merges.
4. When you start, finish, or get blocked on a task, update its row in the
   task board and append one line to the status log at the bottom. Never
   delete other agents' log lines.
5. Never invent facts: no made-up testimonials, prices, user counts, names,
   addresses or claims. Put `TODO(owner): ...` instead and list it under
   "Open questions for the owner".
6. Vocabulary must be correct Korean. Any word list not taken from the
   owner's own notes is marked `"status": "draft"` until Claude has checked it.
7. No secrets in the repo. No API keys in frontend code or `.env` files that
   get committed.
8. Keep `npm run build` and `npm test` passing on every PR.

---

## 1. Goal

Turn the existing Korean vocabulary app into a polished, professional
learning product with **50 vocabulary days**. It should be engaging enough
that people come back daily, look like a designed product (not a template),
and be findable by search engines and AI assistants.

Live site: https://khurshidbekurazaliev.github.io/korean-vocab-app/

## 2. Current state (audit summary, 2026-11-27)

- Create React App + React 19, Tailwind loaded from the CDN script, Lucide icons,
  deployed to GitHub Pages with `gh-pages`.
- 15 days x 10 words, each day a copy-pasted ~360-line component
  (`src/Day01.js` ... `src/Day15.js`). Only the word list and colors differ.
- One URL for the whole app; day selection is React state. Empty
  `<div id="root">` for crawlers. Placeholder meta description.
- Purple/pink gradients, glass blur buttons, pulsing/bouncing icons, emoji
  in copy. Flashcards are not keyboard-accessible.
- Dead files: `src/tempCodeRunnerFile.js`, `src/App.css`, `src/logo.svg`,
  `src/reportWebVitals.js`, `src/App.test.js`.
- Known data error: `src/Day15.js` has 영덩이, should be 엉덩이.
- No backend, no auth, no payments, so most server-side security items do
  not apply yet.

## 3. Target architecture

```
src/
  data/days/day01.json ... day50.json   one file per day (schema below)
  data/index.js                         loads all days, exports list + lookup
  lib/                                  pure logic, no React, unit-tested
    shuffle.js        Fisher-Yates shuffle (replaces sort(() => random))
    quiz.js           buildMultipleChoice(word, pool, n=4), checkTyped(answer, word)
    srs.js            Leitner boxes: schedule(wordState, correct) -> next due date
    progress.js       read/write progress in localStorage (versioned key)
    streak.js         daily streak from progress history
    speech.js         Korean TTS wrapper (speechSynthesis, voice loading)
  components/                           shared UI building blocks
  pages/
    Home.jsx          day index + "continue where you left off" + review due
    Day.jsx           one day: cover, word list, choose a practice mode
    Practice/         Flashcards, MultipleChoice, Typing, Listening, Results
    Review.jsx        spaced-repetition review across all learned words
    NotFound.jsx      real 404 page
    Privacy.jsx, Terms.jsx
  styles/tokens.css                     design tokens (colors, type, spacing, radius)
public/
  images/days/dayNN.webp                day covers (from Gemini, see docs/ASSETS.md)
  og/                                   generated 1200x630 link-preview images
  robots.txt, sitemap.xml, llms.txt
```

**Routes**: `/` · `/day/:n` (01-50) · `/day/:n/practice/:mode` · `/review` ·
`/privacy` · `/terms` · everything else → 404.
Every route is pre-rendered to static HTML at build time so "View source"
shows real content, with its own `<title>`, description, canonical, Open
Graph and Twitter tags. Title pattern: `Day 07: Travel Experience | <Site name>`.

**Progress** is stored in localStorage. This is fine because it is the
learner's own study data. Nothing paid or permission-related is ever
decided on the client. If paid plans are added later, that requires a
backend and gets its own section here first.

### Data schema (`src/data/days/dayNN.json`)

```json
{
  "id": "day07",
  "number": 7,
  "slug": "travel-experience",
  "title": "Travel Experience",
  "titleKo": "여행 경험",
  "status": "verified",
  "source": "owner-notes",
  "cover": "/images/days/day07.webp",
  "words": [
    {
      "id": "day07-01",
      "korean": "여행",
      "romanization": "yeohaeng",
      "english": "trip, travel",
      "pos": "noun",
      "example": { "ko": "", "en": "" }
    }
  ]
}
```
`status` is `"verified"` (checked against owner's notes) or `"draft"`.
`source` is `"owner-notes"`, `"topik-list"`, or `"generated"`.
`pos` and `example` are optional. Examples written by an AI stay
`"draft"` until checked.

### Practice engine contract (`src/lib`, owned by Codex)

```js
shuffle(array) -> new array
buildMultipleChoice(word, pool, { count = 4, direction = 'ko-en' }) -> { prompt, options: [{ id, label }], answerId }
checkTyped(input, word, { direction }) -> { correct: boolean, closeness: 0..1 }
// srs: boxes 1-5, intervals in days [0, 1, 3, 7, 16]
schedule(state | undefined, correct, now = new Date()) -> { box, dueAt, seen, correctCount }
getDueWords(progress, allWords, now) -> word[]
loadProgress() / saveProgress(progress)   // key: "kv.progress.v1"
getStreak(progress, now) -> { current, best, practicedToday }
speak(text, { rate = 0.9 })               // ko-KR
```
UI code (Cursor) imports only these functions; it never touches localStorage directly.

## 4. Design direction (proposal: waiting for owner OK, see Open questions)

- **One brand color plus neutrals.** No gradients, glass blur, glowing orbs,
  sparkles, cursor effects, or emoji headings.
- Proposed palette: paper `#F7F5F0`, ink `#1A1A1A`, muted ink `#5A5A55`,
  line `#E3DFD6`, accent `#B3261E` (Korean seal red), success `#1E6B3A`,
  error `#B3261E` + icon. Dark mode: bg `#141413`, text `#EDEBE6`, muted `#A8A6A0`.
  Every text/background pair must pass WCAG AA (4.5:1 body, 3:1 large). Check it, don't assume.
- Type: **Pretendard** (Korean + Latin, open license) for UI; Korean words
  shown large (48-72px) because the Korean word is the hero of every screen.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 only. Radius: 8 (controls), 16 (cards).
- Images: one cover illustration per day (topic-specific, same style for all days),
  used on the day page and in link previews. No looping background video
  (hurts focus, data use and battery). Decision pending with owner.
- Motion: short (150-200ms) state transitions only (card flip, answer
  feedback). Everything off under `prefers-reduced-motion`.
- Buttons say what happens: "Start flashcards", "Check answer", "Next word",
  "Review 12 due words".
- Keyboard: Space flips card, 1-4 picks an option, Enter checks or advances,
  visible focus rings everywhere.

## 5. Task board

Status: `todo` · `doing` · `review` · `done` · `blocked`

### Phase 0: foundation (run in parallel, no file overlap)

| ID | Task | Owner | Status | Depends on |
|----|------|-------|--------|------------|
| T01 | Extract all 15 days into `src/data/days/dayNN.json` per schema; fix 영덩이→엉덩이; proofread every word, romanization and English gloss; write `src/data/index.js` | Claude | todo | - |
| T02 | Write design tokens `src/styles/tokens.css` + Tailwind theme mapping; verify contrast of every pair and record ratios in this file | Claude | todo | owner OK on palette |
| T03 | Migrate CRA → Vite + React Router; install Tailwind as a real build dependency (remove CDN script); delete dead files (`tempCodeRunnerFile.js`, `App.css`, `logo.svg`, `reportWebVitals.js`, `App.test.js`, `setupTests.js` if unused); add Vitest; keep `npm run deploy` to GitHub Pages working with correct `base` | Codex | todo | - |
| T04 | Practice engine `src/lib/*` per contract above, with unit tests (shuffle uniformity, SRS intervals, streak across midnight/timezones, progress versioning) | Codex | todo | - |

### Phase 1: product (parallel, starts when T01+T03 are merged)

| ID | Task | Owner | Status | Depends on |
|----|------|-------|--------|------------|
| T05 | App shell: layout, header, footer (links to /privacy, /terms), skip link, theme toggle (respects system setting), route table, NotFound page | Cursor | todo | T02, T03 |
| T06 | Home page: day index (50 days, grouped in blocks of 10, shows progress per day), "Continue Day N", "Review X due words", streak | Cursor | todo | T04, T05 |
| T07 | Day page: cover image, title, word list with audio buttons, practice mode picker | Cursor | todo | T05 |
| T08 | Practice modes: Flashcards (keyboard flip), Multiple choice (ko→en and en→ko), Typing, Listening; Results screen with missed words and "Practice missed words" | Cursor | todo | T04, T07 |
| T09 | Review page (SRS across all days) | Cursor | todo | T04, T08 |
| T10 | Static prerender of every route (vite-react-ssg or custom renderToString script; document the choice under Decisions); per-route head tags (title, description, canonical, OG, Twitter, JSON-LD `WebSite` + `Course`/`LearningResource`) | Codex | todo | T03, T01 |
| T11 | Build scripts: `sitemap.xml`, `robots.txt` (allow all + GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, link to sitemap), `llms.txt`, real 404 for GitHub Pages; generate 1200x630 OG images per day from cover + title (satori/resvg or canvas) | Codex | todo | T10, assets |
| T12 | GitHub Actions: build + test on PR, deploy to Pages on `main` | Codex | todo | T03 |

### Phase 2: content to 50 days

| ID | Task | Owner | Status | Depends on |
|----|------|-------|--------|------------|
| T13 | Days 16-50 word lists: from owner's notes if provided, otherwise a draft from a TOPIK-level frequency source, topic-grouped, 10 words each, no duplicates with days 1-15 | Claude (owner supplies source) | blocked | Owner question Q1 |
| T14 | Day cover images 01-50 + site hero, per `docs/ASSETS.md` | Owner / Codex | done | All 50 covers and the site hero complete. Days 16-50 use provisional topics pending T13. |
| T15 | Example sentences for every word (draft, then Claude verification) | Claude | todo | T13 |

### Phase 3: finish

| ID | Task | Owner | Status | Depends on |
|----|------|-------|--------|------------|
| T16 | Privacy and Terms pages (localStorage only, no tracking unless added); owner details as TODO until provided | Claude | todo | Q6 |
| T17 | Accessibility pass: keyboard-only run of every mode, screen reader labels, contrast, reduced motion, 200% zoom | Cursor | todo | T05-T09 |
| T18 | Copy pass: no buzzwords, no vague buttons, few em dashes, no unbacked claims | Claude | todo | T05-T09 |
| T19 | Final review, Lighthouse (perf/a11y/SEO ≥ 95), README rewrite, proprietary LICENSE if owner wants it, Search Console steps | Claude | todo | all |

## 6. File ownership (to avoid merge conflicts)

| Owner | Owns |
|-------|------|
| Claude | `AGENTS.md` task board structure, `src/data/**`, `src/styles/tokens.css`, `docs/**`, `README.md`, `src/pages/Privacy.jsx`, `src/pages/Terms.jsx` |
| Codex | `package.json`, lockfile, `vite.config.*`, `index.html`, `scripts/**`, `src/lib/**`, `src/seo/**`, `.github/**`, `public/robots.txt`, `public/llms.txt`, `public/sitemap.xml`, `public/og/**` |
| Cursor | `src/main.jsx`, `src/App.jsx`, `src/components/**`, `src/pages/**` (except Privacy/Terms), `src/index.css` |
| Owner / Gemini | `public/images/**` |

Everyone may edit their own task rows and append to the status log.

## 7. Decisions

| Date | Decision | By |
|------|----------|----|
| 2026-11-27 | One data file per day + one shared lesson UI instead of per-day components | Claude |
| 2026-11-27 | Move off Create React App (deprecated) to Vite; pre-render every route | Claude |
| 2026-11-27 | Progress kept in localStorage; no paid/permission state on the client | Claude |

## 8. Open questions for the owner

- **Q1** Source for days 16-50: your notes (send them), or a TOPIK frequency list as draft?
- **Q2** "Conversion" means what: sign-ups, paid plan, or daily return? (Paid plan = backend + payment provider = new plan section.)
- **Q3** Stay on GitHub Pages, or move to Vercel/Netlify (needed if we add accounts/payments)?
- **Q4** OK with the palette/type in section 4, and day cover illustrations instead of background video?
- **Q5** Site name and domain. Current candidates: "한국어 공부", "Essential Korean Vocabulary".
- **Q6** Name/contact for footer, Privacy, Terms, and structured data.
- **Q7** Push access for Claude's session (connect GitHub in claude.ai settings), or the owner pushes Claude's branches.

## 9. Requests between agents

_(format: `- [from → to] request (status)`)_

## 10. Status log (append only, newest at bottom)

_(format: `YYYY-MM-DD HH:MM UTC | agent | task | note`)_

- 2026-11-27 | Claude | setup | Audit done, AGENTS.md created, tasks assigned. Waiting on owner for Q1, Q4, Q7.

- 2026-11-27 14:45 UTC | Codex | T14 | Owner requested work on docs/ASSETS.md. Preparing the required Day 01 style sample using built-in image generation; remaining covers await sample approval.
- 2026-11-27 14:48 UTC | Codex | T14 | Day 01 sample prepared at public/images/days/day01.webp (1600x1000, 74,914 bytes). Verified image-only 1200x630 crop and no visible text. Built-in image_gen used instead of Gemini. Remaining covers await owner style review required by docs/ASSETS.md; days 16-50 also await T13. No production publication or PR yet.
- 2026-11-27 14:52 UTC | Codex | T14 | Following the Day 01 review, owner requested the next task. Using the sample as the reference for Days 02-15 and the site hero.
- 2026-11-27 14:53 UTC | Codex | T14 | Added 15 day covers and the site hero. All WebPs are 1600 × 1000 and under 131 KB each. Reviewed the centered 1200 × 630 crops. The remaining 35 covers depend on T13 topics and image briefs.
- 2026-11-27 14:55 UTC | Codex | T14 | Owner requested completion of the remaining covers in one batch. Using provisional art topics for Days 16-50 pending T13.
- 2026-11-27 15:03 UTC | Codex | T14 | Completed 50 covers and the site hero. Added the hero and the 15 available lesson covers to the home page. Days 16-50 have published-asset paths and provisional art topics in docs/ASSETS.md pending T13.
