// Run after changing lesson titles, artwork or the logo. --previews-only skips app icons;
// --days=8,16-50 regenerates just those lesson cards in both courses.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const pad = n => String(n).padStart(2, '0');
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const courses = [
  { id: 'ko', name: 'Korean', native: '한국어', dir: 'ltr', hero: 'images/hero.webp', out: 'og' },
  { id: 'ar', name: 'Arabic', native: 'الْعَرَبِيَّة', dir: 'rtl', hero: 'images/ar/hero.webp', out: 'og/ar' },
];
// App icons: [file, size, corner radius on the 512 grid]. iOS and maskable icons are full bleed
// because the system rounds them itself.
const ICONS = [
  ['favicon-32.png', 32, 96], ['apple-touch-icon.png', 180, 0], ['icon-192.png', 192, 112],
  ['icon-512.png', 512, 112], ['icon-maskable-512.png', 512, 0],
];
let brand; // src/data/brand.js, an ES module, loaded in generate()

function loadDays(id) {
  const dir = path.join(root, 'src/data', id);
  return fs.readdirSync(dir).filter(file => /^day\d+\.json$/.test(file))
    .map(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')))
    .sort((a, b) => a.number - b.number);
}

function requestedDays(days) {
  const option = process.argv.find(arg => arg.startsWith('--days='));
  if (!option) return null;
  const requested = new Set();
  for (const part of option.slice(7).split(',')) {
    const range = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!range) throw Error('Expected --days=8,16-50');
    const from = Number(range[1]), to = Number(range[2] || range[1]);
    if (from < 1 || from > to || to > days.at(-1).number) throw Error('Invalid day range: ' + part);
    for (let i = from; i <= to; i++) requested.add(i);
  }
  return requested;
}

const css = `
@font-face{font-family:'Noto Naskh Arabic';src:url('/arabic.woff2') format('woff2');font-weight:400 700}
*{box-sizing:border-box}
body{margin:0;background:#f6ecdf;color:#26221d;font-family:Arial,sans-serif}
main{position:relative;width:1200px;height:630px;overflow:hidden}
[lang=ko]{font-family:'Noto Serif KR Variable',serif}
[lang=ar]{font-family:'Noto Naskh Arabic',serif}
header,footer{position:absolute;left:60px;right:60px;display:flex;align-items:center}
header{top:40px;gap:14px;font-size:26px;font-weight:600;letter-spacing:-.025em}
header svg{display:block;flex:none}
.art{position:absolute;right:52px;top:117px;width:556px;height:366px;object-fit:cover;object-position:78% 50%;border:1px solid #d5c7b6;border-radius:18px}
.copy{position:absolute;top:133px;left:60px;width:504px}
.kicker{color:#8c3029;font-weight:700;font-size:22px;letter-spacing:.035em;margin:0 0 12px}
.native{display:block;width:max-content;white-space:nowrap;margin:0;font-weight:650;font-size:88px;line-height:1.55}
.native[lang=ar]{font-size:94px;line-height:1.54}
.english{font-size:39px;font-weight:500;letter-spacing:-.025em;line-height:1.12;margin:4px 0 0}
footer{bottom:41px;min-height:63px;border-top:1px solid #b9ac99;padding-top:19px;gap:26px;justify-content:space-between;color:#51483b}
.samples{font-size:27px;line-height:1.6;white-space:nowrap;font-weight:600}
.samples[lang=ar]{font-size:31px}
.count{white-space:nowrap;font-size:21px;letter-spacing:-.015em}
`;

function card(course, days, day) {
  const native = day ? day.titleNative : course.native;
  const label = day ? day.title : 'Learn ' + course.name;
  const cover = day ? day.cover : course.hero;
  if (!cover) throw Error('Missing artwork for ' + (day?.id || course.id));
  const image = fs.readFileSync(path.join(publicDir, cover)).toString('base64');
  const lang = 'lang="' + course.id + '" dir="' + course.dir + '"';
  const count = day ? day.words.length : days.reduce((total, d) => total + d.words.length, 0);
  const samples = (day || days[0]).words.slice(0, 3).map(w => '<bdi>' + esc(w.term) + '</bdi>').join(' · ');
  return `<main>
    <header>${brand.markSvg({ size: 46, radius: 100 })}${brand.BRAND}</header>
    <img class="art" src="data:image/webp;base64,${image}" alt="">
    <div class="copy"><p class="kicker">${day ? course.name + ' · Day ' + pad(day.number) : course.name + ' course'}</p>
      <h1 class="native" ${lang}>${esc(native)}</h1><p class="english">${esc(label)}</p></div>
    <footer><div class="samples" ${lang}>${samples}</div><div class="count">
      ${day ? count + ' words' : days.length + ' days · ' + count + ' words'}
    </div></footer></main>`;
}

