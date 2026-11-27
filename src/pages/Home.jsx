import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { TLink } from '../components/Motion.jsx';
import { RevealText, RevealGroup } from '../components/Reveal.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { ArrowRight, Check, Speaker } from '../components/Icons.jsx';
import { days, allWords, pad, PLANNED_DAYS } from '../data/index.js';
import { useProgress, learnedCount } from '../hooks/useProgress.js';
import { getDueWords } from '../lib/srs.js';
import { getStreak } from '../lib/streak.js';
import { localDateKey } from '../lib/progress.js';
import { shuffle } from '../lib/shuffle.js';
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/home.css';

// three.js is only needed for the hero, so it loads in its own chunk.
const HangulField = lazy(() => import('../components/HangulField.jsx').then((m) => ({ default: m.HangulField })));

const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app/';

export default function Home() {
  const progress = useProgress();
  const nextDay = days.find((d) => learnedCount(progress, d) < d.words.length) ?? days[0];
  const started = Object.keys(progress.words).length > 0;

  return (
    <>
      <title>Essential Korean Vocabulary: learn Korean words one day at a time</title>
      <meta
        name="description"
        content={`${allWords.length} Korean words in ${days.length} daily sets, with flashcards, multiple choice, typing and listening practice and spaced review.`}
      />
      <link rel="canonical" href={SITE} />
      <Hero nextDay={nextDay} started={started} />
      <Marquee />
      <Scene />
      <Modes />
      <DaysGallery progress={progress} />
      <ReviewBand progress={progress} />
    </>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ nextDay, started }) {
  const ref = useRef(null);
  const showcase = useMemo(
    () => shuffle(allWords.filter((w) => !w.korean.includes(' ') && w.korean.length <= 3)).slice(0, 10),
    [],
  );
  const showcaseKo = useMemo(() => showcase.map((w) => w.korean), [showcase]);
  const [i, setI] = useState(0);
  const word = showcase[i];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap
        .timeline({ delay: 0.1 })
        .from('.hero__stage', { clipPath: 'inset(12% 12% 12% 12% round 28px)', scale: 1.04, duration: 1.6 })
        .from('.hero .eyebrow, .hero .lede, .hero__ctas > *, .hero__stats > *', { y: 24, opacity: 0, stagger: 0.07 }, 0.5)
        .from('.hero__chip', { y: 30, opacity: 0, stagger: 0.12, duration: 1.2 }, 0.9);
      gsap.to('.hero__chip--a', { y: -10, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.hero__chip--b', { y: 12, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      // Parallax: the stage sinks and the copy lifts as you scroll away.
      gsap.to('.hero__stage', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__copy', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } });
    },
    { scope: ref },
  );

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo('.hero__caption > *', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.8 });
    },
    { scope: ref, dependencies: [i] },
  );

  return (
    <section className="hero wrap" ref={ref}>
      <div className="hero__copy">
        <p className="eyebrow">Korean vocabulary · 10 words a day</p>
        <RevealText as="h1" className="display" onScroll={false} delay={0.35}>
          Learn Korean<br />one day<br />at a time.
        </RevealText>
        <p className="lede">
          Short daily word sets you hear, flip, type and get quizzed on. The ones you miss come back on a schedule until they stick.
        </p>
        <div className="hero__ctas">
          <TLink className="btn" to={`/day/${nextDay.number}`} ko={nextDay.titleKo} en={`Day ${pad(nextDay.number)}`}>
            {started ? `Continue with Day ${pad(nextDay.number)}` : 'Start Day 01'}
            <span className="btn__icon"><ArrowRight /></span>
          </TLink>
          <TLink className="btn btn--ghost" to="/#days">See all {days.length} days</TLink>
        </div>
        <dl className="hero__stats">
          <div><dt>Words</dt><dd>{allWords.length}</dd></div>
          <div><dt>Days</dt><dd>{days.length}{days.length < PLANNED_DAYS && <span>/{PLANNED_DAYS}</span>}</dd></div>
          <div><dt>Practice modes</dt><dd>4</dd></div>
        </dl>
      </div>

      <div className="hero__stage">
        <Suspense fallback={<div className="hero__field" />}>
          <HangulField className="hero__field" words={showcaseKo} onWordChange={setI} />
        </Suspense>
        <div className="hero__caption" aria-live="polite">
          <span className="hero__caption-ko ko">{word.korean}</span>
          <span>{word.romanization}</span>
          <span className="hero__caption-en">{word.english}</span>
        </div>
        <div className="hero__chip hero__chip--a chip">
          <SpeakButton text={word.korean} className="icon-btn" size={16} />
          <span>Tap to hear it</span>
        </div>
        <div className="hero__chip hero__chip--b chip">
          <span className="hero__chip-num">Day {pad(word.dayNumber)}</span>
          <span>{days[word.dayNumber - 1].title}</span>
        </div>
        <p className="hero__hint" aria-hidden="true">Move your cursor through the word</p>
      </div>
    </section>
  );
}

