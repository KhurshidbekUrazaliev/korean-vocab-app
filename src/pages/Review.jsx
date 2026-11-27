import { useMemo, useState } from 'react';
import { Session } from '../components/Session.jsx';
import { TLink } from '../components/Motion.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { allWords, days } from '../data/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { getDueWords } from '../lib/srs.js';

const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';

export default function Review() {
  const progress = useProgress();
  // Freeze the due list when the page opens so answering doesn't reshuffle the round.
  const [due] = useState(() => getDueWords(progress, allWords).slice(0, 20));
  const [mode, setMode] = useState(null);
  const next = useMemo(() => {
    const times = Object.values(progress.words).map((s) => new Date(s.dueAt)).filter((d) => d > new Date());
    return times.length ? new Date(Math.min(...times)) : null;
  }, [progress]);

  const head = (
    <>
      <title>Review due words | Essential Korean Vocabulary</title>
      <meta name="description" content="Spaced review of the Korean words you have practiced, scheduled so each one comes back just before you forget it." />
      <link rel="canonical" href={`${SITE}/review`} />
    </>
  );

  if (mode) {
    return (
      <div className="review-session">
        {head}
        <Session words={due} pool={allWords} mode={mode} exitTo="/" exitLabel="Back to home" />
      </div>
    );
  }

  return (
    <section className="prose-page wrap review-page">
      {head}
      <p className="eyebrow">Spaced review · 복습</p>
      <h1 className="display">{due.length ? `${due.length} ${due.length === 1 ? 'word is' : 'words are'} due.` : 'Nothing due right now.'}</h1>
      {due.length ? (
        <>
          <p className="lede">These are words from any day that are scheduled to come back today. Pick how you want to go through them.</p>
          <ul className="review-page__words">
            {due.map((w) => (
              <li key={w.id}><span className="ko" lang="ko">{w.korean}</span><small>Day {String(w.dayNumber).padStart(2, '0')}</small></li>
            ))}
          </ul>
          <div className="hero__ctas">
            <button type="button" className="btn" onClick={() => setMode('choice')}>Review with multiple choice<span className="btn__icon"><ArrowRight /></span></button>
            <button type="button" className="btn btn--ghost" onClick={() => setMode('flashcards')}>Review with flashcards</button>
          </div>
        </>
      ) : (
        <>
          <p className="lede">
            {Object.keys(progress.words).length
              ? `Your next word comes back ${next ? next.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' }) : 'soon'}.`
              : 'Practice any day first. Words you answer show up here on a schedule: missed words tomorrow, known words a few days later.'}
          </p>
          <div className="hero__ctas">
            <TLink className="btn" to={`/day/${days[0].number}`} ko={days[0].titleKo} en="Day 01">Go to Day 01<span className="btn__icon"><ArrowRight /></span></TLink>
            <TLink className="btn btn--ghost" to="/#days">See all days</TLink>
          </div>
        </>
      )}
    </section>
  );
}
