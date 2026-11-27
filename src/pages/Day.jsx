import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TLink } from '../components/Motion.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { RevealGroup } from '../components/Reveal.jsx';
import { ArrowLeft, ArrowRight } from '../components/Icons.jsx';
import { getDay, pad, PLANNED_DAYS } from '../data/index.js';
import { useProgress, learnedCount } from '../hooks/useProgress.js';
import { gsap, SplitText, useGSAP, reducedMotion } from '../lib/motion.js';
import NotFound from './NotFound.jsx';
import '../styles/day.css';

const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';

export const PRACTICE_MODES = [
  { key: 'flashcards', title: 'Flashcards', body: 'Flip each card, then mark it known or not yet.', keys: 'Space to flip' },
  { key: 'choice', title: 'Multiple choice', body: 'Pick the meaning out of four options.', keys: '1–4 to answer' },
  { key: 'typing', title: 'Typing', body: 'Type the English meaning from memory.', keys: 'Enter to check' },
  { key: 'listening', title: 'Listening', body: 'Hear the word, choose what it means.', keys: 'R to replay' },
];

export default function Day() {
  const { n } = useParams();
  const day = getDay(n);
  const progress = useProgress();
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!day || reducedMotion()) return;
      const split = SplitText.create('.day-hero__num', { type: 'chars' });
      gsap
        .timeline({ delay: 0.15 })
        .from(split.chars, { yPercent: 100, opacity: 0, stagger: 0.08, duration: 1.4 })
        .from('.day-hero__meta > *', { y: 24, opacity: 0, stagger: 0.06 }, 0.3)
        .from('.day-hero__cover', { clipPath: 'inset(100% 0% 0% 0% round 28px)', duration: 1.4 }, 0.2)
        .from('.day-hero__cover img', { scale: 1.25, duration: 1.8 }, 0.2)
        .from('.day-hero__chip', { y: 20, opacity: 0, duration: 0.8 }, 1);
      gsap.to('.day-hero__cover img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.day-hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.day-hero__num', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.day-hero', start: 'top top', end: 'bottom top', scrub: true } });
      return () => split.revert();
    },
    { scope: ref, dependencies: [n] },
  );

  if (!day) return <NotFound />;
  const learned = learnedCount(progress, day);
  const best = progress.days[day.id]?.best;
  const prev = getDay(day.number - 1);
  const next = getDay(day.number + 1);
  const title = `Day ${pad(day.number)}: ${day.title}`;
  const description = `Learn ${day.words.length} Korean words about ${day.title.toLowerCase()}: ${day.words
    .slice(0, 4)
    .map((w) => `${w.korean} (${w.english.split(',')[0]})`)
    .join(', ')} and more, with audio and four practice modes.`;

  return (
    <div ref={ref} key={day.id}>
      <title>{`${title} | Essential Korean Vocabulary`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE}/day/${day.number}`} />

      <section className={`day-hero wrap ${day.cover ? 'day-hero--cover' : ''}`}>
        <p className="day-hero__num" aria-hidden="true">{pad(day.number)}</p>
        <div className="day-hero__meta">
          <p className="eyebrow">Day {pad(day.number)} of {PLANNED_DAYS}{day.status === 'draft' && ' · Draft list'}</p>
          <h1 className="display">
            {day.title} <span className="ko day-hero__ko">{day.titleKo}</span>
          </h1>
          <dl className="day-hero__stats">
            <div><dt>Words</dt><dd>{day.words.length}</dd></div>
            <div><dt>Learned</dt><dd>{learned}/{day.words.length}</dd></div>
            <div><dt>Best score</dt><dd>{best != null ? `${best}%` : '–'}</dd></div>
          </dl>
          <div className="day-hero__ctas">
            <TLink className="btn" to={`/day/${day.number}/practice/flashcards`} ko={day.titleKo} en="Flashcards">
              Start flashcards<span className="btn__icon"><ArrowRight /></span>
            </TLink>
            <TLink className="btn btn--ghost" to={`/day/${day.number}/practice/choice`} ko={day.titleKo} en="Multiple choice">
              Start quiz
            </TLink>
            <a className="btn btn--ghost" href="#modes">Other modes</a>
          </div>
        </div>
        {day.cover && (
          <figure className="day-hero__cover">
            <img src={`${import.meta.env.BASE_URL}${day.cover}`} alt="" width="1600" height="1000" fetchPriority="high" />
            <figcaption className="day-hero__chip chip">
              <SpeakButton text={day.words[0].korean} size={16} />
              <span>Start with <b className="ko" lang="ko">{day.words[0].korean}</b> · {day.words[0].english.split(',')[0]}</span>
            </figcaption>
          </figure>
        )}
      </section>

      <section className="words wrap" aria-labelledby="words-title">
        <div className="section-head">
          <h2 className="h2" id="words-title">The {day.words.length} words</h2>
          <p className="lede">Press the speaker to hear each word. Read it out loud after the voice.</p>
        </div>
        {day.status === 'draft' && (
          <p className="draft-note">This is a new list that hasn’t been checked against class notes yet. If a word looks wrong, please report it.</p>
        )}
        <RevealGroup as="ol" className="words__list" stagger={0.05}>
          {day.words.map((w, k) => (
            <li className="word-row" key={w.id}>
              <span className="word-row__i">{pad(k + 1)}</span>
              <span className="word-row__ko ko" lang="ko">{w.korean}</span>
              <span className="word-row__rom">{w.romanization}</span>
              <span className="word-row__en">{w.english}</span>
              <SpeakButton text={w.korean} />
            </li>
          ))}
        </RevealGroup>
      </section>

      <section className="modes-pick wrap" id="modes" aria-labelledby="modes-pick-title">
        <div className="section-head">
          <h2 className="h2" id="modes-pick-title">Pick a way to practice</h2>
          <p className="lede">Every answer feeds your review queue, so any mode counts.</p>
        </div>
        <RevealGroup as="ul" className="modes-pick__grid">
          {PRACTICE_MODES.map((m, k) => {
            const done = progress.days[day.id]?.modes.includes(m.key);
            return (
              <li key={m.key}>
                <TLink className="mode-tile" to={`/day/${day.number}/practice/${m.key}`} ko={day.titleKo} en={m.title}>
                  <span className="mode-tile__num">{pad(k + 1)}</span>
                  <span className="mode-tile__title">{m.title}</span>
                  <span className="mode-tile__body">{m.body}</span>
                  <span className="mode-tile__foot">
                    <span>{done ? 'Done once' : m.keys}</span>
                    <span className="day-card__go"><ArrowRight /></span>
                  </span>
                </TLink>
              </li>
            );
          })}
        </RevealGroup>
      </section>

      <nav className="day-pager wrap" aria-label="Other days">
        {prev ? (
          <TLink className="day-pager__link" to={`/day/${prev.number}`} ko={prev.titleKo} en={`Day ${pad(prev.number)}`}>
            <ArrowLeft /><span><small>Previous</small>Day {pad(prev.number)} · {prev.title}</span>
          </TLink>
        ) : <span />}
        {next ? (
          <TLink className="day-pager__link day-pager__link--next" to={`/day/${next.number}`} ko={next.titleKo} en={`Day ${pad(next.number)}`}>
            <span><small>Next</small>Day {pad(next.number)} · {next.title}</span><ArrowRight />
          </TLink>
        ) : (
          <TLink className="day-pager__link day-pager__link--next" to="/review" ko="복습" en="Review">
            <span><small>Last day</small>Review your due words</span><ArrowRight />
          </TLink>
        )}
      </nav>
    </div>
  );
}
