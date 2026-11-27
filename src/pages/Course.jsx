import { useRef } from 'react';
import { TLink } from '../components/Motion.jsx';
import { Ring } from '../components/Meters.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { days, allWords, pad } from '../data/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { currentDay, dayStatus } from '../lib/stats.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/app.css';

const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';
const asset = (p) => `${import.meta.env.BASE_URL}${p}`;
const STATE_LABEL = { new: 'New', active: 'In progress', complete: 'Completed', mastered: 'Mastered' };
const STATE_TONE = { new: '', active: 'badge--accent', complete: 'badge--ink', mastered: 'badge--good' };

export default function Course() {
  const ref = useRef(null);
  const progress = useProgress();
  const started = Object.keys(progress.words).length > 0;
  const next = started ? currentDay(progress, days) : days[0];
  const learned = allWords.filter((w) => progress.words[w.id]?.correctCount > 0).length;
  const units = [];
  for (let k = 0; k < days.length; k += 10) units.push(days.slice(k, k + 10));

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray('.unit').forEach((u) =>
        gsap.from(u.querySelectorAll('.lesson'), { y: 24, opacity: 0, stagger: 0.035, duration: 0.8, scrollTrigger: { trigger: u, start: 'top 85%', once: true } }),
      );
    },
    { scope: ref },
  );

  return (
    <div className="wrap course" ref={ref}>
      <title>{`Course: all ${days.length} days | Essential Korean Vocabulary`}</title>
      <meta name="description" content={`All ${days.length} days of the course, ${allWords.length} Korean words in themed sets of ten.`} />
      <link rel="canonical" href={`${SITE}/course`} />

      <header className="page-head">
        <div>
          <p className="eyebrow">Course · 과정</p>
          <h1 className="display">{days.length} days, {allWords.length} words.</h1>
          <p className="lede" style={{ marginTop: 16 }}>Five units of ten days. Each day is one theme and four short steps. Go in order or jump to the topic you need.</p>
        </div>
        <div className="course__overall card">
          <Ring value={learned / allWords.length} size={72} stroke={6} tone="ink" label={`${learned} of ${allWords.length} words learned`}>
            <span className="num">{Math.round((learned / allWords.length) * 100)}%</span>
          </Ring>
          <div>
            <b className="num">{learned} / {allWords.length}</b>
            <span className="muted">words learned</span>
          </div>
        </div>
      </header>

      {units.map((unit, u) => {
        const unitLearned = unit.reduce((a, d) => a + dayStatus(progress, d).learned, 0);
        const unitTotal = unit.length * 10;
        return (
          <section className="unit" key={u} aria-labelledby={`unit-${u}`}>
            <header className="unit__head">
              <div>
                <h2 className="h3" id={`unit-${u}`}>Unit {u + 1}</h2>
                <span className="muted">Days {pad(unit[0].number)}–{pad(unit[unit.length - 1].number)}</span>
              </div>
              <div className="unit__meter" role="progressbar" aria-valuemin={0} aria-valuemax={unitTotal} aria-valuenow={unitLearned} aria-label={`Unit words learned`}>
                <span style={{ width: `${(unitLearned / unitTotal) * 100}%` }} />
              </div>
              <span className="muted num">{unitLearned}/{unitTotal}</span>
            </header>
            <ol className="lessons">
              {unit.map((d) => {
                const s = dayStatus(progress, d);
                const isNext = d.id === next.id;
                return (
                  <li key={d.id}>
                    <TLink className="lesson" data-next={isNext} data-state={s.state} to={`/day/${d.number}`} ko={d.titleKo} en={`Day ${pad(d.number)}`}>
                      <span className="thumb thumb--lg">
                        {d.cover ? <img src={asset(d.cover)} alt="" loading="lazy" width="1600" height="1000" /> : <span className="ko">{d.titleKo.slice(0, 1)}</span>}
                      </span>
                      <span className="lesson__text">
                        <span className="lesson__n">
                          Day {pad(d.number)}
                          {isNext && <span className="badge badge--accent">Up next</span>}
                          {d.status === 'draft' && <span className="badge">Draft</span>}
                        </span>
                        <span className="lesson__ko ko" lang="ko">{d.titleKo}</span>
                        <span className="muted lesson__en">{d.title}</span>
                      </span>
                      <span className="lesson__end">
                        {s.state !== 'new' && <span className={`badge ${STATE_TONE[s.state]}`}>{STATE_LABEL[s.state]}</span>}
                        <Ring value={s.mastery} size={36} stroke={3} tone={s.state === 'mastered' ? 'good' : 'accent'} label={`${s.learned} of 10 learned`}>
                          <span className="num">{s.learned}</span>
                        </Ring>
                        <ArrowRight className="lesson__go" />
                      </span>
                    </TLink>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
