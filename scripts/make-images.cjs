// Generates link-preview images (1200x630) and app icons from the day data.
// Dev-only: needs Playwright with Chromium. Run with `node scripts/make-images.cjs`
// after adding or renaming days, then commit the files in public/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const days = fs.readdirSync(path.join(root, 'src/data/days')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(root, 'src/data/days', f), 'utf8'))).sort((a, b) => a.number - b.number);
const pad = (n) => String(n).padStart(2, '0');
const FONT = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700&display=swap">';
const base = `*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#f6ede2;color:#1c1a16;font-family:'Pretendard Variable',sans-serif;overflow:hidden;position:relative}
.brand{position:absolute;left:64px;bottom:56px;display:flex;align-items:center;gap:14px;font-size:22px;font-weight:600}
.mark{width:48px;height:48px;border-radius:10px;background:#a8322a;color:#fffaf3;display:grid;place-items:center;font-family:'Noto Serif KR',serif;font-weight:700;font-size:24px}
.meta{position:absolute;right:64px;bottom:62px;font-size:20px;color:#5f584d;font-weight:500}
.chip{display:inline-block;background:#f2ddd2;color:#a8322a;font-weight:600;padding:4px 12px;border-radius:8px}`;

const coverData = (d) => d.cover && `data:image/webp;base64,${fs.readFileSync(path.join(root, 'public', d.cover)).toString('base64')}`;

const dayHtml = (d) => `<!doctype html><html><head>${FONT}<style>${base}
.cover{position:absolute;right:48px;top:48px;width:560px;height:350px;border-radius:28px;object-fit:cover;object-position:80% 50%;background:#f6ecdf;box-shadow:0 24px 64px rgb(20 21 17/.12)}
.num{position:absolute;right:40px;top:-40px;font-size:520px;font-weight:200;letter-spacing:-0.08em;color:#ebdfcf;line-height:1}
.ko{position:absolute;left:64px;top:150px;font-family:'Noto Serif KR',serif;font-size:${d.cover ? (d.titleKo.length > 4 ? 76 : 100) : d.titleKo.length > 5 ? 108 : 132}px;font-weight:700;letter-spacing:-0.03em;line-height:1}
.en{position:absolute;left:68px;top:${d.cover ? 270 : d.titleKo.length > 5 ? 290 : 310}px;font-size:${d.cover ? 36 : 44}px;max-width:${d.cover ? 520 : 1000}px;font-weight:300;letter-spacing:-0.03em}
.eyebrow{position:absolute;left:68px;top:84px;font-size:18px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#5f584d}
.words{position:absolute;left:68px;top:${d.cover ? 340 : d.titleKo.length > 5 ? 370 : 390}px;font-size:${d.cover ? 22 : 26}px;max-width:${d.cover ? 520 : 1000}px;font-weight:600;color:#5f584d}
</style></head><body>${d.cover ? `<img class="cover" src="${coverData(d)}">` : `<div class="num">${pad(d.number)}</div>`}<div class="eyebrow">Day ${pad(d.number)} · 10 Korean words</div>
<div class="ko">${d.titleKo}</div><div class="en">${d.title}</div><div class="words">${d.words.slice(0, 4).map((w) => w.korean).join(' · ')}</div>
<div class="brand"><span class="mark">한</span>Essential Korean Vocabulary</div><div class="meta"><span class="chip">Audio</span> · Flashcards · Quiz · Typing · Listening</div></body></html>`;

const homeHtml = `<!doctype html><html><head>${FONT}<style>${base}
h1{position:absolute;left:64px;top:84px;font-size:104px;font-weight:500;letter-spacing:-0.05em;line-height:.95}
.big{position:absolute;right:-10px;bottom:-60px;font-family:'Noto Serif KR',serif;font-size:320px;font-weight:700;letter-spacing:-0.04em;color:#a8322a;line-height:1}
</style></head><body><h1>Learn Korean,<br>ten words<br>a day.</h1><div class="big">공부</div>
<div class="brand"><span class="mark">한</span>${days.length} days · ${days.length * 10} words</div></body></html>`;

const iconHtml = (size) => `<!doctype html><html><head>${FONT}<style>*{margin:0}body{width:${size}px;height:${size}px;background:#a8322a;display:grid;place-items:center;font-family:'Noto Serif KR',serif}
span{color:#fffaf3;font-weight:700;font-size:${Math.round(size * 0.56)}px;line-height:1;letter-spacing:-0.04em}</style></head><body><span>한</span></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const shot = async (html, file, w = 1200, h = 630) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const jpeg = file.endsWith('.jpg');
    await page.screenshot({ path: path.join(root, 'public', file), type: jpeg ? 'jpeg' : 'png', quality: jpeg ? 84 : undefined });
  };
  fs.rmSync(path.join(root, 'public/og'), { recursive: true, force: true });
  fs.mkdirSync(path.join(root, 'public/og'), { recursive: true });
  await shot(homeHtml, 'og/home.jpg');
  for (const d of days) await shot(dayHtml(d), `og/day${pad(d.number)}.jpg`);
  for (const [s, f] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) await shot(iconHtml(s), f, s, s);
  await browser.close();
  console.log(`made ${days.length + 1} preview images and 4 icons`);
})();
