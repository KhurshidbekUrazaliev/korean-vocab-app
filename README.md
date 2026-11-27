# Essential Korean Vocabulary (한국어 공부)

A Korean vocabulary app in daily sets of ten words. Each word has Hangul, romanization, an English meaning and audio. Each day is a four-step lesson (flashcards, multiple choice in both directions, typing, listening), and every answer feeds a spaced-review schedule. Returning learners land on a Today dashboard with their next step, due reviews, streak and daily goal.

[Open the course on GitHub Pages](https://khurshidbekurazaliev.github.io/korean-vocab-app/)

- 50 days, 500 words. Days 01-15 come from the owner's class notes. Days 16–50 contain 350 entries written for their illustrated topics. Each was checked for Hangul spelling and spacing, Revised Romanization, and the English meaning used in the lesson. [Vocabulary review and corrections](docs/VOCABULARY-REVIEW.md)
- No accounts. Progress is stored in the browser (`localStorage`).

## Practice the illustrated lessons

Choose a day from **Course**. In its lesson steps, select **Flashcards** to study or **Multiple choice** to take the quiz. A flashcard reveals the meaning and romanization. A multiple-choice round covers all ten words, supports both translation directions, and lets learners retry missed words. For example, try [Day 16 · Riding the subway](https://khurshidbekurazaliev.github.io/korean-vocab-app/day/16) or [Day 50 · Graduation day](https://khurshidbekurazaliev.github.io/korean-vocab-app/day/50). All 50 days have a cover in the index, on the lesson page and on the sharing card. The [asset brief](docs/ASSETS.md) lists the full series and the Seoul street hero.

Returning learners keep their study dates, Days 01–15 scores, and spaced-review history for words retained with the same meaning. Scores for the replaced sets start fresh. The previous progress record stays in the browser.

## Stack

- React 19 + React Router 7, built with Vite
- GSAP (ScrollTrigger, SplitText) and Lenis for motion and smooth scrolling
- three.js for the hero particle field (loaded in its own chunk)
- Plain CSS with design tokens in `src/styles/tokens.css` (see `docs/DESIGN-CRITIQUE.md`); Noto Serif KR for Hangul, Pretendard for UI
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
| `node scripts/make-images.cjs` | Regenerates sharing images and icons using Playwright, Chromium and a Korean font. Use `--previews-only` after a lesson or cover changes. Set `CHROMIUM_CHANNEL=chrome` to use local Chrome. |

## Adding a day

1. Add `src/data/days/dayNN.json` following the schema in `AGENTS.md` (10 words, unique Korean words across all days). Save the cover as `public/images/days/dayNN.webp` and use `images/days/dayNN.webp` in the JSON.
2. Run `npm test` (checks numbering, word count, duplicates).
3. Run `node scripts/make-images.cjs --previews-only` to regenerate sharing images.

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
