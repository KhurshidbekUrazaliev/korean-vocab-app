import koreanLetters from './ko/letters.json';
import arabicLetters from './ar/letters.json';
// Course registry. Korean keeps the original URLs; Arabic lives under /ar.
// Word and day ids are prefixed per course, so both share one progress store.
const korean = import.meta.glob('./ko/day*.json', { eager: true, import: 'default' });
const arabic = import.meta.glob('./ar/day*.json', { eager: true, import: 'default' });

export const PLANNED_DAYS = 50;
export const pad = (n) => String(n).padStart(2, '0');

const ARABIC_MARKS = /[\u064B-\u0652\u0670]/g;
/** First letter of a term for monograms: Arabic loses its vowel marks and the article. */
export const initialOf = (term) => term.replace(ARABIC_MARKS, '').replace(/^ال(?=.)/, '').trim()[0] ?? '';

function course(meta, modules, letters) {
  const days = Object.values(modules).sort((a, b) => a.number - b.number);
  const allWords = days.flatMap((day) => day.words.map((w) => ({ ...w, dayId: day.id, dayNumber: day.number })));
  const byNumber = new Map(days.map((d) => [d.number, d]));
  return {
    ...meta,
    days,
    allWords,
    letters: letters.groups,
    getDay: (number) => byNumber.get(Number(number)),
    /** App path inside this course, e.g. path('/day/7') -> '/ar/day/7'. */
    path: (to = '/') => (meta.base ? (to === '/' ? meta.base : meta.base + to) : to),
  };
}

export const COURSES = {
  ko: course(
    {
      id: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      lang: 'ko',
      dir: 'ltr',
      base: '',
      romanizationLabel: 'Romanization',
      motto: '하루에 열 단어.',
      reviewNative: '복습',
      vocabularyNative: '단어',
      courseNative: '과정',
      speechLang: 'ko-KR',
      scene: {
        src: 'images/hero.webp',
        alt: 'Illustration of a quiet Seoul side street with a corner shop, a bicycle and N Seoul Tower in the distance',
        places: 'a dinner table, a subway car, a market stall',
      },
    },
    korean,
    koreanLetters,
  ),
  ar: course(
    {
      id: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      lang: 'ar',
      dir: 'rtl',
      base: '/ar',
      romanizationLabel: 'Transliteration',
      motto: 'عَشْرُ كَلِمَاتٍ فِي الْيَوْم.',
      reviewNative: 'مُرَاجَعَة',
      vocabularyNative: 'كَلِمَات',
      courseNative: 'الدُّرُوس',
      speechLang: 'ar-SA',
      scene: {
        src: 'images/ar/hero.webp',
        alt: 'Illustration of a quiet old-city lane with a carved wooden door, a screened balcony, a bicycle and a minaret in the distance',
        places: 'a family table, a market stall, a train platform',
      },
    },
    arabic,
    arabicLetters,
  ),
};

export const COURSE_LIST = [COURSES.ko, COURSES.ar];
export const ALL_WORDS = COURSE_LIST.flatMap((c) => c.allWords);

export function courseFromPath(pathname = '/') {
  return pathname === '/ar' || pathname.startsWith('/ar/') ? COURSES.ar : COURSES.ko;
}

/** The same page in another course: /day/7 <-> /ar/day/7. Practice and day numbers carry over. */
export function switchPath(pathname, to) {
  if (pathname === '/privacy' || pathname === '/terms') return to.path('/');
  const from = courseFromPath(pathname);
  const rest = from.base ? pathname.slice(from.base.length) || '/' : pathname;
  return to.path(rest);
}

// Every word has a recorded clip at public/audio/<word id>.mp3 (scripts/make-audio.py).
const byTerm = new Map(ALL_WORDS.map((w) => [w.term, w.id]));
export const clipFor = (term) => {
  const id = byTerm.get(term);
  return id ? clipUrl(id) : null;
};
/** Clip for a known id, such as a letter (letters can share a sound, so they go by id). */
export const clipUrl = (id) => `${import.meta.env.BASE_URL}audio/${id}.mp3`;
