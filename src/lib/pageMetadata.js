import { MODE_TITLES } from './stats.js';

export const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';
export const NAME = 'Essential Korean Vocabulary';
const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: SITE + '/', inLanguage: 'en' };

// Used by both the static page builder and React after client-side navigation.
export function pageMetadata(pathname, days, returning = false) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const lowerPath = path.toLowerCase();
  const route = (title, description, extras = {}) => ({
    title, description, url: SITE + lowerPath, image: SITE + '/og/home.jpg', ...extras,
  });
  if (lowerPath === '/' || lowerPath === '/course') {
    const count = days.reduce((n, day) => n + day.words.length, 0);
    if (lowerPath === '/course') return route(`Course: all ${days.length} days | ${NAME}`, `All ${days.length} days of the course, ${count} Korean words in themed sets of ten.`);
    const description = `${count} Korean words in ${days.length} daily sets of 10, with audio, flashcards, multiple choice, typing and listening practice, and spaced review of the words you miss.`;
    return route(returning ? `Today | ${NAME}` : `${NAME}: learn Korean words one day at a time`, description, {
      jsonLd: [website, {
        '@context': 'https://schema.org', '@type': 'Course', name: NAME, description,
        url: SITE + '/', inLanguage: 'en', teaches: 'Korean vocabulary', isAccessibleForFree: true,
        provider: { '@type': 'Organization', name: NAME, url: SITE + '/' },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT10M' },
      }],
    });
  }
  const match = /^\/day\/([^/]+)(?:\/practice\/([^/]+))?$/i.exec(path);
  const day = match && days.find(d => d.number === Number(match[1]));
  if (day && (!match[2] || Object.hasOwn(MODE_TITLES, match[2]))) {
    const number = String(day.number).padStart(2, '0');
    const image = SITE + '/og/day' + number + '.jpg';
    const url = SITE + '/day/' + day.number;
    if (match[2]) return route(`${MODE_TITLES[match[2]]}: Day ${number} ${day.title} | ${NAME}`, `Practice the ${day.title} words.`, { image, noindex: true, url: url + '/practice/' + match[2] });
    const title = `Day ${number}: ${day.title}`;
    const examples = day.words.slice(0, 4).map(w => `${w.korean} (${w.english.split(/[,;]/)[0]})`).join(', ');
    return route(`${title} | ${NAME}`, `Learn ${day.words.length} Korean words about ${day.title.toLowerCase()}: ${examples} and more, with audio and four practice modes.`, {
      url, image, jsonLd: [website, {
        '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: title, url, inLanguage: ['ko', 'en'],
        hasDefinedTerm: day.words.map(w => ({ '@type': 'DefinedTerm', name: w.korean, alternateName: w.romanization, description: w.english, inLanguage: 'ko' })),
      }],
    });
  }
  switch (lowerPath) {
    case '/review': return route(`Review due words | ${NAME}`, 'Spaced review of the Korean words you have practiced, scheduled so each one comes back just before you forget it.');
    case '/privacy': return route(`Privacy | ${NAME}`, `What ${NAME} stores about you: only your practice progress, kept in your own browser.`);
    case '/terms': return route(`Terms of use | ${NAME}`, `Terms for using ${NAME}, a free Korean word practice site.`);
    case '/progress': return route(`Progress | ${NAME}`, 'Your learning progress, stored in this browser.', { noindex: true });
    default: return route(`Page not found | ${NAME}`, 'This page does not exist.', { noindex: true });
  }
}

export function socialTags({ title, description, url, image }) {
  return {
    'og:type': 'website', 'og:site_name': NAME, 'og:title': title, 'og:description': description,
    'og:url': url, 'og:image': image, 'og:image:width': '1200', 'og:image:height': '630',
    'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': image,
  };
}
