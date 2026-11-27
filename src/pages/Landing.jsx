import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { TLink } from '../components/Motion.jsx';
import { RevealText, RevealGroup } from '../components/Reveal.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { ArrowRight, Check, Speaker } from '../components/Icons.jsx';
import { days, allWords, pad } from '../data/index.js';
import { shuffle } from '../lib/shuffle.js';
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/landing.css';

// three.js is only needed for the hero, so it loads in its own chunk.
const HangulField = lazy(() => import('../components/HangulField.jsx').then((m) => ({ default: m.HangulField })));

const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app/';
const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

export default function Landing() {
  return (
    <>
      <title>Essential Korean Vocabulary: learn Korean words one day at a time</title>
      <meta
        name="description"
        content={`${allWords.length} Korean words in ${days.length} daily sets, with flashcards, multiple choice, typing and listening practice and spaced review.`}
      />
      <link rel="canonical" href={SITE} />
      <Hero />
      <Marquee />
      <Scene />
      <Path />
      <CoursePreview />
      <Review />
    </>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  const ref = useRef(null);
  const showcase = useMemo(() => shuffle(allWords.filter((w) => !w.korean.includes(' ') && w.korean.length <= 3)).slice(0, 10), []);
  const showcaseKo = useMemo(() => showcase.map((w) => w.korean), [showcase]);
  const [i, setI] = useState(0);
  const word = showcase[i];
  const [useStillHero, setUseStillHero] = useState(reducedMotion);
  const showStillHero = useCallback(() => setUseStillHero(true), []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap
        .timeline({ delay: 0.1 })
        .from('.hero__stage', { clipPath: 'inset(10% 10% 10% 10% round 24px)', duration: 1.5 })
        .from('.hero .eyebrow, .hero .lede, .hero__ctas > *, .hero__facts > *', { y: 20, opacity: 0, stagger: 0.06 }, 0.45)
        .from('.hero__chip', { y: 24, opacity: 0, stagger: 0.12, duration: 1.1 }, 0.9);
      gsap.to('.hero__stage', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } });
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
        <p className="eyebrow">Korean vocabulary · 하루에 열 단어</p>
        <RevealText as="h1" className="display" onScroll={false} delay={0.3}>
          Learn Korean,<br />ten words a day.
        </RevealText>
        <p className="lede">
          Hear each word in a Korean voice, flip it, type it, pick it out of a lineup. The ones you miss come back right before you forget them.
        </p>
        <div className="hero__ctas">
          <TLink className="btn btn--lg btn--accent" to="/day/1" ko={days[0].titleKo} en="Day 01">
            Start Day 01 <ArrowRight />
          </TLink>
          <TLink className="btn btn--lg btn--ghost" to="/course">Browse the course</TLink>
        </div>
        <ul className="hero__facts">
          <li><b className="num">{days.length}</b> days</li>
          <li><b className="num">{allWords.length}</b> words</li>
          <li><b>4</b> ways to practice</li>
          <li><b>Free</b>, no account</li>
        </ul>
      </div>

      <div className="hero__stage">
        {useStillHero ? (
          <div className="hero__still ko" lang="ko" aria-hidden="true">{word.korean}</div>
        ) : (
          <Suspense fallback={<div className="hero__field" />}>
            <HangulField className="hero__field" words={showcaseKo} onWordChange={setI} onUnavailable={showStillHero} />
          </Suspense>
        )}
        <div className="hero__caption" aria-live="polite">
          <span className="ko" lang="ko">{word.korean}</span>
          <span className="hero__rom">{word.romanization}</span>
          <span className="hero__en">{word.english}</span>
        </div>
        <div className="hero__chip hero__chip--a chip">
          <SpeakButton text={word.korean} size={16} />
          <span>Hear it</span>
        </div>
        <div className="hero__chip hero__chip--b chip">
          <span className="badge badge--accent">Day {pad(word.dayNumber)}</span>
          <span>{days[word.dayNumber - 1].title}</span>
        </div>
        {!useStillHero && <p className="hero__hint" aria-hidden="true">Move through the word</p>}
      </div>
    </section>
  );
}

/* ---------------- Marquee: a type specimen of the course ---------------- */

