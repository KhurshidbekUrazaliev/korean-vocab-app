import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TLink } from './Motion.jsx';
import { SpeakButton } from './SpeakButton.jsx';
import { ArrowRight, Check, Close, Speaker } from './Icons.jsx';
import { buildMultipleChoice, checkTyped } from '../lib/quiz.js';
import { shuffle } from '../lib/shuffle.js';
import { speak, canSpeak } from '../lib/speech.js';
import { progressStore } from '../hooks/useProgress.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/practice.css';

export const MODE_TITLES = { flashcards: 'Flashcards', choice: 'Multiple choice', typing: 'Typing', listening: 'Listening' };

/**
 * One practice run over `words`. `pool` supplies wrong options for quiz modes.
 * Every answer is written to the spaced-review schedule.
 */
export function Session({ words, pool = words, mode, dayId, exitTo, exitLabel, otherModes = [] }) {
  const [round, setRound] = useState(() => ({ queue: shuffle(words), id: 0 }));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [direction, setDirection] = useState('ko-en');
  const done = index >= round.queue.length;
  const word = round.queue[index];

  const answer = useCallback(
    (correct) => {
      progressStore.recordAnswer(word.id, correct);
      setResults((r) => [...r, { word, correct }]);
      setIndex((i) => i + 1);
    },
    [word],
  );

  useEffect(() => {
    if (done && results.length) {
      const score = results.filter((r) => r.correct).length;
      progressStore.recordSession(dayId, mode, score, results.length);
    }
    // Only when a round finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const restart = (list) => {
    setRound((r) => ({ queue: shuffle(list), id: r.id + 1 }));
    setIndex(0);
    setResults([]);
  };

  return (
    <div className="session">
      <div className="session__top wrap">
        <TLink to={exitTo} className="icon-btn" aria-label={exitLabel}>
          <Close />
        </TLink>
        <div className="session__progress" aria-hidden="true">
          {round.queue.map((w, k) => (
            <span key={`${round.id}-${k}`} data-state={k < results.length ? (results[k].correct ? 'good' : 'bad') : k === index ? 'now' : ''} />
          ))}
        </div>
        <p className="session__count" aria-live="polite">
          {done ? 'Finished' : `${index + 1} / ${round.queue.length}`}
          <span>{MODE_TITLES[mode]}</span>
        </p>
      </div>

      <div className="session__stage wrap">
        {done ? (
          <Results results={results} onRetry={restart} exitTo={exitTo} exitLabel={exitLabel} otherModes={otherModes} all={words} />
        ) : (
          <WordFrame key={`${round.id}-${index}`}>
            {mode === 'flashcards' && <Flashcard word={word} onAnswer={answer} />}
            {mode === 'choice' && (
              <Choice word={word} pool={pool} direction={direction} onAnswer={answer} onDirection={index === 0 ? setDirection : null} />
            )}
            {mode === 'typing' && <Typing word={word} onAnswer={answer} />}
            {mode === 'listening' && <Listening word={word} pool={pool} onAnswer={answer} />}
          </WordFrame>
        )}
      </div>
    </div>
  );
}

function WordFrame({ children }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(ref.current, { y: 48, opacity: 0, scale: 0.98, duration: 0.8 });
    },
    { scope: ref },
  );
  return (
    <div className="word-frame" ref={ref}>
      {children}
    </div>
  );
}

/** Keyboard shortcuts, ignored while typing in a field (except the ones we allow). */
function useKeys(map, deps) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const inField = e.target instanceof HTMLInputElement;
      const fn = map[e.key];
      if (!fn || (inField && e.key !== 'Enter')) return;
      if (e.target instanceof HTMLButtonElement && (e.key === ' ' || e.key === 'Enter') && !map.__ownsEnter) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const shake = (el) => !reducedMotion() && gsap.fromTo(el, { x: 0 }, { x: 0, keyframes: { x: [-10, 10, -6, 6, 0] }, duration: 0.45, ease: 'power1.out' });
const pop = (el) => !reducedMotion() && gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });

/* ---------------- Flashcards ---------------- */

