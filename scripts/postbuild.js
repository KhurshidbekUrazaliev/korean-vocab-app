// Runs after `vite build`. For every public route it writes dist/<route>.html
// with its own title, description, canonical URL, Open Graph/Twitter tags, JSON-LD,
// and a plain-HTML version of the content inside #root, so crawlers and link
// previews get real content and a 200 status. React replaces that markup on load.
// Also writes 404.html, sitemap.xml, robots.txt, llms.txt and the service worker (sw.js).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { SITE, NAME, pageMetadata, socialTags } from '../src/lib/pageMetadata.js';
import { MODE_TITLES } from '../src/lib/stats.js';

const DIST = 'dist';
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function loadCourse(id) {
  const dir = join('src/data', id);
  const days = readdirSync(dir)
    .filter((f) => /^day\d+\.json$/.test(f))
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
    .sort((a, b) => a.number - b.number);
  const base = id === 'ar' ? '/ar' : '';
  return { id, base, days, lang: id, dir: id === 'ar' ? 'rtl' : 'ltr', name: id === 'ar' ? 'Arabic' : 'Korean', words: days.reduce((n, d) => n + d.words.length, 0) };
}
const COURSES = { ko: loadCourse('ko'), ar: loadCourse('ar') };
const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

const BASE = '/korean-vocab-app/';

// A day's cover is its largest element, but React only adds it after the scripts run.
// Preloading it from the static HTML lets the browser fetch it right away.
function coverPreload(path) {
  for (const c of Object.values(COURSES)) {
    const day = c.days.find((d) => path === `${c.base}/day/${d.number}`);
    if (day?.cover) return `<link rel="preload" as="image" href="${BASE}${esc(day.cover)}" fetchpriority="high" />`;
  }
  return '';
}

function page(path, body = '') {
  const info = pageMetadata(path, COURSES);
  const head = [
    coverPreload(path),
    `<title>${esc(info.title)}</title>`,
    `<meta name="description" content="${esc(info.description)}" />`,
    info.noindex ? '<meta data-route-head name="robots" content="noindex" />' : `<link data-route-head rel="canonical" href="${esc(info.url)}" />`,
    ...Object.entries(socialTags(info)).map(([key, value]) =>
      `<meta data-route-head ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${esc(value)}" />`),
    info.jsonLd ? `<script data-route-head type="application/ld+json">${JSON.stringify(info.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ');
  return shell
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body ? `<div class="prerender">${body}</div>` : ''}</div>`);
}