function Marquee() {
  const ref = useRef(null);
  const rows = useMemo(() => {
    const words = shuffle(allWords);
    return [words.slice(0, 16), words.slice(16, 32)];
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tweens = gsap.utils.toArray('.marquee__track').map((track, r) =>
        gsap.fromTo(track, { xPercent: r ? -50 : 0 }, { xPercent: r ? 0 : -50, duration: 60, ease: 'none', repeat: -1 }),
      );
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(-5, 5, self.getVelocity() / 300);
          tweens.forEach((t) => gsap.to(t, { timeScale: 1 + Math.abs(boost), duration: 0.2, overwrite: true }));
          gsap.to(tweens, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
        },
      });
    },
    { scope: ref },
  );

  return (
    <section className="marquee" ref={ref} aria-label="Sample words from the course">
      {rows.map((row, r) => (
        <div className="marquee__row" key={r}>
          <div className="marquee__track">
            {[...row, ...row].map((w, k) => (
              <span className="marquee__item" key={k} aria-hidden={k >= row.length}>
                <span className="ko" lang="ko">{w.korean}</span>
                <small>{w.english}</small>
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------- Scene ---------------- */

function Scene() {
  const ref = useRef(null);
  const withCovers = days.filter((d) => d.cover).length;
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'top 10%', scrub: 0.8 } })
        .fromTo('.scene__frame', { clipPath: 'inset(8% 6% 8% 6% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
        .fromTo('.scene__frame img', { scale: 1.15 }, { scale: 1, ease: 'none' }, 0);
    },
    { scope: ref },
  );
  return (
    <section className="scene" ref={ref} aria-labelledby="scene-title">
      <div className="scene__frame">
        <img
          src={asset('images/hero.webp')}
          alt="Illustration of a quiet Seoul side street with a corner shop, a bicycle and N Seoul Tower in the distance"
          loading="lazy"
          width="1600"
          height="1000"
        />
      </div>
      <div className="scene__copy wrap">
        <p className="eyebrow">Every day is a scene</p>
        <RevealText as="h2" className="h2" id="scene-title">Words for the street you will actually walk down.</RevealText>
        <p className="lede">Each day is drawn from a place in daily life: a dinner table, a subway car, a market stall. {withCovers} of {days.length} days are illustrated.</p>
      </div>
    </section>
  );
}

/* ---------------- Lesson path (pinned scene) ---------------- */

const STEPS = [
  { title: 'Learn', mode: 'Flashcards', body: 'See the word, say it out loud, flip to check. Mark it known or not yet.' },
  { title: 'Recall', mode: 'Multiple choice', body: 'Pick the meaning out of four. Then flip direction, English to Korean.' },
  { title: 'Produce', mode: 'Typing', body: 'Type the meaning from memory. Small slips are flagged, not failed.' },
  { title: 'Listen', mode: 'Listening', body: 'Hear the word and choose what it means, without seeing it written.' },
];

function Path() {
  const ref = useRef(null);
  const demo = days[0].words;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 960px)', () => {
        const panes = gsap.utils.toArray('.path__pane');
        const steps = gsap.utils.toArray('.path__step');
        gsap.set(panes.slice(1), { yPercent: 105, rotate: 3 });
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=280%', pin: true, scrub: 0.8 },
        });
        tl.to('.path__bar span', { scaleY: 1, ease: 'none', duration: 3.6 }, 0);
        tl.to('.flash-demo__card', { rotateY: 180, duration: 0.6 }, 0.15);
        panes.slice(1).forEach((pane, k) => {
          const at = k + 0.7;
          tl.to(pane, { yPercent: 0, rotate: 0 }, at)
            .to(panes[k], { scale: 0.9, opacity: 0, yPercent: -5 }, at)
            .to(steps[k], { opacity: 0.4 }, at)
            .to(steps[k + 1], { opacity: 1 }, at);
        });
        tl.to('.choice-demo__opt--right', { backgroundColor: 'var(--good-soft)', boxShadow: 'inset 0 0 0 2px var(--good)', duration: 0.3 }, 1.9);
        tl.fromTo('.typing-demo__typed', { width: '0ch' }, { width: '10ch', ease: 'steps(10)', duration: 0.6 }, 2.1);
        tl.from('.typing-demo__ok', { scale: 0, duration: 0.25 }, 2.7);
      });
    },
    { scope: ref },
  );

  return (
    <section className="path" ref={ref} aria-labelledby="path-title">
      <div className="wrap path__inner">
        <div>
          <p className="eyebrow">How a day works</p>
          <h2 className="h2" id="path-title">Four short steps, about ten minutes.</h2>
          <div className="path__list">
            <div className="path__bar" aria-hidden="true"><span /></div>
            <ol>
              {STEPS.map((s, k) => (
                <li className="path__step" key={s.title} style={{ opacity: k ? 0.4 : 1 }}>
                  <span className="path__num num">{pad(k + 1)}</span>
                  <div>
                    <h3 className="h3">{s.title} <span className="muted">· {s.mode}</span></h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="path__stage" aria-hidden="true">
          <img className="path__art" src={asset(days[0].cover)} alt="" loading="lazy" />
          <div className="path__pane">
            <div className="flash-demo">
              <div className="flash-demo__card">
                <div className="flash-demo__face"><span className="ko">{demo[0].korean}</span><small>Day 01 · 1 of 10</small></div>
                <div className="flash-demo__face flash-demo__face--back"><span>{demo[0].english}</span><small>{demo[0].romanization}</small></div>
              </div>
            </div>
          </div>
          <div className="path__pane">
            <div className="choice-demo">
              <p className="ko">{demo[4].korean}</p>
              <ul>
                {[demo[4].english, demo[2].english, demo[6].english, demo[8].english].map((o, k) => (
                  <li key={o} className={`choice-demo__opt ${k === 0 ? 'choice-demo__opt--right' : ''}`}>
                    <kbd>{k + 1}</kbd>{o}{k === 0 && <Check />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="path__pane">
            <div className="typing-demo">
              <p className="ko">{demo[0].korean}</p>
              <div className="typing-demo__field">
                <span className="typing-demo__typed">dining out</span>
                <span className="typing-demo__ok"><Check /></span>
              </div>
              <small>Type the meaning, press Enter</small>
            </div>
          </div>
          <div className="path__pane">
            <div className="listen-demo">
              <span className="listen-demo__play"><Speaker width={36} height={36} /></span>
              <div className="listen-demo__wave">{Array.from({ length: 24 }, (_, k) => <i key={k} style={{ animationDelay: `${(k % 8) * 0.09}s` }} />)}</div>
              <small>What did you hear?</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Course preview ---------------- */

function CoursePreview() {
  const picks = days.filter((d) => d.cover).slice(0, 6);
  return (
    <section className="preview wrap" aria-labelledby="preview-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">The course</p>
          <h2 className="h2" id="preview-title">{days.length} themed days, from dinner plans to job interviews.</h2>
        </div>
        <TLink className="btn btn--ghost" to="/course">See all {days.length} days <ArrowRight /></TLink>
      </div>
      <RevealGroup as="ul" className="preview__grid" stagger={0.07}>
        {picks.map((d) => (
          <li key={d.id}>
            <TLink className="preview__card" to={`/day/${d.number}`} ko={d.titleKo} en={`Day ${pad(d.number)}`}>
              <span className="preview__img"><img src={asset(d.cover)} alt="" loading="lazy" width="1600" height="1000" /></span>
              <span className="preview__meta">
                <span className="badge">Day {pad(d.number)}</span>
                <span className="ko preview__ko" lang="ko">{d.titleKo}</span>
                <span className="muted">{d.title}</span>
              </span>
            </TLink>
          </li>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ---------------- Review explainer ---------------- */

function Review() {
  return (
    <section className="review-band" aria-labelledby="review-title">
      <div className="wrap review-band__grid">
        <div>
          <p className="eyebrow eyebrow--light">Spaced review · 복습</p>
          <RevealText as="h2" className="h2" id="review-title">Missed words come back right before you forget them.</RevealText>
          <p className="lede">Every answer moves a word between five review boxes. You only see what is due, so a daily session stays short.</p>
          <TLink className="btn btn--lg btn--accent" to="/day/1" ko={days[0].titleKo} en="Day 01">Start Day 01 <ArrowRight /></TLink>
        </div>
        <RevealGroup as="ol" className="boxes">
          {[
            ['Missed', 'tomorrow'],
            ['Right once', 'in 3 days'],
            ['Right twice', 'in a week'],
            ['Right again', 'in 16 days'],
          ].map(([a, b], k) => (
            <li key={a}>
              <span className="boxes__n num">{k + 1}</span>
              <b>{a}</b>
              <span>comes back {b}</span>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