// Serve the pinned fonts to the rendering browser without an external service.
async function loadTemplate(page) {
  const origin = 'https://cards.invalid';
  const korean = path.dirname(require.resolve('@fontsource-variable/noto-serif-kr/wght.css'));
  const arabic = require.resolve('@fontsource-variable/noto-naskh-arabic/files/noto-naskh-arabic-arabic-wght-normal.woff2');
  await page.route(origin + '/**', route => {
    const name = new URL(route.request().url()).pathname;
    if (name === '/') return route.fulfill({ contentType: 'text/html', body:
      '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/ko/wght.css"><style>' + css + '</style><body></body>' });
    if (name === '/arabic.woff2') return route.fulfill({ path: arabic, contentType: 'font/woff2' });
    if (name === '/ko/wght.css' || /^\/ko\/files\/[\w-]+\.woff2$/.test(name)) {
      return route.fulfill({ path: path.join(korean, name.slice(4)), contentType: name.endsWith('.css') ? 'text/css' : 'font/woff2' });
    }
    return route.abort();
  });
  await page.goto(origin);
}

async function draw(page, html) {
  await page.evaluate(async markup => {
    document.body.innerHTML = markup;
    const title = document.querySelector('.native');
    const copy = document.querySelector('.copy');
    const footer = document.querySelector('footer');
    const samples = document.querySelector('.samples');
    const face = title.lang === 'ar' ? 'Noto Naskh Arabic' : 'Noto Serif KR Variable';
    const fonts = await document.fonts.load('650 64px "' + face + '"', title.textContent + samples.textContent);
    if (!fonts.length || fonts.some(font => font.status !== 'loaded')) throw Error('Could not load ' + face);
    await document.fonts.ready;
    await document.querySelector('.art').decode();
    function fit(element, width) {
      let size = parseFloat(getComputedStyle(element).fontSize);
      while (element.offsetWidth > width && size > 22) element.style.fontSize = --size + 'px';
      if (element.offsetWidth > width) throw Error('Text exceeds the card: ' + element.textContent);
    }
    fit(title, copy.clientWidth);
    fit(samples, footer.clientWidth - document.querySelector('.count').offsetWidth - 28);
    if (copy.getBoundingClientRect().bottom + 12 >= footer.getBoundingClientRect().top)
      throw Error('Title overlaps the footer: ' + title.textContent);
  }, html);
}

async function saveJpeg(page, file) {
  for (const quality of [86, 80, 74, 68, 62, 56, 50, 44, 38]) {
    const jpeg = await page.screenshot({ type: 'jpeg', quality });
    if (jpeg.length < 60000) {
      fs.writeFileSync(file, jpeg);
      return;
    }
  }
  throw Error('Cannot fit the sharing image into 60 KB: ' + file);
}

async function generate() {
  brand = await import('../src/data/brand.js');
  const browser = await chromium.launch({
    channel: process.env.CHROMIUM_CHANNEL || undefined,
    executablePath: process.env.CHROME_PATH || undefined, // same override as the e2e scans
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await loadTemplate(page);
    let total = 0;
    for (const course of courses) {
      const days = loadDays(course.id);
      const selected = requestedDays(days);
      const out = path.join(publicDir, course.out);
      fs.mkdirSync(out, { recursive: true });
      const cards = selected ? days.filter(day => selected.has(day.number)) : [null, ...days];
      for (const day of cards) {
        await draw(page, card(course, days, day));
        await saveJpeg(page, path.join(out, day ? 'day' + pad(day.number) + '.jpg' : 'home.jpg'));
        total++;
      }
    }
    if (!process.argv.some(arg => arg.startsWith('--days=') || arg === '--previews-only')) {
      fs.writeFileSync(path.join(publicDir, 'favicon.svg'), brand.markSvg({ size: 32, radius: 96 }) + '\n');
      for (const [file, size, radius] of ICONS) {
        await page.setViewportSize({ width: size, height: size });
        await page.evaluate(svg => {
          document.body.style.background = 'transparent';
          document.body.innerHTML = svg;
        }, brand.markSvg({ size, radius }));
        await page.screenshot({ path: path.join(publicDir, file), omitBackground: true });
      }
    }
    console.log('Generated ' + total + ' sharing cards.');
  } finally {
    await browser.close();
  }
}

generate().catch(error => { console.error(error); process.exitCode = 1; });
