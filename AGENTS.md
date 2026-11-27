# AGENTS.md: shared plan for Claude, Codex and Gemini

This file is the single source of truth for everyone working on this repo:
Claude Code, Codex, Gemini (images, run by the owner), and the owner.
Two coding agents only: **Claude** (lead, content, all UI) and **Codex**
(tooling, practice engine, SEO, build, CI). `CLAUDE.md` and
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
6. Mark new generated lists `draft` pending Claude’s language review. For the owner-requested review of Days 16–50, Codex recorded `reviewed` after checking spelling, romanization and meanings. The word lists keep their `generated` source.
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

## 2. Current state (2026-11-28)

- Vite + React 19 + React Router 7. GSAP (ScrollTrigger, SplitText, CustomEase), Lenis smooth
  scroll, three.js hero (lazy chunk). Plain CSS with tokens. Vitest. Deployed to GitHub Pages
  from the `gh-pages` branch with `npm run deploy`.
- **50 days / 500 words.** Days 01-15 = owner's notes (`status: verified`), with 4 typos fixed
  (동특증→동아리 활동, 짐장히→굉장히, 마지다→마치다, 영덩이→엉덩이; each has a `note`).
  Days 16–50 contain 350 generated entries matched to the illustrated topics. All 35 lists carry
  `status: reviewed` and `source: generated`. See [the vocabulary review](docs/VOCABULARY-REVIEW.md). Each day offers direct links to
  flashcards, multiple choice, typing and listening in its lesson steps.
- Every public route gets static HTML from `scripts/postbuild.js`: own title, description,
  canonical, OG/Twitter tags, per-day 1200x630 preview image, JSON-LD, and the word list as
  plain HTML inside `#root`. Sitemap, robots.txt (AI bots allowed), llms.txt, 404.html.
- The app uses hanji paper tones, seal red and Noto Serif KR for Hangul, with Pretendard for UI text. See the v2 design system below.
- Motion: hero particle field that forms real Korean words (cursor pushes particles), line-mask
  text reveals, scroll-velocity word ticker, pinned "four ways to practice" scene, staggered day
  index with sticky block numbers, ink curtain page transitions showing the destination's Korean
  title, 3D flashcard flip, answer pop/shake, animated score ring. All off under
  `prefers-reduced-motion` (Lenis disabled, hero rendered still, transitions instant).

## 3. Architecture

```
src/
  data/days/dayNN.json      one file per day (schema below)
  data/index.js             days, allWords, getDay, pad, PLANNED_DAYS
  lib/                      pure logic, unit-tested in lib/__tests__
    shuffle.js quiz.js srs.js progress.js streak.js speech.js
    stats.js                dayStatus, currentDay, weakWords, activity, mastery breakdown
    sound.js                feedback tones (Web Audio) + vibration
    motion.js               GSAP plugin registration + reducedMotion()
  hooks/                    useProgress (store over localStorage), useTheme
  components/               Header, Footer, Motion (Lenis + curtain + TLink), Reveal,
                            HangulField (three.js), Session (all practice modes + results),
                            SpeakButton, Icons
  pages/                    Home (Landing for new visitors, Today for returning), Course, Day,
                            Practice, Review, Progress, Legal (Privacy, Terms), NotFound
  styles/                   tokens.css, base.css, landing.css, app.css, day.css, practice.css
scripts/postbuild.js        per-route HTML + SEO files (runs in `npm run build`)
scripts/make-images.cjs     OG images + icons (dev-only, Playwright)
```

**Routes**: `/` (Landing or Today) · `/course` · `/progress` (noindex) · `/day/:n` · `/day/:n/practice/:mode` (flashcards|choice|typing|listening,
noindex) · `/review` · `/privacy` · `/terms` · anything else → app 404 (served via 404.html).
Title pattern: `Day 07: Travel | Essential Korean Vocabulary`.

Links between pages use `TLink` (a real `<a href>` that plays the curtain). Page `<title>`/meta
are rendered by React 19 inside each page; postbuild bakes the same values into static HTML.

### Data schema (`src/data/days/dayNN.json`)

