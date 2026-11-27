import { useRef } from 'react';
import { TLink } from '../components/Motion.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { Ring, Mastery } from '../components/Meters.jsx';
import { ArrowRight, Check, Flame } from '../components/Icons.jsx';
import { days, allWords, pad } from '../data/index.js';
import { getDueWords } from '../lib/srs.js';
import { getStreak } from '../lib/streak.js';
import { MODE_ORDER, MODE_TITLES, DAILY_GOAL, answersOn, currentDay, dayStatus, weakWords, weekActivity, wordLevel } from '../lib/stats.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/app.css';

const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

function greeting(h = new Date().getHours()) {
  if (h < 5) return ['Still up', '늦은 밤이에요'];
  if (h < 12) return ['Good morning', '좋은 아침이에요'];
  if (h < 18) return ['Good afternoon', '좋은 오후예요'];
  return ['Good evening', '좋은 저녁이에요'];
}

export default function Today({ progress }) {
  const ref = useRef(null);
  const day = currentDay(progress, days);
  const status = dayStatus(progress, day);
  const due = getDueWords(progress, allWords);
  const streak = getStreak(progress);
  const today = answersOn(progress);
  const week = weekActivity(progress);
  const weak = weakWords(progress, allWords);
  const upNext = days.filter((d) => d.number > day.number && dayStatus(progress, d).state === 'new').slice(0, 3);
  const [en, ko] = greeting();
  const nextMode = status.nextMode ?? 'choice';

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from('.today > *', { y: 24, opacity: 0, stagger: 0.07, duration: 0.9 });
    },
    { scope: ref },
  );

  return (
    <div className="wrap today" ref={ref}>
      <header className="today__head">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="today__greet">
            <span className="ko" lang="ko">{ko}</span>
            <span>{en}.</span>
          </h1>
        </div>
        <div className="goal">
          <Ring value={today / DAILY_GOAL} size={64} stroke={5} tone={today >= DAILY_GOAL ? 'good' : 'accent'} label={`${today} of ${DAILY_GOAL} answers today`}>
            {today >= DAILY_GOAL ? <Check width={20} height={20} /> : <span className="num">{today}</span>}
          </Ring>
          <div>
            <b>Daily goal</b>
            <span className="muted">{today >= DAILY_GOAL ? 'Done for today. Extra practice still counts.' : `${DAILY_GOAL - today} answers to go`}</span>
          </div>
        </div>
      </header>

      <section className="continue card" aria-labelledby="continue-title">
        <div className="continue__body">
          <p className="eyebrow">{status.state === 'new' ? 'Up next' : 'Continue'} · Day {pad(day.number)}</p>
          <h2 id="continue-title" className="continue__title">
            <span className="ko" lang="ko">{day.titleKo}</span>
            <span>{day.title}</span>
          </h2>
          <ol className="steps" aria-label="Lesson steps">
            {MODE_ORDER.map((m, k) => {
              const done = status.modes.includes(m);
              const current = m === status.nextMode;
              return (
                <li key={m} data-done={done} data-current={current}>
                  <span className="steps__dot">{done ? <Check width={14} height={14} /> : k + 1}</span>
                  <span>{MODE_TITLES[m]}</span>
                </li>
              );
            })}
          </ol>
          <div className="continue__actions">
            <TLink className="btn btn--lg btn--accent" to={`/day/${day.number}/practice/${nextMode}`} ko={day.titleKo} en={MODE_TITLES[nextMode]}>
              {status.nextMode ? `${status.modes.length ? 'Continue' : 'Start'}: ${MODE_TITLES[nextMode]}` : 'Practice again'} <ArrowRight />
            </TLink>
            <TLink className="link" to={`/day/${day.number}`} ko={day.titleKo} en={`Day ${pad(day.number)}`}>See the words</TLink>
          </div>
        </div>
        <div className="continue__art">
          {day.cover ? <img src={asset(day.cover)} alt="" width="1600" height="1000" /> : <span className="continue__glyph ko" aria-hidden="true">{day.titleKo.slice(0, 2)}</span>}
        </div>
      </section>

      <section className="tile review-tile card" aria-labelledby="review-tile-title">
        <p className="eyebrow" id="review-tile-title">Review</p>
        <p className="tile__big num">{due.length}</p>
        <p className="muted">{due.length ? `${due.length === 1 ? 'word is' : 'words are'} due now` : 'All caught up'}</p>
        {due.length > 0 ? (
          <TLink className="btn btn--block" to="/review" ko="복습" en="Review">Review now <ArrowRight /></TLink>
        ) : (
          <TLink className="btn btn--ghost btn--block" to="/progress">See progress</TLink>
        )}
      </section>

      <section className="tile streak-tile card" aria-labelledby="streak-tile-title">
        <p className="eyebrow" id="streak-tile-title">Streak</p>
        <p className="tile__big num">
          {streak.current}
          <Flame className="streak-tile__flame" data-on={streak.practicedToday} />
        </p>
        <p className="muted">{streak.practicedToday ? 'Practiced today' : streak.current ? 'Practice today to keep it' : 'Start one today'} · best {streak.best}</p>
        <ol className="week" aria-label="This week">
          {week.map((d) => (
            <li key={d.key} data-active={d.active} data-today={d.today} data-future={d.future}>
              <span className="week__dot" />
              <span>{d.label}</span>
            </li>
          ))}
        </ol>
      </section>

      {weak.length > 0 && (
        <section className="watch card" aria-labelledby="watch-title">
          <div className="tile__head">
            <h2 className="h3" id="watch-title">Words to watch</h2>
            <span className="muted">Missed recently</span>
          </div>
          <ul className="watch__list">
            {weak.map((w) => (
              <li key={w.id}>
                <span className="ko watch__ko" lang="ko">{w.korean}</span>
                <span className="watch__en">{w.english}</span>
                <Mastery level={wordLevel(progress, w)} label={false} />
                <SpeakButton text={w.korean} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {upNext.length > 0 && (
        <section className={`upnext card ${weak.length ? '' : 'upnext--wide'}`} aria-labelledby="upnext-title">
          <div className="tile__head">
            <h2 className="h3" id="upnext-title">Coming up</h2>
            <TLink className="link" to="/course">Course</TLink>
          </div>
          <ul className="upnext__list">
            {upNext.map((d) => (
              <li key={d.id}>
                <TLink to={`/day/${d.number}`} ko={d.titleKo} en={`Day ${pad(d.number)}`} className="upnext__row">
                  <span className="thumb">{d.cover ? <img src={asset(d.cover)} alt="" loading="lazy" /> : <span className="ko">{d.titleKo[0]}</span>}</span>
                  <span>
                    <span className="upnext__n">Day {pad(d.number)}</span>
                    <span className="ko-ui">{d.titleKo}</span> <span className="muted">· {d.title}</span>
                  </span>
                  <ArrowRight className="upnext__go" />
                </TLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
