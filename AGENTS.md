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

## 2. Current state (2026-11-27, after Claude's redesign)

- Vite + React 19 + React Router 7. GSAP (ScrollTrigger, SplitText, CustomEase), Lenis smooth
  scroll, three.js hero (lazy chunk). Plain CSS with tokens. Vitest. Deployed to GitHub Pages
  from the `gh-pages` branch with `npm run deploy`.
- **50 days / 500 words.** Days 01-15 = owner's notes (`status: verified`), with 4 typos fixed
  (동특증→동아리 활동, 짐장히→굉장히, 마지다→마치다, 영덩이→엉덩이; each has a `note`).
  Days 16-50 = Claude's draft lists (`status: draft`, `source: generated`), shown with a Draft badge.
- Every public route gets static HTML from `scripts/postbuild.js`: own title, description,
  canonical, OG/Twitter tags, per-day 1200x630 preview image, JSON-LD, and the word list as
  plain HTML inside `#root`. Sitemap, robots.txt (AI bots allowed), llms.txt, 404.html.
- Design follows the owner's reference set (Dayora/Optivolt style): warm paper neutrals, one lime
  accent, deep pine band, light-weight display type, Pretendard, rounded cards with chips.
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
    motion.js               GSAP plugin registration + reducedMotion()
  hooks/                    useProgress (store over localStorage), useTheme
  components/               Header, Footer, Motion (Lenis + curtain + TLink), Reveal,
                            HangulField (three.js), Session (all practice modes + results),
                            SpeakButton, Icons
  pages/                    Home, Day, Practice, Review, Legal (Privacy, Terms), NotFound
  styles/                   tokens.css, base.css, home.css, day.css, practice.css
scripts/postbuild.js        per-route HTML + SEO files (runs in `npm run build`)
scripts/make-images.cjs     OG images + icons (dev-only, Playwright)
```

**Routes**: `/` · `/day/:n` · `/day/:n/practice/:mode` (flashcards|choice|typing|listening,
noindex) · `/review` · `/privacy` · `/terms` · anything else → app 404 (served via 404.html).
Title pattern: `Day 07: Travel | Essential Korean Vocabulary`.

Links between pages use `TLink` (a real `<a href>` that plays the curtain). Page `<title>`/meta
are rendered by React 19 inside each page; postbuild bakes the same values into static HTML.

### Data schema (`src/data/days/dayNN.json`)

```json
{
  "id": "day07", "number": 7, "slug": "travel", "title": "Travel", "titleKo": "여행",
  "status": "verified", "source": "owner-notes", "cover": null,
  "words": [{ "id": "day07-01", "korean": "기대하다", "romanization": "gidaehada", "english": "to expect", "note": "optional" }]
}
```
`status`: `verified` | `draft`. `source`: `owner-notes` | `generated`. Tests enforce 10 words
per day, sequential numbers, unique ids and unique Korean words across all days.

### Practice engine (`src/lib`)

```js
shuffle(array) -> new array                       // Fisher-Yates
buildMultipleChoice(word, pool, { count = 4, direction = 'ko-en' }) -> { prompt, options, answerId }
checkTyped(input, word, { direction }) -> { correct, closeness }   // UI accepts closeness >= 0.8
schedule(state, correct, now) -> { box, dueAt, seen, correctCount } // boxes 1-5, [0,1,3,7,16] days
getDueWords(progress, allWords, now) -> word[]
loadProgress() / saveProgress(p)                  // key "kv.progress.v1"
getStreak(progress, now) -> { current, best, practicedToday }
speak(text, { rate })                             // ko-KR speechSynthesis
```

## 4. Design system

- Tokens in `src/styles/tokens.css`. Light: paper `#f3f2ec`, surface `#fff`, ink `#141511`,
  ink-2 `#55564e`, line `#d9d7cc`, accent `#d4ea6b`, pine `#1f3a28`. Dark theme via
  `html[data-theme=dark]` (toggle in header, defaults to system).
- Contrast (WCAG AA, checked 2026-11-27): ink/paper 16.35, ink-2/paper 6.62, ink-2/surface-2 6.04,
  accent-ink/accent 13.78, pine-ink/pine 10.96, pine-2/pine 7.05, bad/surface 6.92;
  dark: ink/paper 16.14, ink-2/surface-2 6.60, bad/surface 7.47.
