import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TLink } from '../components/Motion.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { RevealGroup } from '../components/Reveal.jsx';
import { Mastery } from '../components/Meters.jsx';
import { ArrowLeft, ArrowRight, Check } from '../components/Icons.jsx';
import { getDay, pad, PLANNED_DAYS } from '../data/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { MODE_ORDER, MODE_STEPS, MODE_TITLES, dayStatus, wordLevel } from '../lib/stats.js';
import { gsap, SplitText, useGSAP, reducedMotion } from '../lib/motion.js';
import NotFound from './NotFound.jsx';
import '../styles/day.css';

const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';
const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

const MODE_INFO = {
  flashcards: { body: 'See it, say it, flip it.', keys: 'Space' },
  choice: { body: 'Pick the meaning from four.', keys: '1–4' },
  typing: { body: 'Type the meaning from memory.', keys: 'Enter' },
  listening: { body: 'Hear it, choose the meaning.', keys: 'R replays' },
};

export default function Day() {
  const { n } = useParams();
  const day = getDay(n);
  const progress = useProgress();
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!day || reducedMotion()) return;
      const split = SplitText.create('.day-hero__ko', { type: 'words,chars', wordsClass: 'split-word' });
      gsap
        .timeline({ delay: 0.1 })
        .from(split.chars, { yPercent: 60, opacity: 0, stagger: 0.07, duration: 1.2 })
        .from('.day-hero__meta > *:not(h1)', { y: 18, opacity: 0, stagger: 0.05 }, 0.2)
        .from('.day-hero__en', { y: 18, opacity: 0 }, 0.3)
        .from('.day-hero__cover', { clipPath: 'inset(100% 0% 0% 0% round 24px)', duration: 1.3 }, 0.15)
        .from('.day-hero__cover img', { scale: 1.2, duration: 1.7 }, 0.15)
        .from('.lesson-path', { y: 30, opacity: 0, duration: 1 }, 0.5);
      return () => split.revert();
    },
    { scope: ref, dependencies: [n] },
  );

  if (!day) return <NotFound />;
  const s = dayStatus(progress, day);
  const prev = getDay(day.number - 1);
  const next = getDay(day.number + 1);
  const unit = Math.ceil(day.number / 10);
  const title = `Day ${pad(day.number)}: ${day.title}`;
  const description = `Learn ${day.words.length} Korean words about ${day.title.toLowerCase()}: ${day.words
    .slice(0, 4)
    .map((w) => `${w.korean} (${w.english.split(',')[0]})`)
    .join(', ')} and more, with audio and four practice modes.`;
  const primary = s.nextMode ?? 'choice';
  const primaryLabel = !s.nextMode ? 'Practice again' : s.modes.length ? `Continue: ${MODE_TITLES[primary]}` : 'Start the lesson';

  return (
    <div ref={ref} key={day.id}>
      <title>{`${title} | Essential Korean Vocabulary`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE}/day/${day.number}`} />

      <section className={`day-hero wrap ${day.cover ? '' : 'day-hero--plain'}`}>
        <div className="day-hero__meta">
          <p className="day-hero__crumbs">
            <TLink to="/course">Course</TLink>
            <span aria-hidden="true">/</span>
            <span>Unit {unit}</span>
            <span aria-hidden="true">/</span>
            <span>Day {pad(day.number)} of {PLANNED_DAYS}</span>
            {day.status === 'draft' && <span className="badge">Draft list</span>}
            {day.status === 'reviewed' && <span className="badge">Dictionary-reviewed</span>}
          </p>
          <h1 className="day-hero__title">
            <span className="day-hero__ko ko" lang="ko" data-long={day.titleKo.replace(/ /g, '').length > 4}>{day.titleKo}</span>
            <span className="day-hero__en">{day.title}</span>
          </h1>
          <dl className="day-hero__stats">
            <div><dt>Words</dt><dd className="num">{day.words.length}</dd></div>
            <div><dt>Learned</dt><dd className="num">{s.learned}<span>/{day.words.length}</span></dd></div>
            <div><dt>Mastered</dt><dd className="num">{s.mastered}</dd></div>
            <div><dt>Best</dt><dd className="num">{s.best != null ? `${s.best}%` : '–'}</dd></div>
          </dl>
        </div>
        {day.cover && (
          <figure className="day-hero__cover">
            <img src={asset(day.cover)} alt="" width="1600" height="1000" fetchPriority="high" />
          </figure>
        )}

        <nav className="lesson-path card" aria-label="Lesson steps">
          <ol>
            {MODE_ORDER.map((m, k) => {
              const done = s.modes.includes(m);
              const current = m === s.nextMode;
              return (
                <li key={m}>
                  <TLink className="lp-step" data-done={done} data-current={current} to={`/day/${day.number}/practice/${m}`} ko={day.titleKo} en={MODE_TITLES[m]}>
                    <span className="lp-step__dot">{done ? <Check width={14} height={14} /> : k + 1}</span>
                    <span className="lp-step__text">
                      <b>{MODE_STEPS[m]}</b>
                      <span>{MODE_TITLES[m]} · {MODE_INFO[m].body}</span>
                    </span>
                  </TLink>
                </li>
              );
            })}
          </ol>
          <TLink className="btn btn--lg btn--accent lesson-path__cta" to={`/day/${day.number}/practice/${primary}`} ko={day.titleKo} en={MODE_TITLES[primary]}>
            {primaryLabel} <ArrowRight />
          </TLink>
        </nav>
      </section>

      <section className="words wrap" aria-labelledby="words-title">
        <div className="section-head">
          <div>
            <p className="eyebrow">Vocabulary · 단어</p>
            <h2 className="h2" id="words-title">The {day.words.length} words</h2>
          </div>
          <p className="lede">Tap the speaker, then say each word after the voice. The bars show how well you know it.</p>
        </div>
        {day.status === 'draft' && (
          <p className="draft-note">This is a new list that hasn’t been checked against class notes yet. If a word looks wrong, please report it.</p>
        )}
        <RevealGroup as="ol" className="words__list" stagger={0.04}>
          {day.words.map((w, k) => (
            <li className="word-row" key={w.id}>
              <span className="word-row__i num">{pad(k + 1)}</span>
              <span className="word-row__ko ko" lang="ko">{w.korean}</span>
              <span className="word-row__rom">{w.romanization}</span>
              <span className="word-row__en">{w.english}</span>
              <Mastery level={wordLevel(progress, w)} />
              <SpeakButton text={w.korean} />
            </li>
          ))}
        </RevealGroup>
      </section>

      <nav className="day-pager wrap" aria-label="Other days">
        {prev ? (
          <TLink className="day-pager__link" to={`/day/${prev.number}`} ko={prev.titleKo} en={`Day ${pad(prev.number)}`}>
            <ArrowLeft />
            <span><small>Previous · Day {pad(prev.number)}</small><span className="ko">{prev.titleKo}</span></span>
          </TLink>
        ) : <span />}
        {next ? (
          <TLink className="day-pager__link day-pager__link--next" to={`/day/${next.number}`} ko={next.titleKo} en={`Day ${pad(next.number)}`}>
            <span><small>Next · Day {pad(next.number)}</small><span className="ko">{next.titleKo}</span></span>
            <ArrowRight />
          </TLink>
        ) : (
          <TLink className="day-pager__link day-pager__link--next" to="/review" ko="복습" en="Review">
            <span><small>Last day</small>Review your due words</span>
            <ArrowRight />
          </TLink>
        )}
      </nav>
    </div>
  );
}
