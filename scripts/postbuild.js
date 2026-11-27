// Runs after `vite build`. For every public route it writes dist/<route>.html
// with its own title, description, canonical URL, Open Graph/Twitter tags, JSON-LD,
// and a plain-HTML version of the content inside #root, so crawlers and link
// previews get real content and a 200 status. React replaces that markup on load.
// Also writes 404.html, sitemap.xml, robots.txt and llms.txt.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';
const NAME = 'Essential Korean Vocabulary';
const DIST = 'dist';
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const days = readdirSync('src/data/days')
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join('src/data/days', f), 'utf8')))
  .sort((a, b) => a.number - b.number);
const wordCount = days.reduce((n, d) => n + d.words.length, 0);
const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

function page({ path, title, description, image = 'og/home.jpg', jsonLd, body, noindex = false }) {
  const url = `${SITE}${path}`;
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${SITE}/${image}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '',
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

const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: `${SITE}/`, inLanguage: 'en' };
const nav = `<nav><a href="${SITE}/">Home</a> <a href="${SITE}/review">Review</a> <a href="${SITE}/privacy">Privacy</a> <a href="${SITE}/terms">Terms</a></nav>`;

// Home
const homeDesc = `${wordCount} Korean words in ${days.length} daily sets of 10, with audio, flashcards, multiple choice, typing and listening practice, and spaced review of the words you miss.`;
writeFileSync(
  join(DIST, 'index.html'),
  page({
    path: '/',
    title: `${NAME}: learn Korean words one day at a time`,
    description: homeDesc,
    jsonLd: [
      website,
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: NAME,
        description: homeDesc,
        url: `${SITE}/`,
        inLanguage: 'en',
        teaches: 'Korean vocabulary',
        isAccessibleForFree: true,
        provider: { '@type': 'Organization', name: NAME, url: `${SITE}/` },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT10M' },
      },
    ],
    body: `${nav}<main><h1>Learn Korean one day at a time</h1><p>${esc(homeDesc)}</p><ol>${days
      .map((d) => `<li><a href="${SITE}/day/${d.number}">Day ${pad(d.number)}: ${esc(d.title)} (${esc(d.titleKo)})</a></li>`)
      .join('')}</ol></main>`,
  }),
);

// Days
for (const d of days) {
  const title = `Day ${pad(d.number)}: ${d.title} | ${NAME}`;
  const description = `Learn ${d.words.length} Korean words about ${d.title.toLowerCase()}: ${d.words
    .slice(0, 4)
    .map((w) => `${w.korean} (${w.english.split(/[,;]/)[0]})`)
    .join(', ')} and more, with audio and four practice modes.`;
  write(
    `day/${d.number}`,
    page({
      path: `/day/${d.number}`,
      title,
      description,
      image: `og/day${pad(d.number)}.jpg`,
      jsonLd: [
        website,
        {
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: `Day ${pad(d.number)}: ${d.title}`,
          url: `${SITE}/day/${d.number}`,
          inLanguage: ['ko', 'en'],
          hasDefinedTerm: d.words.map((w) => ({ '@type': 'DefinedTerm', name: w.korean, alternateName: w.romanization, description: w.english, inLanguage: 'ko' })),
        },
      ],
      body: `${nav}<main><h1>Day ${pad(d.number)}: ${esc(d.title)} <span lang="ko">${esc(d.titleKo)}</span></h1><p>${esc(description)}</p><ol>${d.words
        .map((w) => `<li><span lang="ko">${esc(w.korean)}</span> (${esc(w.romanization)}): ${esc(w.english)}</li>`)
        .join('')}</ol><p><a href="${SITE}/day/${d.number}/practice/flashcards">Start flashcards</a> · <a href="${SITE}/day/${d.number}/practice/choice">Start quiz</a></p></main>`,
    }),
  );
}

// Other pages
const simple = [
  ['review', `Review due words | ${NAME}`, 'Spaced review of the Korean words you have practiced, scheduled so each one comes back just before you forget it.'],
  ['privacy', `Privacy | ${NAME}`, `What ${NAME} stores about you: only your practice progress, kept in your own browser.`],
  ['terms', `Terms of use | ${NAME}`, `Terms for using ${NAME}, a free Korean word practice site.`],
];
for (const [path, title, description] of simple) {
  write(path, page({ path: `/${path}`, title, description, body: `${nav}<main><h1>${esc(title.split(' |')[0])}</h1><p>${esc(description)}</p></main>` }));
}

// Practice sessions: app shell only, not indexed.
for (const d of days) {
  for (const mode of ['flashcards', 'choice', 'typing', 'listening']) {
    write(
      `day/${d.number}/practice/${mode}`,
      page({ path: `/day/${d.number}/practice/${mode}`, title: `Practice Day ${pad(d.number)}: ${d.title} | ${NAME}`, description: `Practice the ${d.title} words.`, image: `og/day${pad(d.number)}.jpg`, noindex: true }),
    );
  }
}

// Unknown paths: GitHub Pages serves 404.html (status 404), which boots the app's own 404 page.
writeFileSync(
  join(DIST, '404.html'),
  page({ path: '/404', title: `Page not found | ${NAME}`, description: 'This page does not exist.', noindex: true }),
);

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', ...days.map((d) => `/day/${d.number}`), '/review', '/privacy', '/terms'];
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
writeFileSync(
  join(DIST, 'llms.txt'),
  `# ${NAME}

> A free website for learning Korean vocabulary in daily sets of 10 words. ${days.length} days, ${wordCount} words. Each word has Hangul, romanization, an English meaning and audio from the device's Korean voice. Learners practice with flashcards, multiple choice (both directions), typing and listening, and missed words come back through spaced review (Leitner boxes: 1, 3, 7 and 16 days). No account is needed; progress stays in the browser.

Days ${days.filter((d) => d.status === 'draft').map((d) => d.number).join(', ') || 'none'} are draft lists that are still being checked.

## Days
${days.map((d) => `- [Day ${pad(d.number)}: ${d.title} (${d.titleKo})](${SITE}/day/${d.number})`).join('\n')}

## Other pages
- [Review due words](${SITE}/review)
- [Privacy](${SITE}/privacy)
- [Terms](${SITE}/terms)
`,
);

console.log(`postbuild: ${urls.length} public routes + ${days.length * 4} practice routes, sitemap, robots.txt, llms.txt, 404.html`);