- Type: Pretendard Variable (jsDelivr). Display weight 200-300, tracking -0.045em. Korean words 600.
- Spacing 4/8/12/16/24/32/48/64 (+96/128 for sections). Radius 8/16/28/pill.
- No gradients, glass blur, glow, emoji, or stock icons beyond the few in `Icons.jsx`.
- Buttons say what happens ("Start flashcards", "Practice the 3 missed words").

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
| T13 | Days 16-50 | Claude | done as drafts. Owner to verify or send real lists |
| T14 | Day cover images via Gemini (`docs/ASSETS.md`), then show on Day page hero + OG | Owner → Claude | optional |
| T15 | Example sentences per word | Claude | todo |
| T16 | Privacy + Terms | Claude | done, owner contact TODOs remain |
| T17 | Accessibility: Codex adds Playwright + axe-core checks for `/`, `/day/1`, every practice mode, `/review`, 404 (both themes, reduced motion) to CI; Claude fixes findings | **Codex** + Claude | todo |
| T18 | Copy pass | Claude | done |
| T19 | Final review, Lighthouse, Search Console steps | Claude | doing |
| T20 | Performance: split GSAP/Lenis from the main chunk where possible, convert `public/og/*.png` to optimized PNG/JPEG under 60 KB, add `<link rel=preload>` for the font, report Lighthouse scores | **Codex** | todo |
| T21 | Component tests (Vitest + Testing Library): Session flows for each mode with keyboard (Space, 1-4, Enter, R), results + "practice missed words", progress written to store | **Codex** | todo |
| T22 | Optional: replace string-template prerender with real React SSR prerender (renderToString per route with StaticRouter, hydrateRoot) if it can be done without breaking GSAP/three.js; otherwise document why not | **Codex** | todo |
| T23 | Engine hardening: typed-answer normalization for Korean input (allow typing Hangul in en→ko later), SRS edge cases, tests | **Codex** | todo |

## 6. File ownership (to avoid merge conflicts)

| Owner | Owns |
|-------|------|
| Claude | `AGENTS.md` structure, `src/data/**`, `src/styles/**`, `src/components/**`, `src/pages/**`, `src/hooks/**`, `src/main.jsx`, `src/App.jsx`, `index.html`, `docs/**`, `README.md`, `scripts/postbuild.js` |
| Codex | `.github/**`, `src/lib/**` (engine changes must keep the contract in section 3), `**/__tests__/**`, `e2e/**`, `vite.config.*`, `scripts/make-images.cjs`, `public/og/**`, `package.json` + lockfile (adding deps is fine, tell Claude in section 9) |
| Owner / Gemini | `public/images/**` |

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
| 2026-11-27 | No background video. Motion and the WebGL hero carry the visual weight; photos only if real images arrive (T14) | Claude |

## 8. Open questions for the owner

- **Q1** Days 16-50 are drafts. Send your real lists, or confirm the drafts after checking.
- **Q2** "Conversion" means what: sign-ups, paid plan, or daily return? (Paid plan = backend + payment provider = new plan section.)
- **Q3** Stay on GitHub Pages, or move to Vercel/Netlify (needed if we add accounts/payments)?
- **Q4** Want Gemini cover images per day (T14)? Prompts are in docs/ASSETS.md.
- **Q5** Site name and domain. Current candidates: "한국어 공부", "Essential Korean Vocabulary".
- **Q6** Name/contact for footer, Privacy, Terms, and structured data.

## 9. Requests between agents

_(format: `- [from → to] request (status)`)_

## 10. Status log (append only, newest at bottom)

_(format: `YYYY-MM-DD HH:MM UTC | agent | task | note`)_

- 2026-11-27 | Claude | setup | Audit done, AGENTS.md created, tasks assigned. Waiting on owner for Q1, Q4, Q7.
- 2026-11-27 | Claude | setup | Push access working. Cursor removed per owner; T05-T09 reassigned to Claude, T17 shared with Codex.
- 2026-11-27 | Claude | T01-T11,T13,T16,T18 | Full redesign built and tested (14 unit tests). 50 days live. Deployed to GitHub Pages. Codex: start with T12, then T21, T17, T20.
