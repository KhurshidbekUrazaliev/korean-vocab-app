# Accessibility checks

Build and scan the same static files that go to GitHub Pages.

```sh
npm ci
npx playwright install --with-deps chromium
npm run build
npm run test:a11y
```

The runner serves `dist` on loopback under `/korean-vocab-app/`. It resolves extensionless routes to their generated HTML and serves the built 404 page with HTTP 404. Four fresh browser contexts cover light and dark appearance under reduced motion. Desktop checks use a mouse at 1280×900. Mobile checks use Chromium’s Pixel 5 profile at a 390×844 viewport and verify touch input, a coarse pointer and no hover. Before tapping Check in typing practice, the runner verifies that the entire submit button fits the visual viewport and receives the tap at its center. Failure details include the input, button and viewport geometry.

Before each scan, the runner waits for the React UI and fonts to settle. Chromium identifies the web font that actually drew a sample of visible Latin UI text and, where present, Korean display text. Each state report records the matching Pretendard Variable and Noto Serif KR faces. Failed font, stylesheet or script requests appear in the profile report. A transient network error, HTTP 429 or server error from a font service gets one retry in a fresh context. A persistent outage fails this audit because it would otherwise measure the app using its fallback fonts.

Each context scans 18 states. These include the new-visitor landing page, Course, Day 01, both flashcard faces, both quiz directions, typing before and after an error, listening, empty and populated review, a review quiz and its feedback and results, returning Today, Progress and an unknown URL. A real flashcard miss makes the review word due. The word, answer choices and results are checked before the corresponding scan.

Axe scans the whole document using its default rules. The gate compares each reported node with the reviewed combination of rule, axe selector, XPath, viewport, theme and state in `known-findings.json`. An unrecognized occurrence, a page error or an incomplete state sequence fails the run. Resolved findings appear under `unmatchedBaseline` in the summary. Remove their matching baseline entries with the UI fix. Review any new finding against the full report before changing the baseline.

To require zero violations, run:

```sh
A11Y_STRICT=1 npm run test:a11y
```

`e2e/results/summary.json` lists counts, unexpected findings, unmatched baseline entries and execution errors. The four `<viewport>-<theme>.json` files contain the complete axe violations and incomplete checks for each state, including selectors, diagnostic messages and help URLs. Incomplete checks need human review. These outputs are regenerated locally and uploaded in CI. [Current UI findings](FINDINGS.md)