// GitHub Pages serves /day/7 from day/7.html with a 200 (a day/7/index.html would 301 to /day/7/).
function write(path, html) {
  const file = join(DIST, `${path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const nav = (c) =>
  `<nav><a href="${SITE}/">Korean</a> <a href="${SITE}/ar">Arabic</a> <a href="${SITE}${c.base}/course">${c.name} course</a> <a href="${SITE}${c.base}/letters">${c.name} letters</a> <a href="${SITE}${c.base}/review">Review</a> <a href="${SITE}/privacy">Privacy</a> <a href="${SITE}/terms">Terms</a></nav>`;
const native = (c, text) => `<span lang="${c.lang}" dir="${c.dir}">${esc(text)}</span>`;
const dayList = (c) =>
  `<ol>${c.days.map((d) => `<li><a href="${SITE}${c.base}/day/${d.number}">Day ${pad(d.number)}: ${esc(d.title)}</a> (${native(c, d.titleNative)})</li>`).join('')}</ol>`;
const MODES = Object.keys(MODE_TITLES);
const urls = [];
let practiceRoutes = 0;

for (const c of Object.values(COURSES)) {
  const home = c.base || '/';
  const { title, description } = pageMetadata(home, COURSES);
  const html = page(home, `${nav(c)}<main><h1>${esc(title.split(' |')[0])}</h1><p>${esc(description)}</p>${dayList(c)}</main>`);
  if (c.base) write(c.base.slice(1), html);
  else writeFileSync(join(DIST, 'index.html'), html);
  urls.push(home);

  for (const d of c.days) {
    const path = `${c.base}/day/${d.number}`;
    const { description: about } = pageMetadata(path, COURSES);
    const practice = MODES.map((m) => `<a href="${SITE}${path}/practice/${m}">${MODE_TITLES[m]}</a>`).join(' · ');
    write(path.slice(1), page(path,
      `${nav(c)}<main><h1>Day ${pad(d.number)}: ${esc(d.title)} ${native(c, d.titleNative)}</h1><p>${esc(about)}</p><ol>${d.words
        .map((w) => `<li>${native(c, w.term)} (${esc(w.romanization)}): ${esc(w.english)}</li>`)
        .join('')}</ol><p>${practice}</p></main>`));
    urls.push(path);
    for (const m of MODES) write(`${path.slice(1)}/practice/${m}`, page(`${path}/practice/${m}`));
    practiceRoutes += MODES.length;
  }

  write(`${c.base.slice(1) || ''}${c.base ? '/' : ''}course`, page(`${c.base}/course`,
    `${nav(c)}<main><h1>${c.name} course: ${c.days.length} days, ${c.words} words</h1>${dayList(c)}</main>`));
  urls.push(`${c.base}/course`);

  for (const sub of ['review', 'letters']) {
    const path = `${c.base}/${sub}`;
    const meta = pageMetadata(path, COURSES);
    write(path.slice(1), page(path, `${nav(c)}<main><h1>${esc(meta.title.split(' |')[0])}</h1><p>${esc(meta.description)}</p></main>`));
    urls.push(path);
  }
  write(`${c.base ? c.base.slice(1) + '/' : ''}progress`, page(`${c.base}/progress`));
  write(`${c.base ? c.base.slice(1) + '/' : ''}welcome`, page(`${c.base}/welcome`));
}

for (const path of ['install', 'privacy', 'terms']) {
  const { title, description } = pageMetadata('/' + path, COURSES);
  write(path, page('/' + path, `${nav(COURSES.ko)}<main><h1>${esc(title.split(' |')[0])}</h1><p>${esc(description)}</p></main>`));
  urls.push('/' + path);
}
writeFileSync(join(DIST, '404.html'), page('/404'));

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
);

// robots.txt (note: GitHub Pages project sites only serve /korean-vocab-app/robots.txt;
// crawlers read robots.txt at the domain root, so this file matters once a custom domain is used)
const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended'];
writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}\n\nSitemap: ${SITE}/sitemap.xml\n`,
);

// llms.txt
const courseBlock = (c) => {
  const drafts = c.days.filter((d) => d.status === 'draft').length;
  return `## ${c.name} (${c.days.length} days, ${c.words} words)
${drafts ? `${drafts === c.days.length ? 'All' : drafts} ${c.name} lists are drafts awaiting language review.\n` : ''}- [${c.name} course index](${SITE}${c.base}/course)
- [${c.name} letters](${SITE}${c.base}/letters)
${c.days.map((d) => `- [Day ${pad(d.number)}: ${d.title} (${d.titleNative})](${SITE}${c.base}/day/${d.number})`).join('\n')}
`;
};
writeFileSync(
  join(DIST, 'llms.txt'),
  `# ${NAME}

> A free website for learning Korean and Arabic vocabulary in daily sets of 10 words: ${COURSES.ko.words} Korean words and ${COURSES.ar.words} Arabic (Modern Standard) words, 50 days each. Every word has the native script, a romanization, an English meaning and a recorded pronunciation. Learners sign in with a name on their own device, practice with flashcards, multiple choice (both directions), typing, listening and a match game, and missed words come back through spaced review (Leitner boxes: 1, 3, 7 and 16 days). No account or server; progress stays in the browser. The Arabic word selection comes from Collins Arabic: 3000 Words and Phrases.

${courseBlock(COURSES.ko)}
${courseBlock(COURSES.ar)}
## Other pages
- [Privacy](${SITE}/privacy)
- [Terms](${SITE}/terms)
`,
);

console.log(`postbuild: ${urls.length} public routes + ${practiceRoutes} practice routes, sitemap, robots.txt, llms.txt, 404.html`);

// Service worker: installable web app, faster repeat visits, offline use.
// - The app shell (index.html, hashed JS/CSS/fonts, icons) is precached. Every lesson's words are in
//   the JS bundle, so any page can render offline from the shell.
// - Pages: network first, then the cached copy, then the shell.
// - Images, sharing cards and word clips: served from cache, refreshed in the background.
const precache = ['', 'manifest.json', 'favicon-32.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
  'apple-touch-icon.png', ...readdirSync(join(DIST, 'assets')).map((f) => `assets/${f}`)];
const version = createHash('sha256');
for (const f of precache) version.update(f ? readFileSync(join(DIST, f)) : readFileSync(join(DIST, 'index.html')));
writeFileSync(join(DIST, 'sw.js'), `// Generated by scripts/postbuild.js. Do not edit.
const BASE = '${BASE}';
const SHELL = 'ev-shell-${version.digest('hex').slice(0, 12)}';
const PAGES = 'ev-pages';
const MEDIA = 'ev-media';
const PRECACHE = ${JSON.stringify(precache.map((f) => BASE + f))};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ev-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const cacheable = (response) => response && response.ok && (response.type === 'basic' || response.type === 'cors');\n// Asset names carry a content hash, so a Vary header (Origin, Accept-Encoding) must not block a match.\nconst match = (request, options) => caches.match(request, { ignoreVary: true, ...options });

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (cacheable(response)) (await caches.open(PAGES)).put(request, response.clone());
    return response;
  } catch {
    return (await match(request)) || (await match(BASE)) || Response.error();
  }
}

async function cacheFirst(request) {
  return (await match(request)) || fetch(request);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(MEDIA);
  const cached = await cache.match(request, { ignoreVary: true });
  const fresh = fetch(request)
    .then((response) => {
      if (cacheable(response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') return event.respondWith(networkFirst(request));
  if (url.origin === location.origin) {
    if (url.pathname.startsWith(BASE + 'assets/')) return event.respondWith(cacheFirst(request));
    if (/\\/(audio|images|og)\\//.test(url.pathname) || /\\.(png|jpe?g|webp|mp3|woff2)$/.test(url.pathname)) {
      return event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }
  // Web fonts from their CDNs (CORS responses only; opaque ones are not stored).
  if (/(fonts\\.gstatic\\.com|cdn\\.jsdelivr\\.net)$/.test(url.hostname) && request.destination === 'font') {
    event.respondWith(staleWhileRevalidate(request));
  }
});
`);
console.log(`postbuild: service worker precaches ${precache.length} files`);