/* ---------------- Marquee ---------------- */

function Marquee() {
  const ref = useRef(null);
  const rows = useMemo(() => {
    const words = shuffle(allWords);
    return [words.slice(0, 18), words.slice(18, 36)];
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tweens = gsap.utils.toArray('.marquee__track').map((track, r) =>
        gsap.fromTo(track, { xPercent: r ? -50 : 0 }, { xPercent: r ? 0 : -50, duration: 40, ease: 'none', repeat: -1 }),
      );
      // Scrolling speeds the ticker up in the scroll direction, then it eases back.
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
          tweens.forEach((t) => gsap.to(t, { timeScale: 1 + Math.abs(boost), duration: 0.2, overwrite: true }));
          gsap.to(tweens, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
        },
      });
    },
    { scope: ref },
  );

  return (
    <section className="marquee" ref={ref} aria-label="Sample words">
      {rows.map((row, r) => (
        <div className="marquee__row" key={r}>
          <div className="marquee__track">
            {[...row, ...row].map((w, k) => (
              <span className="marquee__item" key={k} aria-hidden={k >= row.length}>
                <span className="ko">{w.korean}</span>
                <small>{w.english}</small>
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------- Scene: illustration that opens up as you scroll ---------------- */

function Scene() {
  const ref = useRef(null);
  const withCovers = days.filter((d) => d.cover).length;
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'top 10%', scrub: 0.8 } });
      tl.fromTo('.scene__frame', { clipPath: 'inset(10% 8% 10% 8% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
        .fromTo('.scene__frame img', { scale: 1.18 }, { scale: 1, ease: 'none' }, 0);
      gsap.to('.scene__frame img', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } });
    },
    { scope: ref },
  );
  return (
    <section className="scene" ref={ref} aria-labelledby="scene-title">
      <div className="scene__frame">
        <img
          src={`${import.meta.env.BASE_URL}images/hero.webp`}
          alt="Illustration of a quiet Seoul side street with a corner shop, a bicycle and N Seoul Tower in the distance"
          loading="lazy"
          width="1600"
          height="1000"
        />
      </div>
      <div className="scene__copy wrap">
        <p className="eyebrow">Every day is a scene</p>
        <RevealText as="h2" className="h2" id="scene-title">Words for the street you will actually walk down.</RevealText>
        <p className="lede">Each day has its own illustration of the place its words come from: a dinner table, a subway car, a market stall. {withCovers} days are illustrated so far.</p>
      </div>
    </section>
  );
}

/* ---------------- Modes (pinned scroll scene) ---------------- */

const MODES = [
  { key: 'flashcards', title: 'Flashcards', body: 'See the Korean, say it out loud, flip to check. Mark it known or send it back.' },
  { key: 'choice', title: 'Multiple choice', body: 'Pick the right meaning from four. Switch direction to go from English to Korean.' },
  { key: 'typing', title: 'Typing', body: 'Type the meaning from memory. Small spelling slips are flagged, not failed.' },
  { key: 'listening', title: 'Listening', body: 'Hear the word in a Korean voice and pick what it means. No reading allowed.' },
];

function Modes() {
  const ref = useRef(null);
  const demo = days[0].words[0];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 960px)', () => {
        const panes = gsap.utils.toArray('.modes__pane');
        const steps = gsap.utils.toArray('.modes__step');
        gsap.set(panes.slice(1), { yPercent: 105, rotate: 4 });
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=300%', pin: true, scrub: 0.8 },
        });
        tl.to('.modes__bar span', { scaleY: 1, ease: 'none', duration: 3 }, 0);
        tl.to('.flash-demo__card', { rotateY: 180, duration: 0.6 }, 0.15);
        panes.slice(1).forEach((pane, k) => {
          const at = k + 0.6;
          tl.to(pane, { yPercent: 0, rotate: 0 }, at)
            .to(panes[k], { scale: 0.88, opacity: 0, yPercent: -6 }, at)
            .to(steps[k], { opacity: 0.35 }, at)
            .to(steps[k + 1], { opacity: 1 }, at);
        });
        tl.to('.choice-demo__opt--right', { backgroundColor: 'var(--accent)', duration: 0.3 }, 1.8);
        tl.fromTo('.typing-demo__typed', { width: '0ch' }, { width: '10ch', ease: 'steps(10)', duration: 0.6 }, 2.0);
        tl.from('.typing-demo__ok', { scale: 0, duration: 0.25 }, 2.6);
      });
    },
    { scope: ref },
  );

  return (
    <section className="modes" ref={ref} aria-labelledby="modes-title">
      <div className="wrap modes__inner">
        <div className="modes__copy">
          <p className="eyebrow">How a day works</p>
          <h2 className="h2" id="modes-title">One word set, four ways to practice.</h2>
          <div className="modes__list">
            <div className="modes__bar" aria-hidden="true"><span /></div>
            <ol>
              {MODES.map((m, k) => (
                <li className="modes__step" key={m.key} style={{ opacity: k ? 0.35 : 1 }}>
                  <span className="modes__num">{pad(k + 1)}</span>
                  <div>
                    <h3>{m.title}</h3>
                    <p>{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="modes__stage" aria-hidden="true">
          <div className="modes__pane">
            <div className="flash-demo">
              <div className="flash-demo__card">
                <div className="flash-demo__face"><span className="ko">{demo.korean}</span><small>Day 01 · word 1</small></div>
                <div className="flash-demo__face flash-demo__face--back"><span>{demo.english}</span><small>{demo.romanization}</small></div>
              </div>
            </div>
          </div>
          <div className="modes__pane">
            <div className="choice-demo">
              <p className="ko">{days[0].words[4].korean}</p>
              <ul>
                {['dessert', 'garlic', 'night view', 'to cancel'].map((o, k) => (
                  <li key={o} className={`choice-demo__opt ${k === 0 ? 'choice-demo__opt--right' : ''}`}>
                    <kbd>{k + 1}</kbd>{o}{k === 0 && <Check />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="modes__pane">
            <div className="typing-demo">
              <p className="ko">{days[0].words[0].korean}</p>
              <div className="typing-demo__field">
                <span className="typing-demo__typed">dining out</span>
                <span className="typing-demo__ok"><Check /></span>
              </div>
              <small>Type the meaning, press Enter</small>
            </div>
          </div>
          <div className="modes__pane">
            <div className="listen-demo">
              <span className="listen-demo__play"><Speaker width={40} height={40} /></span>
              <div className="listen-demo__wave">{Array.from({ length: 24 }, (_, k) => <i key={k} style={{ animationDelay: `${(k % 8) * 0.09}s` }} />)}</div>
              <small>What did you hear?</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Days index (blocks of ten) ---------------- */

function DaysGallery({ progress }) {
  const ref = useRef(null);
  const blocks = [];
  for (let k = 0; k < days.length; k += 10) blocks.push(days.slice(k, k + 10));
  const complete = days.length >= PLANNED_DAYS;
  const drafts = days.filter((d) => d.status === 'draft').length;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray('.days__block').forEach((block) => {
        gsap.from(block.querySelectorAll('.day-card'), {
          y: 48,
          opacity: 0,
          stagger: { each: 0.05, grid: 'auto', from: 'start' },
          duration: 1,
          scrollTrigger: { trigger: block, start: 'top 80%', once: true },
        });
        gsap.from(block.querySelector('.days__block-num'), {
          yPercent: 30,
          opacity: 0,
          scrollTrigger: { trigger: block, start: 'top 80%', end: 'top 30%', scrub: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section className="days" id="days" ref={ref} aria-labelledby="days-title">
      <div className="wrap days__head">
        <div>
          <p className="eyebrow">The course</p>
          <h2 className="h2" id="days-title">
            {complete ? `${days.length} days. ${allWords.length} words.` : `${days.length} days ready. ${PLANNED_DAYS} planned.`}
          </h2>
        </div>
        <p className="lede">
          Each day is ten words around one theme. Do them in order or jump to the topic you need.
          {drafts > 0 && ` Days marked Draft are new lists still being checked.`}
        </p>
      </div>
      <div className="wrap">
        {blocks.map((block) => (
          <div className="days__block" key={block[0].id}>
            <p className="days__block-num" aria-hidden="true">
              {pad(block[0].number)}<span>–{pad(block[block.length - 1].number)}</span>
            </p>
            <ol className="days__grid">
              {block.map((d) => {
                const learned = learnedCount(progress, d);
                const best = progress.days[d.id]?.best;
                return (
                  <li key={d.id}>
                    <TLink className={`day-card ${d.cover ? 'day-card--img' : ''}`} to={`/day/${d.number}`} ko={d.titleKo} en={`Day ${pad(d.number)}`}>
                      {d.cover && <img className="day-card__img" src={`${import.meta.env.BASE_URL}${d.cover}`} alt="" loading="lazy" width="1600" height="1000" />}
                      <span className="day-card__top">
                        <span className="day-card__num">{pad(d.number)}</span>
                        {d.status === 'draft' && <span className="badge">Draft</span>}
                      </span>
                      <span className="day-card__ko ko" lang="ko">{d.titleKo}</span>
                      <span className="day-card__title">{d.title}</span>
                      <span className="day-card__foot">
                        <span className="day-card__meter" aria-label={`${learned} of ${d.words.length} words learned`}>
                          <span style={{ width: `${(learned / d.words.length) * 100}%` }} />
                        </span>
                        <span>{best != null ? `${best}%` : `${d.words.length} words`}</span>
                      </span>
                    </TLink>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Review / streak band ---------------- */

function ReviewBand({ progress }) {
  const ref = useRef(null);
  const due = getDueWords(progress, allWords).length;
  const streak = getStreak(progress);
  const seen = Object.keys(progress.words).length;
  const active = new Set(progress.activity);
  const cells = Array.from({ length: 28 }, (_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - k));
    return { key: localDateKey(d), on: active.has(localDateKey(d)), today: k === 27 };
  });

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from('.review-band__num', {
        textContent: 0,
        snap: { textContent: 1 },
        duration: 1.6,
        scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
      });
      gsap.from('.review-band__cells i', {
        scale: 0,
        stagger: { each: 0.02, from: 'end' },
        duration: 0.6,
        scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
      });
    },
    { scope: ref, dependencies: [due] },
  );

  return (
    <section className="review-band" ref={ref} aria-labelledby="review-title">
      <div className="wrap review-band__grid">
        <div>
          <p className="eyebrow eyebrow--light">Spaced review</p>
          <RevealText as="h2" className="h2" id="review-title">
            {seen ? 'Your words come back right before you forget them.' : 'Words you miss come back right before you forget them.'}
          </RevealText>
          <RevealGroup as="ul" className="review-band__steps">
            <li><b>Missed</b> back tomorrow</li>
            <li><b>Right once</b> in 3 days</li>
            <li><b>Right twice</b> in a week</li>
            <li><b>Right again</b> in 16 days</li>
          </RevealGroup>
        </div>
        <div className="review-band__panel">
          {seen ? (
            <>
              <p className="review-band__label">Due for review now</p>
              <p className="review-band__num">{due}</p>
              <div className="review-band__streak">
                <span><b>{streak.current}</b> day streak</span>
                <span>Best {streak.best}</span>
                <span>{seen} words practiced</span>
              </div>
              <div className="review-band__cells" aria-label={`Practice activity, last 28 days: ${cells.filter((c) => c.on).length} active days`}>
                {cells.map((c) => <i key={c.key} data-on={c.on} data-today={c.today} title={c.key} />)}
              </div>
              {due > 0 ? (
                <TLink className="btn" to="/review" ko="복습" en="Review">
                  Review {due} due {due === 1 ? 'word' : 'words'}<span className="btn__icon"><ArrowRight /></span>
                </TLink>
              ) : (
                <p className="review-band__empty">Nothing due right now. Come back tomorrow or start a new day.</p>
              )}
            </>
          ) : (
            <>
              <p className="review-band__label">Your review queue</p>
              <p className="review-band__num">0</p>
              <p className="review-band__empty">Finish any practice round and your queue starts filling up. Progress stays in this browser, no account needed.</p>
              <TLink className="btn" to="/day/1" ko={days[0].titleKo} en="Day 01">
                Start Day 01<span className="btn__icon"><ArrowRight /></span>
              </TLink>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
