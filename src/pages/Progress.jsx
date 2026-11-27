import { useRef } from 'react';
import { TLink } from '../components/Motion.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { days, allWords, pad } from '../data/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { getStreak } from '../lib/streak.js';
import { activityGrid, dayStatus, masteryBreakdown } from '../lib/stats.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/app.css';

const BOXES = ['Not started', 'Box 1 · tomorrow', 'Box 2 · 3 days', 'Box 3 · a week', 'Box 4 · 16 days', 'Box 5 · long term'];

export default function Progress() {
  const ref = useRef(null);
  const progress = useProgress();
  const started = Object.keys(progress.words).length > 0;
  const streak = getStreak(progress);
  const learned = allWords.filter((w) => progress.words[w.id]?.correctCount > 0).length;
  const breakdown = masteryBreakdown(progress, allWords);
  const mastered = breakdown[4] + breakdown[5];
  const grid = activityGrid(progress, 52);
  const total = Object.values(progress.daily ?? {}).reduce((a, b) => a + b, 0);
  const level = (c) => (c === 0 ? 0 : c < 10 ? 1 : c < 20 ? 2 : c < 40 ? 3 : 4);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from('.stat__v', { textContent: 0, snap: { textContent: 1 }, duration: 1.2, stagger: 0.08 });
      gsap.from('.heat i', { scale: 0, duration: 0.5, stagger: { each: 0.004, from: 'end' } });
      gsap.from('.dist span', { scaleX: 0, transformOrigin: 'left', duration: 1, stagger: 0.06 });
    },
    { scope: ref },
  );

  return (
    <div className="wrap progress-page" ref={ref}>
      <title>Progress | Essential Korean Vocabulary</title>
      <meta name="robots" content="noindex" />
      <header className="page-head">
        <div>
          <p className="eyebrow">Progress · 기록</p>
          <h1 className="display">{started ? 'Your progress.' : 'Nothing here yet.'}</h1>
          {!started && <p className="lede" style={{ marginTop: 16 }}>Finish one practice round and your stats, streak and review boxes show up here. Everything stays in this browser.</p>}
        </div>
        {!started && <TLink className="btn btn--lg btn--accent" to="/day/1" ko={days[0].titleKo} en="Day 01">Start Day 01 <ArrowRight /></TLink>}
      </header>

      <ul className="stats">
        {[
          [learned, 'Words learned', `of ${allWords.length}`],
          [mastered, 'Words mastered', 'box 4 or higher'],
          [streak.current, 'Day streak', `best ${streak.best}`],
          [total, 'Answers', 'all time'],
        ].map(([v, label, sub]) => (
          <li className="stat card" key={label}>
            <span className="stat__l">{label}</span>
            <span className="stat__v num">{v}</span>
            <span className="muted">{sub}</span>
          </li>
        ))}
      </ul>

      <section className="card panel" aria-labelledby="activity-title">
        <div className="tile__head">
          <h2 className="h3" id="activity-title">Activity</h2>
          <span className="muted">Last 12 months</span>
        </div>
        <div className="heat" ref={(el) => el && (el.scrollLeft = el.scrollWidth)} role="img" aria-label={`${progress.activity.length} active days`}>
          {grid.map((c) => <i key={c.key} data-l={level(c.count)} data-future={c.future} title={`${c.key}: ${c.count} answers`} />)}
        </div>
        <div className="heat__legend muted"><span>Less</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} data-l={l} />)}<span>More</span></div>
      </section>

      <section className="card panel" aria-labelledby="mastery-title">
        <div className="tile__head">
          <h2 className="h3" id="mastery-title">Review boxes</h2>
          <span className="muted">Where all {allWords.length} words sit</span>
        </div>
        <div className="dist" aria-hidden="true">
          {breakdown.map((n, b) => n > 0 && <span key={b} data-b={b} style={{ flexGrow: n }} />)}
        </div>
        <ul className="dist__legend">
          {breakdown.map((n, b) => (
            <li key={b}><i data-b={b} />{BOXES[b]}<b className="num">{n}</b></li>
          ))}
        </ul>
      </section>

      <section className="card panel" aria-labelledby="days-title">
        <div className="tile__head">
          <h2 className="h3" id="days-title">By day</h2>
          <TLink className="link" to="/course">Open course</TLink>
        </div>
        <ol className="daybars">
          {days.map((d) => {
            const s = dayStatus(progress, d);
            return (
              <li key={d.id} title={`Day ${pad(d.number)} ${d.title}: ${s.learned}/10 learned, ${s.mastered} mastered`}>
                <TLink to={`/day/${d.number}`} aria-label={`Day ${d.number}, ${s.learned} of 10 learned`}>
                  <span className="daybars__bar"><span style={{ height: `${s.learned * 10}%` }} /><span className="daybars__m" style={{ height: `${s.mastered * 10}%` }} /></span>
                  <span className="daybars__n num">{d.number % 5 === 0 || d.number === 1 ? d.number : ''}</span>
                </TLink>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
