// Regenerate committed sharing cards and icons with Playwright and Chromium.
// Use --previews-only for content or artwork changes. Install a Korean UI font
// (Pretendard or Noto Sans KR) when the operating system lacks one.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const daysDir = path.join(root, 'src/data/days');
const days = fs.readdirSync(daysDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(fs.readFileSync(path.join(daysDir, file), 'utf8')))
  .sort((a, b) => a.number - b.number);
const wordCount = days.reduce((sum, day) => sum + day.words.length, 0);
const pad = (number) => String(number).padStart(2, '0');
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fonts = "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";

function cardHtml({ eyebrow, heading, language, subtitle, detail, cover }) {
  const image = cover && fs.readFileSync(path.join(publicDir, cover)).toString('base64');
  const artwork = image ? `<div class="art"><img src="data:image/webp;base64,${image}" alt=""></div>` : '';
  return `<!doctype html><html lang="en"><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0 }
    body { width:1200px; height:630px; background:#f3f2ec; color:#141511; font-family:${fonts}; position:relative }
    .art { position:absolute; inset:0 0 0 550px; overflow:hidden; background:#f7f3e9 }
    .art img { width:100%; height:100%; object-fit:cover; object-position:75% center }
    .copy { position:absolute; left:52px; top:56px; bottom:140px; width:460px; display:flex; flex-direction:column; justify-content:center; align-items:flex-start }
    .eyebrow { font-size:20px; font-weight:650; background:#d4ea6b; border-radius:7px; padding:5px 11px; margin-bottom:25px }
    h1 { font-size:74px; letter-spacing:-.055em; line-height:1.12; word-break:keep-all; overflow-wrap:anywhere }
    h1:lang(en) { font-size:71px; font-weight:550 }
    .subtitle { margin-top:16px; font-size:34px; font-weight:400; letter-spacing:-.035em; line-height:1.16 }
    .detail { margin-top:23px; font-size:22px; color:#55564e; line-height:1.4; word-break:keep-all }
    footer { position:absolute; left:52px; bottom:50px; display:flex; align-items:center; gap:12px; font-weight:650; font-size:21px }
    .mark { width:44px; height:44px; border-radius:50%; background:#141511; color:#d4ea6b; display:grid; place-items:center; font-size:23px }
    </style><body>${artwork}
    <section class="copy"><p class="eyebrow">${escape(eyebrow)}</p><h1 lang="${language}">${escape(heading)}</h1>
    <p class="subtitle">${escape(subtitle)}</p><p class="detail" lang="ko">${escape(detail)}</p></section>
    <footer><span class="mark" lang="ko">한</span> Essential Korean Vocabulary</footer></body></html>`;
}

function iconHtml(size) {
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><style>*{margin:0}body{width:${size}px;height:${size}px;background:#141511;display:grid;place-items:center;font-family:${fonts}}
    span{color:#d4ea6b;font-weight:700;font-size:${Math.round(size * 0.56)}px;line-height:1;letter-spacing:-0.04em}</style><span>한</span></html>`;
}

async function generate() {
  const browser = await chromium.launch({ channel: process.env.CHROMIUM_CHANNEL || undefined });
  try {
    const page = await browser.newPage({ viewport: { width:1200, height:630 }, deviceScaleFactor:1 });
    const ogDir = path.join(publicDir, 'og');
    fs.mkdirSync(ogDir, { recursive:true });
    async function preview(name, values) {
      await page.setContent(cardHtml(values));
      await page.evaluate(async () => {
        await document.fonts.ready;
        await document.querySelector('img')?.decode();
        const copy = document.querySelector('.copy');
        if (copy.scrollHeight > copy.clientHeight + 1 || copy.scrollWidth > copy.clientWidth + 1) {
          throw new Error('Preview title overflows: ' + document.querySelector('h1').textContent);
        }
      });
      for (const quality of [83, 76, 68, 60, 52, 44, 36]) {
        const jpeg = await page.screenshot({ type: 'jpeg', quality });
        if (jpeg.length < 60000) {
          fs.writeFileSync(path.join(ogDir, name + '.jpg'), jpeg);
          return;
        }
      }
      throw new Error('Preview exceeds 60 KB: ' + name);
    }

    await preview('home', {
      eyebrow: `${days.length} days · ${wordCount} words`,
      heading:'Learn Korean one day at a time.', language:'en',
      subtitle:'Vocabulary and daily practice', detail:'', cover:'images/hero.webp'
    });
    for (const d of days) {
      await preview('day' + pad(d.number), {
        eyebrow:`Day ${pad(d.number)} · ${d.words.length} words`, heading:d.titleKo, language:'ko',
        subtitle:d.title, detail:d.words.slice(0,3).map((w) => w.korean).join(' · '), cover:d.cover
      });
    }
    if (!process.argv.includes('--previews-only')) {
      for (const [size, file] of [[32,'favicon-32.png'],[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png']]) {
        await page.setViewportSize({ width:size, height:size });
        await page.setContent(iconHtml(size));
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path:path.join(publicDir, file) });
      }
    }
    console.log(`Generated ${days.length + 1} sharing cards.`);
  } finally {
    await browser.close();
  }
}
generate().catch((error) => { console.error(error); process.exitCode = 1; });
