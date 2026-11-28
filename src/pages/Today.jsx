import { useRef } from 'react';
import { TLink } from '../components/Motion.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { Ring, Mastery } from '../components/Meters.jsx';
import { ArrowRight, Check, Flame } from '../components/Icons.jsx';
import { initialOf, pad } from '../data/index.js';
import { useCourse } from '../hooks/useCourse.js';
import { useProfile } from '../hooks/useProfile.js';
import { getDueWords } from '../lib/srs.js';
import { getStreak } from '../lib/streak.js';
import { MODE_ORDER, MODE_TITLES, answersOn, currentDay, dayStatus, weakWords, weekActivity, wordLevel } from '../lib/stats.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/app.css';

const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

const GREETINGS = {
  ko: ['늦은 밤이에요', '좋은 아침이에요', '좋은 오후예요', '좋은 저녁이에요'],
  ar: ['سَهْرَةٌ سَعِيدَة', 'صَبَاحُ الْخَيْر', 'نَهَارُكَ سَعِيد', 'مَسَاءُ الْخَيْر'],
};

function greeting(courseId, h = new Date().getHours()) {
  const i = h < 5 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3;
  return [['Still up', 'Good morning', 'Good afternoon', 'Good evening'][i], GREETINGS[courseId][i]];
}

export default function Today({ progress }) {
  const ref = useRef(null);
  const course = useCourse();
  const profile = useProfile();
  const { days, allWords, lang, dir } = course;
  const goal = profile?.goal ?? 20;
  const day = currentDay(progress, days);
  const status = dayStatus(progress, day);
  const due = getDueWords(progress, allWords);
  const streak = getStreak(progress);
  const today = answersOn(progress);
  const week = weekActivity(progress);
  const weak = weakWords(progress, allWords);
  const upNext = days.filter((d) => d.number > day.number && dayStatus(progress, d).state === 'new').slice(0, 3);
  const [en, native] = greeting(course.id);
  const nextMode = status.nextMode ?? 'choice';
  const name = profile?.name;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from('.today > *', { y: 24, opacity: 0, stagger: 0.07, duration: 0.9 });
    },
    { scope: ref, dependencies: [course.id] },
  );

  return (
    <div className="wrap today" ref={ref}>
      <header className="today__head">
        <div>
          <p className="eyebrow">
            {course.name} · {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="today__greet">
            <span className="ko" lang={lang} dir={dir}>{native}</span>
            <span>{name ? `${en}, ${name}.` : `${en}.`}</span>
          </h1>
        </div>
        <div className="goal">
          <Ring value={today / goal} size={64} stroke={5} tone={today >= goal ? 'good' : 'accent'} label={`${today} of ${goal} answers today`}>
            {today >= goal ? <Check width={20} height={20} /> : <span className="num">{today}</span>}
          </Ring>
          <div>
            <b>Daily goal</b>
            <span className="muted">{today >= goal ? 'Done for today. Extra practice still counts.' : `${goal - today} answers to go`}</span>
          </div>
        </div>
      </header>

      <section className="continue card" aria-labelledby="continue-title">
        <div className="continue__body">
          <p className="eyebrow">{status.state === 'new' ? 'Up next' : 'Continue'} · Day {pad(day.number)}</p>
          <h2 id="continue-title" className="continue__title">
            <span className="ko" lang={lang} dir={dir}>{day.titleNative}</span>
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
            <TLink className="btn btn--lg btn--accent" to={course.path(`/day/${day.number}/practice/${nextMode}`)} native={day.titleNative} en={MODE_TITLES[nextMode]}>
              {status.nextMode ? `${status.modes.length ? 'Continue' : 'Start'}: ${MODE_TITLES[nextMode]}` : 'Practice again'} <ArrowRight />
            </TLink>
            <TLink className="link" to={course.path(`/day/${day.number}`)} native={day.titleNative} en={`Day ${pad(day.number)}`}>See the words</TLink>
          </div>
        </div>
        <div className="continue__art">
          {day.cover ? (
            <img src={asset(day.cover)} alt="" width="1600" height="1000" />
          ) : (
            <span className="continue__glyph ko" lang={lang} dir={dir} aria-hidden="true">{lang === 'ko' ? day.titleNative.slice(0, 2) : day.titleNative}</span>
          )}
        </div>
      </section>

      <section className="tile review-tile card" aria-labelledby="review-tile-title">
        <p className="eyebrow" id="review-tile-title">Review</p>
        <p className="tile__big num">{due.length}</p>
        <p className="muted">{due.length ? `${due.length === 1 ? 'word is' : 'words are'} due now` : 'All caught up'}</p>
        {due.length > 0 ? (
          <TLink className="btn btn--block" to={course.path('/review')} native={course.reviewNative} en="Review">Review now <ArrowRight /></TLink>
        ) : (
          <TLink className="btn btn--ghost btn--block" to={course.path('/progress')}>See progress</TLink>
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
                <span className="ko watch__ko" lang={lang} dir={dir}>{w.term}</span>
                <span className="watch__en">{w.english}</span>
                <Mastery level={wordLevel(progress, w)} label={false} />
                <SpeakButton text={w.term} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {upNext.length > 0 && (
        <section className={`upnext card ${weak.length ? '' : 'upnext--wide'}`} aria-labelledby="upnext-title">
          <div className="tile__head">
            <h2 className="h3" id="upnext-title">Coming up</h2>
            <TLink className="link" to={course.path('/course')}>Course</TLink>
          </div>
          <ul className="upnext__list">
            {upNext.map((d) => (
              <li key={d.id}>
                <TLink to={course.path(`/day/${d.number}`)} native={d.titleNative} en={`Day ${pad(d.number)}`} className="upnext__row">
                  <span className="thumb">
                    {d.cover ? <img src={asset(d.cover)} alt="" loading="lazy" /> : <span className="ko" lang={lang}>{initialOf(d.titleNative)}</span>}
                  </span>
                  <span>
                    <span className="upnext__n">Day {pad(d.number)}</span>
                    <span className="ko-ui" lang={lang} dir={dir}>{d.titleNative}</span> <span className="muted">· {d.title}</span>
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
