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