```json
{
  "id": "day07", "number": 7, "slug": "travel", "title": "Travel", "titleKo": "여행",
  "status": "verified", "source": "owner-notes", "cover": "images/days/day07.webp",
  "words": [{ "id": "day07-01", "korean": "기대하다", "romanization": "gidaehada", "english": "to expect", "note": "optional" }]
}
```
`status`: `verified` (class notes) | `reviewed` (dictionary review) | `draft`. `source`: `owner-notes` | `generated`. Tests enforce 10 words
per day, sequential numbers, unique ids and unique Korean words across all days.

### Practice engine (`src/lib`)

```js
shuffle(array) -> new array                       // Fisher-Yates
buildMultipleChoice(word, pool, { count = 4, direction = 'ko-en' }) -> { prompt, options, answerId }
checkTyped(input, word, { direction }) -> { correct, closeness }   // UI accepts closeness >= 0.8
schedule(state, correct, now) -> { box, dueAt, seen, correctCount } // boxes 1-5, [0,1,3,7,16] days
getDueWords(progress, allWords, now) -> word[]
loadProgress() / saveProgress(p)                  // key "kv.progress.v2", imports compatible v1 progress
getStreak(progress, now) -> { current, best, practicedToday }
speak(text, { rate })                             // ko-KR speechSynthesis
```

## 4. Design system (v2, 2026-11-27)

Read `docs/DESIGN-CRITIQUE.md` first: it explains why v1 looked like a template and what v2 changes.

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

## 5. Task board

Status: `todo` · `doing` · `review` · `done` · `blocked`

| ID | Task | Owner | Status |
|----|------|-------|--------|
| T01 | Days 01-15 to JSON, proofread, fixes | Claude | done |
| T02 | Design tokens + contrast | Claude | done |
| T03 | CRA → Vite + Router, remove CDN Tailwind and dead files, Vitest, deploy script | Claude | done (taken over to unblock the design) |
| T04 | Practice engine `src/lib` + tests | Claude | done. Codex: see T23 |
| T05-T09 | App shell, Home, Day, Practice modes, Review, 404 | Claude | done |
| T10 | Static HTML per route with meta + JSON-LD + plain content | Claude | done (string-template prerender). Full React prerender optional, see T22 |
| T11 | sitemap, robots (AI bots), llms.txt, 404.html, OG images per day | Claude | done |
| T12 | GitHub Actions: `npm ci && npm test && npm run build` on PRs; deploy `dist` to Pages on push to `main` (actions/deploy-pages or keep gh-pages branch, document which) | **Codex** | todo |
| T13 | Vocabulary for Days 16–50 | Codex / Claude | done. All 350 entries were reviewed for spelling, romanization and meaning. Corrections are recorded in the vocabulary review. |
| T14 | Day covers and Seoul street hero | Codex, integrated by Claude | done. All 50 lessons use their corresponding illustrations in the day index, lesson hero and sharing card. The Seoul scene appears on Home. |
| T24 | Fill nine gaps in the illustrated course | Codex | done. Realigning the lessons to the original artwork restored coverage for all 50 days. The nine archived images have matching files in `public/images/days/`. |
| T15 | Example sentences per word | Claude | todo |
| T16 | Privacy + Terms | Claude | done, owner contact TODOs remain |
| T17 | Accessibility: Codex adds Playwright + axe-core checks for `/`, `/day/1`, every practice mode, `/review`, 404 (both themes, reduced motion) to CI; Claude fixes findings | **Codex** + Claude | todo |
| T18 | Copy pass | Claude | done |
| T19 | Final review, Lighthouse, Search Console steps | Claude | doing |
| T20 | Performance: split GSAP/Lenis where possible, preload the font and report Lighthouse results | Codex | todo for bundle, font and Lighthouse work. All 51 sharing cards are already JPEGs under 60 KB. |
| T21 | Component tests (Vitest + Testing Library): Session flows for each mode with keyboard (Space, 1-4, Enter, R), results + "practice missed words", progress written to store | **Codex** | todo |
| T22 | Optional: replace string-template prerender with real React SSR prerender (renderToString per route with StaticRouter, hydrateRoot) if it can be done without breaking GSAP/three.js; otherwise document why not | **Codex** | todo |
| T23 | Engine hardening: typed-answer normalization for Korean input (allow typing Hangul in en→ko later), SRS edge cases, tests | **Codex** | todo |