function Flashcard({ word, onAnswer }) {
  const [flipped, setFlipped] = useState(false);
  const card = useRef(null);
  const leaving = useRef(false);

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next) speak(word.korean);
  };

  const decide = (knew) => {
    if (!flipped || leaving.current) return;
    leaving.current = true;
    if (reducedMotion()) return onAnswer(knew);
    gsap.to(card.current.parentElement, {
      x: knew ? 160 : -160,
      rotate: knew ? 6 : -6,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => onAnswer(knew),
    });
  };

  useKeys({ ' ': flip, Enter: flip, ArrowLeft: () => decide(false), '1': () => decide(false), ArrowRight: () => decide(true), '2': () => decide(true), __ownsEnter: true }, [flipped]);

  return (
    <div className="flash">
      <div className="flash__scene">
        <button
          type="button"
          className="flash__card"
          ref={card}
          data-flipped={flipped}
          onClick={flip}
          aria-label={flipped ? `${word.korean}: ${word.english}. Press to flip back.` : `${word.korean}. Press to see the meaning.`}
        >
          <span className="flash__face">
            <span className="flash__ko ko" lang="ko">{word.korean}</span>
            <span className="flash__hint">Say it out loud, then flip</span>
          </span>
          <span className="flash__face flash__face--back">
            <span className="flash__en">{word.english}</span>
            <span className="flash__rom">{word.korean} · {word.romanization}</span>
          </span>
        </button>
      </div>
      <div className="flash__actions">
        <SpeakButton text={word.korean} />
        {flipped ? (
          <>
            <button type="button" className="btn btn--ghost" onClick={() => decide(false)}>Not yet <kbd>1</kbd></button>
            <button type="button" className="btn" onClick={() => decide(true)}>I knew it <span className="btn__icon"><Check /></span></button>
          </>
        ) : (
          <button type="button" className="btn" onClick={flip}>Show meaning <span className="btn__icon"><ArrowRight /></span></button>
        )}
      </div>
      <p className="session__keys">Space flips · ← not yet · → knew it</p>
    </div>
  );
}

/* ---------------- Multiple choice (also used by Listening) ---------------- */

