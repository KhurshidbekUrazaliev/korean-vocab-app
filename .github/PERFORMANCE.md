# Mobile performance on Home and Day 1

Home’s median mobile Lighthouse score rose from 52 to 64. Day 1 moved from 74 to 76. The clearest change in the request trace was earlier discovery of the primary UI font. The app also gained a separately cacheable motion bundle. Cold JavaScript transfer was nearly identical on both builds.

## Cold-load results

Each value is the median of three runs. Parentheses show the full score range. FCP measures the first contentful paint, LCP the largest contentful paint, TBT the total blocking time, and CLS cumulative layout shift.

| Route and build | Score (range) | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home before | 52 (51–64) | 1.87 s | 8.11 s | 844 ms | 0 |
| Home T20 | 64 (64–65) | 1.85 s | 7.66 s | 420 ms | 0 |
| Day 1 before | 74 (68–78) | 1.86 s | 5.94 s | 288 ms | 0 |
| Day 1 T20 | 76 (75–82) | 1.85 s | 5.83 s | 158 ms | 0 |

| Route and build | All resources, bytes | All JavaScript, bytes | Font files, bytes | Font requests |
| --- | ---: | ---: | ---: | ---: |
| Home before | 1,356,514 | 320,668 | 805,497 | 24 |
| Home T20 | 1,275,028 | 320,657 | 723,627 | 22 |
| Day 1 before | 844,245 | 189,243 | 481,685 | 15 |
| Day 1 T20 | 843,250 | 189,218 | 480,619 | 15 |

Lighthouse transfer sizes include compressed responses and headers. Home requests additional Korean font subsets according to the words shown on each visit. The six Home runs requested between 20 and 24 font files. That variation limits conclusions about total bytes and score changes from three samples per build.

## JavaScript and font requests

The entry bundle shrank from 580,516 to 431,182 bytes, or from 189,002 to 132,607 bytes with gzip level 6. Vite now emits GSAP and Lenis in a separate 148,847-byte file (56,130 bytes gzipped). The generated HTML preloads that module on both routes, so it still contributes to the first visit. In an isolated rebuild, changing one Day 50 vocabulary entry changed the application bundle’s filename. The motion file kept both its name, `motion-DZPubiKZ.js`, and its exact contents, allowing browsers to reuse the cached copy after that edit.

The font preload targets `PretendardVariable.subset.91.woff2` from Pretendard 1.3.9. Its URL matches the stylesheet’s declaration for Latin text and common Korean characters. All six T20 traces show one successful request for the file, initiated by the link. Its median start time fell from 270 to 37 ms on Home and from 273 to 49 ms on Day 1. Chrome’s rendered-font inspection confirmed that Pretendard drew the English introduction on Home and the “Dining Out” title on Day 1.

## Measurement method

Both production builds included the same Korean voice-selection update (`7d2cdbe`). The baseline entry was `index-5FdIlLDp.js`, and the T20 entry was `index-DrMuV2d8.js`. Each build was frozen before measurement. A loopback server served its compressed assets under `/korean-vocab-app/`, resolving `/day/1` to `day/1.html`. It used gzip level 6 for HTML, CSS and JavaScript. Public font services were available to both builds.

We used Lighthouse 13.6.0, Chrome 158.0.8127.37 and Node 22.23.5 on an ARM64 Mac. The default mobile navigation audit used a 412 × 823 CSS-pixel viewport at device scale factor 1.75, simulated 150 ms round-trip latency, 1,638.4 Kbps throughput and 4× CPU slowdown. Each measurement started a fresh headless Chrome process with an empty profile and default motion settings.

Three rounds alternated Home and Day 1. Within each route we measured baseline then T20 in rounds one and three, reversing them in round two. Before timing, browser checks verified that React replaced the static HTML on both routes and that there were no page errors. Each accepted Lighthouse report also had to include Home’s hero module or Day 1’s cover and successful resource responses. All 12 runs met those checks and completed without Lighthouse warnings.

To repeat the comparison, build each revision with `npm ci && npm run build` and serve its `dist` using the same compression and clean-route mapping. For a local repeat, `npm run preview -- --host 127.0.0.1 --port 43719 --strictPort` serves the built project at its configured base. Point `CHROME_PATH` to the Chrome executable. Run the following command for each route and revision, changing the report filename on every invocation.

```sh
npx --yes lighthouse@13.6.0 http://127.0.0.1:43719/korean-vocab-app/day/1 \
  --only-categories=performance --chrome-flags="--headless=new" \
  --output=json --output-path=day1-baseline-1.json
```

These measurements describe a first visit on the lab machine. CPU contention, connection timing and the randomized words on Home affect individual samples. A repeat-visit audit or field data from GitHub Pages would answer different questions about caching and real users.

## Update: deferred hero and non-blocking font CSS (2026-11-28)

Home's LCP element was the intro paragraph, held back by the hero entrance fade, two render-blocking font stylesheets and the WebGL field starting during the first render. Three changes:

