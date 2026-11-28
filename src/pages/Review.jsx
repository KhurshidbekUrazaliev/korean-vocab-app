import { useMemo, useState } from 'react';
import { Session } from '../components/Session.jsx';
import '../styles/practice.css';
import { TLink } from '../components/Motion.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { pad } from '../data/index.js';
import { useCourse } from '../hooks/useCourse.js';
import { useProgress } from '../hooks/useProgress.js';
import { getDueWords } from '../lib/srs.js';

export default function Review() {
  const progress = useProgress();
  const course = useCourse();
  const { allWords, lang, dir } = course;
  // Freeze the due list when the page opens so answering doesn't reshuffle the round.
  const [due] = useState(() => getDueWords(progress, allWords).slice(0, 20));
  const [mode, setMode] = useState(null);
  const next = useMemo(() => {
    const times = allWords.map((w) => progress.words[w.id]).filter(Boolean).map((s) => new Date(s.dueAt)).filter((d) => d > new Date());
    return times.length ? new Date(Math.min(...times)) : null;
  }, [progress, allWords]);
  const started = allWords.some((w) => progress.words[w.id]);

  if (mode) {
    return (
      <div className="review-session">

        <Session words={due} pool={allWords} mode={mode} title={`${course.name} review`} exitTo={course.path('/')} exitLabel="Back to Today" next={{ to: course.path('/progress'), label: 'See your progress' }} />
      </div>
    );
  }

  return (
    <section className="prose-page wrap review-page">

      <p className="eyebrow">
        {course.name} review · <span lang={lang} dir={dir}>{course.reviewNative}</span>
      </p>
      <h1 className="display">{due.length ? `${due.length} ${due.length === 1 ? 'word is' : 'words are'} due.` : 'Nothing due right now.'}</h1>
      {due.length ? (
        <>
          <p className="lede">These are words from any day that are scheduled to come back today. Pick how you want to go through them.</p>
          <ul className="review-page__words">
            {due.map((w) => (
              <li key={w.id}><span className="ko" lang={lang} dir={dir}>{w.term}</span><small>Day {pad(w.dayNumber)}</small></li>
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
            {started
              ? `Your next word comes back ${next ? next.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' }) : 'soon'}.`
              : 'Practice a lesson to start your review list. Missed words are due immediately. A new word you answer correctly comes back in one day.'}
          </p>
          <div className="hero__ctas">
            <TLink className="btn btn--lg btn--accent" to={course.path('/course')}>Open the course <ArrowRight /></TLink>
            <TLink className="btn btn--lg btn--ghost" to={course.path('/progress')}>See progress</TLink>
          </div>
        </>
      )}
    </section>
  );
}
