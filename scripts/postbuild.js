// Runs after `vite build`. For every public route it writes dist/<route>.html
// with its own title, description, canonical URL, Open Graph/Twitter tags, JSON-LD,
// and a plain-HTML version of the content inside #root, so crawlers and link
// previews get real content and a 200 status. React replaces that markup on load.
// Also writes 404.html, sitemap.xml, robots.txt and llms.txt.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { SITE, NAME, pageMetadata, socialTags } from '../src/lib/pageMetadata.js';

const DIST = 'dist';
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const days = readdirSync('src/data/days')
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join('src/data/days', f), 'utf8')))
  .sort((a, b) => a.number - b.number);
const wordCount = days.reduce((n, d) => n + d.words.length, 0);
const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

const BASE = '/korean-vocab-app/';

// A day's cover is its largest element, but React only adds it after the scripts run.
// Preloading it from the static HTML lets the browser fetch it right away.
function coverPreload(path) {
  const day = days.find((d) => path === `/day/${d.number}`);
  return day?.cover ? `<link rel="preload" as="image" href="${BASE}${esc(day.cover)}" fetchpriority="high" />` : '';
}

function page(path, body = '') {
  const info = pageMetadata(path, days);
  const head = [
    coverPreload(path),
    `<title>${esc(info.title)}</title>`,
    `<meta name="description" content="${esc(info.description)}" />`,
    info.noindex ? '<meta data-route-head name="robots" content="noindex" />' : `<link data-route-head rel="canonical" href="${esc(info.url)}" />`,
    ...Object.entries(socialTags(info)).map(([key, value]) =>
      `<meta data-route-head ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${esc(value)}" />`),
    info.jsonLd ? `<script data-route-head type="application/ld+json">${JSON.stringify(info.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].join('\n    ');
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

const nav = `<nav><a href="${SITE}/">Home</a> <a href="${SITE}/course">Course</a> <a href="${SITE}/review">Review</a> <a href="${SITE}/privacy">Privacy</a> <a href="${SITE}/terms">Terms</a></nav>`;

// Home
const homeDesc = pageMetadata('/', days).description;
writeFileSync(
  join(DIST, 'index.html'),
  page('/',
    `${nav}<main><h1>Learn Korean one day at a time</h1><p>${esc(homeDesc)}</p><ol>${days
      .map((d) => `<li><a href="${SITE}/day/${d.number}">Day ${pad(d.number)}: ${esc(d.title)} (${esc(d.titleKo)})</a></li>`)
      .join('')}</ol></main>`,
  ),
);

// Days
for (const d of days) {
  const path = `/day/${d.number}`;
  const { description } = pageMetadata(path, days);
  write(
    path.slice(1),
    page(path,
      `${nav}<main><h1>Day ${pad(d.number)}: ${esc(d.title)} <span lang="ko">${esc(d.titleKo)}</span></h1>${d.status === 'reviewed' ? '<p>Dictionary-reviewed</p>' : ''}<p>${esc(description)}</p><ol>${d.words
        .map((w) => `<li><span lang="ko">${esc(w.korean)}</span> (${esc(w.romanization)}): ${esc(w.english)}</li>`)
        .join('')}</ol><p><a href="${SITE}/day/${d.number}/practice/flashcards">Start flashcards</a> · <a href="${SITE}/day/${d.number}/practice/choice">Start quiz</a></p></main>`,
    ),
  );
}

// Course index
write(
  'course',
  page('/course',
    `${nav}<main><h1>Course: ${days.length} days, ${wordCount} words</h1><ol>${days
      .map((d) => `<li><a href="${SITE}/day/${d.number}">Day ${pad(d.number)}: ${esc(d.title)} (${esc(d.titleKo)})</a></li>`)
      .join('')}</ol></main>`,
  ),
);

// Other pages
for (const path of ['review', 'privacy', 'terms']) {
  const { title, description } = pageMetadata('/' + path, days);
  write(path, page('/' + path, `${nav}<main><h1>${esc(title.split(' |')[0])}</h1><p>${esc(description)}</p></main>`));
}
write('progress', page('/progress'));

// Practice sessions: app shell only, not indexed.
for (const d of days) {
  for (const mode of ['flashcards', 'choice', 'typing', 'listening']) {
    const path = `day/${d.number}/practice/${mode}`;
    write(path, page('/' + path));
  }
}
writeFileSync(join(DIST, '404.html'), page('/404'));

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/course', ...days.map((d) => `/day/${d.number}`), '/review', '/privacy', '/terms'];
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
const draftDays = days.filter((day) => day.status === 'draft').map((day) => day.number);
writeFileSync(
  join(DIST, 'llms.txt'),
  `# ${NAME}

> A free website for learning Korean vocabulary in daily sets of 10 words. ${days.length} days, ${wordCount} words. Each word has Hangul, romanization, an English meaning and a recorded pronunciation. Learners practice with flashcards, multiple choice (both directions), typing and listening, and missed words come back through spaced review (Leitner boxes: 1, 3, 7 and 16 days). No account is needed; progress stays in the browser.

${draftDays.length ? `Days ${draftDays.join(', ')} are draft lists under review.\n\n` : ''}## Days
${days.map((d) => `- [Day ${pad(d.number)}: ${d.title} (${d.titleKo})](${SITE}/day/${d.number})`).join('\n')}

## Other pages
- [Course index](${SITE}/course)
- [Review due words](${SITE}/review)
- [Privacy](${SITE}/privacy)
- [Terms](${SITE}/terms)
`,
);

console.log(`postbuild: ${urls.length} public routes + ${days.length * 4} practice routes, sitemap, robots.txt, llms.txt, 404.html`);