- The particle field mounts after the page has painted (`requestIdleCallback`, 2 s timeout). Until then the hero shows the same word as still text.
- Both font stylesheets load with `rel="preload"` and switch to `rel="stylesheet"` on load (`<noscript>` fallback). Both use `font-display: swap`.
- The intro paragraph slides in without fading from transparent.

Median of three mobile Lighthouse 13.6.0 runs on the local production build (same machine, same settings):

| Home | Score | FCP | LCP | TBT | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: |
| Before | 55 | 1.99 s | 7.73 s | 754 ms | 3.47 s |
| After | 86 | 2.02 s | 2.02 s | 444 ms | 2.79 s |

The accessibility audit's rendered-font check now waits for the stylesheets to apply before inspecting glyphs.

## Mobile results for the Korean and Arabic courses

First-visit Home had a median score of **93** against the target of 80. Arabic Home scored **91**, and Arabic Day 1 scored **96** with its illustrated cover. Home now opens the device sign-in form for a new learner.

| Cold navigation | Score (range) | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` · first visit | 93 (56–93) | 2.26 s | 2.28 s | 193 ms | <0.001 |
| `/ar` · first visit | 91 (83–93) | 2.29 s | 2.29 s | 234 ms | <0.001 |
| `/ar/day/1` · Greetings | 96 (95–99) | 2.20 s | 2.20 s | 94 ms | 0 |
| `/` · signed-in Korean dashboard | 57 (56–76) | 0.78 s | 6.33 s | 76 ms | 0.469 |
| `/ar` · signed-in Arabic dashboard | 57 (56–72) | 1.27 s | 5.98 s | 37 ms | 0.482 |

One first-visit Home run scored 56, with 1,262 ms of blocking time and a 5.29 s largest contentful paint. The other two scored 93. The enrolled dashboards had the slowest median largest contentful paint. The footer appeared near the top while Today loaded, then moved below the dashboard. Layout shift reached 0.469 on Korean Home and 0.482 on Arabic Home. In a separate scratch build, rendering Today with a static import removed that shift on both routes. The current lesson cover remained the Korean dashboard's largest element.

### Font and build

The course CSS specified Noto Naskh Arabic, but Chrome used the system font Geeza Pro for the Day 1 title before the webfont was available. Vite now bundles the Arabic-script subset from `@fontsource-variable/noto-naskh-arabic@5.3.0` and its SIL Open Font License. One 94,032-byte WOFF2 file covers weights 400–700. Chrome's rendered-font inspector confirmed that this file drew the Arabic greeting on both sign-in pages and the Day 1 title. The Arabic Day 1 cover also returned HTTP 200 in every run. [Font package](https://fontsource.org/fonts/noto-naskh-arabic) · [Upstream font and license](https://github.com/google/fonts/tree/main/ofl/notonaskharabic)

The measured production build combined `main` at `06d2359`, the published Arabic images and cover paths from `46804a3`, and this change's bundled webfont. Its application entry was `index-BJG6fhsS.js`. The course registry at that revision still had an empty Arabic home scene, so the Arabic sign-in measurements exclude that below-the-fold image.

### Repeating the measurements

Build with `npm ci && npm run build`. Serve `dist` at `/korean-vocab-app/` with extensionless routes resolving to their generated HTML and gzip enabled for HTML, CSS and JavaScript. Use Lighthouse 13.6.0's default mobile performance audit. These runs used Chrome 158.0.8127.37 and Node 22.23.5 on ARM64 macOS. Each of three rounds visited all five states in a rotated order. Every visit started a new Chrome process with an empty network cache. The table shows the median of each metric and the full score range. All 15 reports completed on the requested URL without a failed HTTP response, page error or Lighthouse warning.

Leave browser storage empty for the first-visit measurements. For each enrolled measurement, set only the relevant device profile before the app's first script runs. The following snippet uses Lighthouse's Puppeteer page argument so its normal cache and storage resets stay enabled. Run it in a scratch directory with `npm install lighthouse@13.6.0 puppeteer-core@25.19.0`. Set `URL` to the full route, `CHROME_PATH` to the browser executable and `COURSE` to `ko` or `ar` for enrolled runs. Omit `COURSE` for a first visit.

```js
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer-core';

const { URL: url, COURSE: course, CHROME_PATH: executablePath } = process.env;
const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  if (course) {
    await page.evaluateOnNewDocument((origin, course) => {
      if (location.origin === origin && window === top) {
        localStorage.setItem('kv.profile', JSON.stringify({
          name: 'Sample', course, goal: 10, createdAt: '2026-11-28T00:00:00.000Z',
        }));
      }
    }, new URL(url).origin, course);
  }
  const { lhr } = await lighthouse(url, { onlyCategories: ['performance'] }, undefined, page);
  console.log(lhr.finalDisplayedUrl, Math.round(100 * lhr.categories.performance.score));
} finally {
  await browser.close();
}
```