function Options({ q, picked, onPick }) {
  return (
    <ul className="options">
      {q.options.map((o, k) => {
        const state = picked == null ? '' : o.id === q.answerId ? 'right' : o.id === picked ? 'wrong' : 'dim';
        return (
          <li key={o.id}>
            <button
              type="button"
              className="option"
              data-state={state}
              disabled={picked != null}
              onClick={(e) => onPick(o.id, e.currentTarget)}
            >
              <kbd>{k + 1}</kbd>
              <span lang={/[가-힣]/.test(o.label) ? 'ko' : undefined} className={/[가-힣]/.test(o.label) ? 'ko' : ''}>{o.label}</span>
              {state === 'right' && <Check className="option__mark" />}
              {state === 'wrong' && <Close className="option__mark" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function useChoice(word, pool, direction, onAnswer) {
  const q = useMemo(() => buildMultipleChoice(word, pool, { direction }), [word, pool, direction]);
  const [picked, setPicked] = useState(null);
  const pick = (id, el) => {
    if (picked != null) return;
    setPicked(id);
    const right = id === q.answerId;
    const btn = el ?? document.querySelectorAll('.option')[q.options.findIndex((o) => o.id === id)];
    right ? pop(btn) : shake(btn);
  };
  const next = () => picked != null && onAnswer(picked === q.answerId);
  const keys = { Enter: next, __ownsEnter: true };
  q.options.forEach((o, k) => (keys[String(k + 1)] = () => pick(o.id)));
  useKeys(keys, [picked, q]);
  return { q, picked, pick, next };
}

function Feedback({ word, correct, onNext }) {
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="feedback" data-correct={correct} role="status">
      <p>
        <b>{correct ? 'Correct.' : 'Not quite.'}</b> <span className="ko" lang="ko">{word.korean}</span> ({word.romanization}) means “{word.english}”.
      </p>
      <button type="button" className="btn" onClick={onNext} ref={ref}>
        Next word <span className="btn__icon"><ArrowRight /></span>
      </button>
    </div>
  );
}

function Choice({ word, pool, direction, onAnswer, onDirection }) {
  const { q, picked, pick, next } = useChoice(word, pool, direction, onAnswer);
  return (
    <div className="quiz">
      {onDirection && (
        <div className="quiz__dir" role="group" aria-label="Question direction">
          <button type="button" aria-pressed={direction === 'ko-en'} onClick={() => onDirection('ko-en')}>Korean → English</button>
          <button type="button" aria-pressed={direction === 'en-ko'} onClick={() => onDirection('en-ko')}>English → Korean</button>
        </div>
      )}
      <p className="quiz__label">{direction === 'ko-en' ? 'What does this mean?' : 'Which word means this?'}</p>
      <h1 className={`quiz__prompt ${direction === 'ko-en' ? 'ko' : ''}`} lang={direction === 'ko-en' ? 'ko' : undefined}>{q.prompt}</h1>
      <Options q={q} picked={picked} onPick={pick} />
      {picked != null && <Feedback word={word} correct={picked === q.answerId} onNext={next} />}
      {picked == null && <p className="session__keys">Press 1–4 to answer · Enter for next</p>}
    </div>
  );
}

/* ---------------- Typing ---------------- */

function Typing({ word, onAnswer }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(false);
  const field = useRef(null);

  useEffect(() => field.current?.focus(), []);

  const submit = (e) => {
    e.preventDefault();
    if (result) return onAnswer(result.accepted);
    if (!value.trim()) return;
    const r = checkTyped(value, word, { direction: 'ko-en' });
    const accepted = r.correct || r.closeness >= 0.8;
    setResult({ ...r, accepted });
    if (!accepted) shake(field.current.parentElement);
    else pop(field.current.parentElement);
  };

  return (
    <form className="quiz" onSubmit={submit}>
      <p className="quiz__label">Type the meaning in English</p>
      <h1 className="quiz__prompt ko" lang="ko">{word.korean}</h1>
      <div className="type-field" data-state={result ? (result.correct ? 'right' : result.accepted ? 'close' : 'wrong') : ''}>
        <label className="visually-hidden" htmlFor="answer">Meaning of {word.korean}</label>
        <input
          id="answer"
          ref={field}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={!!result}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={hint ? `Starts with “${word.english[0]}”` : 'Your answer'}
        />
        <button type="submit" className="btn btn--sm">{result ? 'Next word' : 'Check'}</button>
      </div>
      {result ? (
        <div className="feedback" data-correct={result.accepted} role="status">
          <p>
            <b>{result.correct ? 'Correct.' : result.accepted ? 'Close enough, check the spelling.' : 'Not quite.'}</b>{' '}
            <span className="ko" lang="ko">{word.korean}</span> means “{word.english}”.
          </p>
        </div>
      ) : (
        <div className="quiz__aux">
          <button type="button" className="link-btn" onClick={() => setHint(true)} disabled={hint}>Show first letter</button>
          <SpeakButton text={word.korean} />
        </div>
      )}
      <p className="session__keys">Enter to check, Enter again for the next word</p>
    </form>
  );
}

/* ---------------- Listening ---------------- */

function Listening({ word, pool, onAnswer }) {
  const { q, picked, pick, next } = useChoice(word, pool, 'ko-en', onAnswer);
  const supported = canSpeak();
  const play = useCallback(() => speak(word.korean), [word]);
  useEffect(() => {
    const t = setTimeout(play, 350);
    return () => clearTimeout(t);
  }, [play]);
  useKeys({ r: play, R: play }, [play]);

  return (
    <div className="quiz">
      <p className="quiz__label">{supported ? 'Listen and pick the meaning' : 'Audio is not available in this browser, so here is the romanization'}</p>
      {supported ? (
        <button type="button" className="listen-btn" onClick={play} aria-label="Play the word again">
          <Speaker width={44} height={44} />
          <span className="listen-btn__ring" />
        </button>
      ) : (
        <h1 className="quiz__prompt">{word.romanization}</h1>
      )}
      {picked != null && <p className="quiz__reveal ko" lang="ko">{word.korean}</p>}
      <Options q={q} picked={picked} onPick={pick} />
      {picked != null && <Feedback word={word} correct={picked === q.answerId} onNext={next} />}
      {picked == null && <p className="session__keys">R to replay · 1–4 to answer</p>}
    </div>
  );
}

/* ---------------- Results ---------------- */

function Results({ results, onRetry, exitTo, exitLabel, otherModes, all }) {
  const ref = useRef(null);
  const score = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((score / total) * 100);
  const missed = results.filter((r) => !r.correct).map((r) => r.word);
  const C = 2 * Math.PI * 54;
  const verdict = pct === 100 ? 'Perfect round.' : pct >= 80 ? 'Strong round.' : pct >= 50 ? 'Getting there.' : 'A tough one. Run it again.';

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.timeline()
        .from('.results__ring circle:last-child', { strokeDashoffset: C, duration: 1.6 })
        .from('.results__pct', { textContent: 0, snap: { textContent: 1 }, duration: 1.6 }, 0)
        .from('.results > *:not(.results__score)', { y: 24, opacity: 0, stagger: 0.08 }, 0.3);
    },
    { scope: ref },
  );

  return (
    <div className="results" ref={ref}>
      <div className="results__score">
        <svg className="results__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" />
          <circle cx="60" cy="60" r="54" strokeDasharray={C} strokeDashoffset={C * (1 - score / total)} />
        </svg>
        <p><span className="results__pct">{pct}</span>%</p>
      </div>
      <h1 className="h2">{verdict}</h1>
      <p className="lede">{score} of {total} right. {missed.length ? 'Missed words are scheduled for review tomorrow.' : 'Every word moves up a review box.'}</p>
      {missed.length > 0 && (
        <ul className="results__missed">
          {missed.map((w) => (
            <li key={w.id}>
              <span className="ko" lang="ko">{w.korean}</span>
              <span>{w.english}</span>
              <SpeakButton text={w.korean} />
            </li>
          ))}
        </ul>
      )}
      <div className="results__actions">
        {missed.length > 0 ? (
          <button type="button" className="btn" onClick={() => onRetry(missed)}>
            Practice the {missed.length} missed {missed.length === 1 ? 'word' : 'words'}<span className="btn__icon"><ArrowRight /></span>
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => onRetry(all)}>
            Run it again<span className="btn__icon"><ArrowRight /></span>
          </button>
        )}
        {otherModes.map((m) => (
          <TLink key={m.to} className="btn btn--ghost" to={m.to}>{m.label}</TLink>
        ))}
        <TLink className="btn btn--ghost" to={exitTo}>{exitLabel}</TLink>
      </div>
    </div>
  );
}