## 6. File ownership (to avoid merge conflicts)

| Owner | Owns |
|-------|------|
| Claude | `AGENTS.md` structure, `src/data/**`, `src/styles/**`, `src/components/**`, `src/pages/**`, `src/hooks/**`, `src/main.jsx`, `src/App.jsx`, `index.html`, `docs/**`, `README.md`, `scripts/postbuild.js` |
| Codex | `.github/**`, `src/lib/**` (engine changes must keep the contract in section 3), `**/__tests__/**`, `e2e/**`, `vite.config.*`, `scripts/make-images.cjs`, `public/og/**`, `package.json` + lockfile (adding deps is fine, tell Claude in section 9) |
| Codex | `public/images/**`, `docs/artwork-unassigned/**` |

Everyone may edit their own task rows and append to the status log.

## 7. Decisions

| Date | Decision | By |
|------|----------|----|
| 2026-11-27 | One data file per day + one shared lesson UI instead of per-day components | Claude |
| 2026-11-27 | Move off Create React App (deprecated) to Vite; pre-render every route | Claude |
| 2026-11-27 | Progress kept in localStorage; no paid/permission state on the client | Claude |
| 2026-11-27 | Cursor removed from the project (owner). Claude takes all UI tasks; Codex keeps tooling, engine, SEO, CI | Owner |
| 2026-11-27 | Plain CSS + tokens instead of Tailwind (fewer deps, design needs custom motion styles) | Claude |
| 2026-11-27 | Days 16-50 drafted by Claude so the course is complete; marked draft until checked | Claude (owner asked to finish without questions) |
| 2026-11-27 | No background video. Motion, the WebGL hero and Codex's illustrations carry the visual weight | Claude |
| 2026-11-27 | v2 design: app structure (Today/Course/Review/Progress), hanji + seal red palette from the art, Noto Serif KR for Hangul. Replaces v1's lime/pine landing-page look | Owner asked for a premium, non-generic app feel |
| 2026-11-28 | Use the original Day 16–50 illustration topics for the replacement lessons and keep their generated vocabulary marked as draft. | Owner / Codex |
| 2026-11-28 | Complete the dictionary review of Days 16–50, record the corrections and merge PR #2 into the v2 design. | Owner / Codex |

## 8. Open questions for the owner

- **Q1 resolved** The owner requested a language review of the generated entries. The review and corrections are recorded in [the vocabulary review](docs/VOCABULARY-REVIEW.md).
- **Q2** "Conversion" means what: sign-ups, paid plan, or daily return? (Paid plan = backend + payment provider = new plan section.)
- **Q3** Stay on GitHub Pages, or move to Vercel/Netlify (needed if we add accounts/payments)?
- **Q5** Site name and domain. Current candidates: "한국어 공부", "Essential Korean Vocabulary".
- **Q6** Name/contact for footer, Privacy, Terms, and structured data.

## 9. Requests between agents

_(format: `- [from → to] request (status)`)_

## 10. Status log (append only, newest at bottom)

_(format: `YYYY-MM-DD HH:MM UTC | agent | task | note`)_

