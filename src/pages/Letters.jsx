import { useRef } from 'react';
import { TLink } from '../components/Motion.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { clipUrl } from '../data/index.js';
import { useCourse } from '../hooks/useCourse.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/app.css';

const INTRO = {
  ko: {
    title: 'Hangul in one page.',
    lede: 'Hangul has 14 basic consonants and 10 basic vowels. Letters stack into one block per syllable: a consonant, a vowel, and sometimes a final consonant. Tap a letter to hear it in a syllable.',
  },
  ar: {
    title: 'The Arabic alphabet.',
    lede: 'Arabic is written from right to left with 28 letters. Most letters join the next one and change shape with their position. Short vowels are small marks above or below a letter. Tap a letter to hear its name.',
  },
};

// Syllable blocks: how Hangul letters stack.
const BLOCKS = [
  { block: '한', parts: ['ㅎ', 'ㅏ', 'ㄴ'], rom: 'han' },
  { block: '국', parts: ['ㄱ', 'ㅜ', 'ㄱ'], rom: 'guk' },
  { block: '어', parts: ['ㅇ', 'ㅓ'], rom: 'eo' },
];

export default function Letters() {
  const ref = useRef(null);
  const course = useCourse();
  const { lang, dir } = course;
  const intro = INTRO[course.id];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray('.letters__grid').forEach((grid) =>
        gsap.from(grid.children, { y: 16, opacity: 0, stagger: 0.02, duration: 0.6, scrollTrigger: { trigger: grid, start: 'top 85%', once: true } }),
      );
    },
    { scope: ref, dependencies: [course.id] },
  );

  return (
    <div className="wrap letters" ref={ref}>
      <header className="page-head">
        <div>
          <p className="eyebrow">{course.name} letters</p>
          <h1 className="display">{intro.title}</h1>
          <p className="lede" style={{ marginTop: 16 }}>{intro.lede}</p>
        </div>
      </header>

      {course.letters.map((group) => (
        <section className="letters__group" key={group.id} aria-labelledby={`letters-${group.id}`}>
          <h2 className="h3" id={`letters-${group.id}`}>{group.title}</h2>
          <ul className={`letters__grid letters__grid--${group.id}`}>
            {group.items.map((item) => (
              <li className="letter card" key={item.id}>
                <span className="letter__glyph ko" lang={lang} dir={dir}>{item.glyph}</span>
                <span className="letter__name">
                  <b>{item.romanization}</b>
                  {item.sound && <span className="muted">{item.sound}</span>}
                  {lang === 'ko' && (
                    <span className="muted">
                      {item.name} · <span lang="ko">{item.term}</span>
                    </span>
                  )}
                  {lang === 'ar' && group.id === 'letters' && (
                    <span className="letter__arname" lang="ar" dir="rtl">{item.name}</span>
                  )}
                  {lang === 'ar' && group.id === 'marks' && <span className="muted">{item.name}</span>}
                </span>
                {item.forms && (
                  <span className="letter__forms" lang="ar" dir="rtl" aria-label={`Forms: start ${item.forms.initial}, middle ${item.forms.medial}, end ${item.forms.final}`}>
                    <span title="Start of a word">{item.forms.initial}</span>
                    <span title="Middle of a word">{item.forms.medial}</span>
                    <span title="End of a word">{item.forms.final}</span>
                  </span>
                )}
                <SpeakButton
                  text={item.term}
                  src={clipUrl(item.id)}
                  label={`Play ${item.romanization}`}
                  className="icon-btn letter__play"
                  size={16}
                />
              </li>
            ))}
          </ul>
          {lang === 'ar' && group.id === 'letters' && (
            <p className="muted letters__note">
              Forms are shown as start, middle and end of a word (right to left). Six letters (<span lang="ar" dir="rtl">ا د ذ ر ز و</span>) never join the letter after them.
            </p>
          )}
        </section>
      ))}

      {lang === 'ko' && (
        <section className="letters__group" aria-labelledby="letters-blocks">
          <h2 className="h3" id="letters-blocks">Syllable blocks</h2>
          <ul className="blocks">
            {BLOCKS.map((b) => (
              <li className="card blocks__item" key={b.block}>
                <span className="blocks__block ko" lang="ko">{b.block}</span>
                <span className="blocks__eq" aria-hidden="true">=</span>
                <span className="blocks__parts ko" lang="ko">{b.parts.join(' + ')}</span>
                <span className="muted">{b.rom}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="letters__next">
        <TLink className="btn btn--lg btn--accent" to={course.path('/day/1')} native={course.days[0].titleNative} en="Day 01">
          Start Day 01 <ArrowRight />
        </TLink>
      </div>
    </div>
  );
}
