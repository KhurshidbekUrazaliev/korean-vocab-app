import { MODE_TITLES } from './stats.js';

export const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';
export const NAME = 'Essential Vocabulary';
const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: SITE + '/', inLanguage: 'en' };
const COURSE_NAMES = { ko: 'Korean', ar: 'Arabic' };
const pad = (n) => String(n).padStart(2, '0');

const words = (days) => days.reduce((n, day) => n + day.words.length, 0);

function courseLd(id, days, url) {
  const name = COURSE_NAMES[id];
  return {
    '@context': 'https://schema.org', '@type': 'Course', name: `${name} vocabulary: ten words a day`,
    description: `${words(days)} ${name} words in ${days.length} daily sets of 10, with audio, four practice modes and spaced review.`,
    url, inLanguage: 'en', teaches: `${name} vocabulary`, isAccessibleForFree: true,
    provider: { '@type': 'Organization', name: NAME, url: SITE + '/' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT10M' },
  };
}

/**
 * Title, description, canonical URL, preview image and structured data for a route.
 * `courses` is `{ ko: { days }, ar: { days } }`, so the static page builder can pass plain JSON.
 * Used by both the static page builder and React after client-side navigation.
 */
export function pageMetadata(pathname, courses, returning = false) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const lowerPath = path.toLowerCase();
  const id = lowerPath === '/ar' || lowerPath.startsWith('/ar/') ? 'ar' : 'ko';
  const base = id === 'ar' ? '/ar' : '';
  const rest = lowerPath.slice(base.length) || '/';
  const { days } = courses[id];
  const name = COURSE_NAMES[id];
  const route = (title, description, extras = {}) => ({
    title, description, url: SITE + lowerPath, image: SITE + '/og' + base + '/home.jpg', ...extras,
  });

  if (rest === '/') {
    if (returning) return route(`Today · ${name} | ${NAME}`, `Your ${name} lesson, review and streak for today.`, { url: SITE + (base || '/') });
    if (id === 'ar') {
      return route(`Learn Arabic words, ten a day | ${NAME}`, `${words(days)} Arabic words in ${days.length} daily sets of 10, with audio, flashcards, multiple choice, typing and listening practice, and spaced review of the words you miss.`, {
        jsonLd: [website, courseLd('ar', days, SITE + '/ar')],
      });
    }
    const both = words(courses.ko.days) + words(courses.ar.days);
    return route(`${NAME}: learn Korean and Arabic words, ten a day`, `${both} Korean and Arabic words in daily sets of 10, with audio, flashcards, multiple choice, typing and listening practice, and spaced review of the words you miss.`, {
      url: SITE + '/',
      jsonLd: [website, courseLd('ko', courses.ko.days, SITE + '/'), courseLd('ar', courses.ar.days, SITE + '/ar')],
    });
  }
  if (rest === '/course') return route(`${name} course: all ${days.length} days | ${NAME}`, `All ${days.length} days of the ${name} course, ${words(days)} words in themed sets of ten.`);

  const match = /^\/day\/([^/]+)(?:\/practice\/([^/]+))?$/.exec(rest);
  const day = match && days.find((d) => d.number === Number(match[1]));
  if (day && (!match[2] || Object.hasOwn(MODE_TITLES, match[2]))) {
    const number = pad(day.number);
    // Arabic sharing cards arrive with task B3; until then Arabic days use the site card.
    const image = `${SITE}/og${base}/day${number}.jpg`;
    const url = `${SITE}${base}/day/${day.number}`;
    if (match[2]) return route(`${MODE_TITLES[match[2]]}: Day ${number} ${day.title} · ${name} | ${NAME}`, `Practice the ${name} ${day.title} words.`, { image, noindex: true, url: `${url}/practice/${match[2]}` });
    const title = `Day ${number}: ${day.title} · ${name}`;
    const examples = day.words.slice(0, 4).map((w) => `${w.term} (${w.english.split(/[,;]/)[0]})`).join(', ');
    return route(`${title} | ${NAME}`, `Learn ${day.words.length} ${name} words about ${day.title.toLowerCase()}: ${examples} and more, with audio and four practice modes.`, {
      url, image, jsonLd: [website, {
        '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: title, url, inLanguage: [id, 'en'],
        hasDefinedTerm: day.words.map((w) => ({ '@type': 'DefinedTerm', name: w.term, alternateName: w.romanization, description: w.english, inLanguage: id })),
      }],
    });
  }
  switch (rest) {
    case '/review': return route(`${name} review | ${NAME}`, `Spaced review of the ${name} words you have practiced, scheduled so each one comes back just before you forget it.`);
    case '/letters': return route(id === 'ar' ? `The Arabic alphabet | ${NAME}` : `Hangul letters | ${NAME}`, id === 'ar'
      ? 'All 28 Arabic letters with their sounds, the forms they take inside a word, and the short vowel marks, with audio.'
      : 'The 24 basic Hangul letters with their sounds and how they stack into syllable blocks, with audio.');
    case '/progress': return route(`${name} progress | ${NAME}`, 'Your learning progress, stored in this browser.', { noindex: true });
    case '/welcome': return route(`Sign in | ${NAME}`, 'Choose a name, a language and a daily goal. Your profile stays on this device.', { noindex: true });
  }
  if (id === 'ko' && rest === '/install') {
    return route(`Install the app | ${NAME}`, `Install ${NAME} on your phone, tablet or computer. It opens in its own window and works offline for the pages you have opened.`);
  }
  if (id === 'ko') {
    switch (rest) {
      case '/privacy': return route(`Privacy | ${NAME}`, `What ${NAME} stores about you: only your profile and practice progress, kept in your own browser.`);
      case '/terms': return route(`Terms of use | ${NAME}`, `Terms for using ${NAME}, a free Korean and Arabic word practice site.`);
    }
  }
  return route(`Page not found | ${NAME}`, 'This page does not exist.', { noindex: true });
}

export function socialTags({ title, description, url, image }) {
  return {
    'og:type': 'website', 'og:site_name': NAME, 'og:title': title, 'og:description': description,
    'og:url': url, 'og:image': image, 'og:image:width': '1200', 'og:image:height': '630',
    'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': image,
  };
}