- 2026-11-27 | Claude | setup | Audit done, AGENTS.md created, tasks assigned. Waiting on owner for Q1, Q4, Q7.
- 2026-11-27 | Claude | setup | Push access working. Cursor removed per owner; T05-T09 reassigned to Claude, T17 shared with Codex.
- 2026-11-27 14:45 UTC | Codex | T14 | Owner requested work on docs/ASSETS.md. Preparing the required Day 01 style sample using built-in image generation; remaining covers await sample approval.
- 2026-11-27 14:48 UTC | Codex | T14 | Day 01 sample prepared at public/images/days/day01.webp (1600x1000, 74,914 bytes). Verified image-only 1200x630 crop and no visible text. Built-in image_gen used instead of Gemini. Remaining covers await owner style review required by docs/ASSETS.md; days 16-50 also await T13. No production publication or PR yet.
- 2026-11-27 14:52 UTC | Codex | T14 | Following the Day 01 review, owner requested the next task. Using the sample as the reference for Days 02-15 and the site hero.
- 2026-11-27 14:53 UTC | Codex | T14 | Added 15 day covers and the site hero. All WebPs are 1600 × 1000 and under 131 KB each. Reviewed the centered 1200 × 630 crops. The remaining 35 covers depend on T13 topics and image briefs.
- 2026-11-27 14:55 UTC | Codex | T14 | Owner requested completion of the remaining covers in one batch. Using provisional art topics for Days 16-50 pending T13.
- 2026-11-27 15:03 UTC | Codex | T14 | Completed 50 covers and the site hero. Added the hero and the 15 available lesson covers to the home page. Days 16-50 have asset paths and provisional art topics in docs/ASSETS.md pending T13.
- 2026-11-27 15:07 UTC | Codex | T14 | Deployed to GitHub Pages (gh-pages a747e19). Verified the public homepage, JavaScript, CSS and all 51 image hashes against the tested production build. Checked the lesson menu, dark mode and Day 01 navigation on desktop and mobile.
- 2026-11-27 | Claude | T01-T11,T13,T16,T18 | Full redesign built and tested (14 unit tests). 50 days live. Deployed to GitHub Pages. Codex: start with T12, then T21, T17, T20.
- 2026-11-27 | Claude | T14 merge | Merged codex/T14-vocabulary-artwork. Dropped its edits to the old CRA files. Matched covers 16-50 to the draft days by content (mapping in docs/ASSETS.md), 9 spare covers moved to docs/artwork-unassigned/. Covers shown on Day hero, card hover, OG images (now JPEG); street hero used in a scroll section on Home. Redeployed.
- 2026-11-27 | Claude | design v2 | Critique in docs/DESIGN-CRITIQUE.md. New palette and type, app bar + mobile tabs, Today dashboard, Course map, Progress page, lesson path on Day pages, practice polish (card stack, combo, sounds, richer results). 19 tests. Deployed. Codex tasks unchanged: T12, T21, T17, T20, T22-T24.
- 2026-11-27 15:15 UTC | Codex | T13/T14 | Preparing a single release of the cover-topic word lists and existing practice modes on top of the current Vite app.
- 2026-11-27 15:24 UTC | Codex | T13/T14/T24 | Integrated the illustrated lessons with the redesign on a727f1d. All 17 unit tests passed. The production build generated 54 public routes and 200 practice routes. All 51 sharing JPEGs are below 60 KB. Chrome completed 350 flashcard prompts, 350 four-option quiz questions and four missed-word retries on the integrated build, including Day 50 at mobile width.
- 2026-11-27 15:27 UTC | Codex | T13/T14/T24 | Published source 2a99c9e to GitHub Pages (gh-pages f8f117e). All 105 public lesson, flashcard and quiz URLs for Days 16–50 returned HTTP 200 with matching build hashes. The homepage, three JavaScript/CSS assets, 51 illustrations and 51 sharing cards also matched. On the live site Chrome completed both practice modes and missed-word retries for Day 16 on desktop and Day 50 on mobile. Source review: [PR #2](https://github.com/KhurshidbekUrazaliev/korean-vocab-app/pull/2).
- 2026-11-27 15:39 UTC | Codex | T13 | Completed the owner-requested review of all 350 entries and corrected 15. All 17 unit tests passed. The build contains 35 dictionary-reviewed lesson pages with the corrected words in both the visible list and structured data. See [the correction record](docs/VOCABULARY-REVIEW.md).
- 2026-11-27 15:45 UTC | Codex | T13 | Integrated the reviewed vocabulary with the Today, Course and Progress redesign from 59d2821. All 25 unit tests passed, including progress migration for both earlier releases. Verified the corrected lesson HTML and all 140 practice routes for Days 16–50.
