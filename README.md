# Essential Korean Vocabulary (한국어 공부)

A Korean vocabulary course in daily sets of ten words. Each word has Hangul, romanization, an English meaning and audio. Learners practice with flashcards, multiple choice (both directions), typing and listening, and every answer feeds a spaced-review schedule so missed words come back the next day.

Live: https://khurshidbekurazaliev.github.io/korean-vocab-app/

- 50 days, 500 words. Days 01-15 come from the owner's class notes. Days 16-50 are **draft** lists (marked in the data and the UI) until they are checked.
- No accounts. Progress is stored in the browser (`localStorage`).

## Stack

- React 19 + React Router 7, built with Vite
- GSAP (ScrollTrigger, SplitText) and Lenis for motion and smooth scrolling
- three.js for the hero particle field (loaded in its own chunk)
- Plain CSS with design tokens in `src/styles/tokens.css`
- Vitest for unit tests
- GitHub Pages hosting

## Run locally

```bash
npm install
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build into `dist/`, then `scripts/postbuild.js` writes per-route HTML (titles, descriptions, Open Graph, JSON-LD, plain-HTML content), `404.html`, `sitemap.xml`, `robots.txt` and `llms.txt` |
| `npm test` | Unit tests for the practice logic and the word data |
| `npm run deploy` | Builds and publishes `dist/` to the `gh-pages` branch |
| `node scripts/make-images.cjs` | Regenerates link-preview images (`public/og/`) and icons. Needs Playwright. Run after adding or renaming days. |

## Adding a day

1. Add `src/data/days/dayNN.json` following the schema in `AGENTS.md` (10 words, unique Korean words across all days).
2. Run `npm test` (checks numbering, word count, duplicates).
3. Run `node scripts/make-images.cjs` for the preview image.

## Project structure

```
src/
  data/days/       one JSON file per day
  lib/             practice logic: shuffle, quiz, spaced review, progress, streak, speech, motion setup
  components/      header, footer, page transitions, hero particle field, practice session
  pages/           Home, Day, Practice, Review, Privacy/Terms, NotFound
  styles/          tokens, base, and per-area CSS
scripts/           postbuild (SEO files) and image generation
```

Work is coordinated between agents in `AGENTS.md`.

## License

Proprietary, all rights reserved. See `LICENSE`.
