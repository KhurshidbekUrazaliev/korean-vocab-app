import { useMemo, useState } from 'react';
import { Session } from '../components/Session.jsx';
import '../styles/practice.css';
import { TLink } from '../components/Motion.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { allWords } from '../data/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { getDueWords } from '../lib/srs.js';

export default function Review() {
  const progress = useProgress();
  // Freeze the due list when the page opens so answering doesn't reshuffle the round.
  const [due] = useState(() => getDueWords(progress, allWords).slice(0, 20));
  const [mode, setMode] = useState(null);
  const next = useMemo(() => {
    const times = Object.values(progress.words).map((s) => new Date(s.dueAt)).filter((d) => d > new Date());
    return times.length ? new Date(Math.min(...times)) : null;
  }, [progress]);

  if (mode) {
    return (
      <div className="review-session">

        <Session words={due} pool={allWords} mode={mode} title="Review" exitTo="/" exitLabel="Back to Today" next={{ to: '/progress', label: 'See your progress', ko: '기록' }} />
      </div>
    );
  }

  return (
    <section className="prose-page wrap review-page">

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
            <button type="button" className="btn btn--lg btn--accent" onClick={() => setMode('choice')}>Review with multiple choice <ArrowRight /></button>
            <button type="button" className="btn btn--lg btn--ghost" onClick={() => setMode('flashcards')}>Review with flashcards</button>
          </div>
        </>
      ) : (
        <>
          <p className="lede">
            {Object.keys(progress.words).length
              ? `Your next word comes back ${next ? next.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' }) : 'soon'}.`
              : 'Practice a lesson to start your review list. Missed words are due immediately. A new word you answer correctly comes back in one day.'}
          </p>
          <div className="hero__ctas">
            <TLink className="btn btn--lg btn--accent" to="/course">Open the course <ArrowRight /></TLink>
            <TLink className="btn btn--lg btn--ghost" to="/progress">See progress</TLink>
          </div>
        </>
      )}
    </section>
  );
}
