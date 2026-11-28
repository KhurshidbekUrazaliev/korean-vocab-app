import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TLink } from './Motion.jsx';
import { SpeakButton } from './SpeakButton.jsx';
import { ArrowRight, Check, Close, Speaker, SoundOn, SoundOff } from './Icons.jsx';
import { buildMultipleChoice, checkTyped } from '../lib/quiz.js';
import { buildMatchRound, isPair } from '../lib/match.js';
import { shuffle } from '../lib/shuffle.js';
import { speak, canSpeak, warm } from '../lib/speech.js';
import { feedback, soundOn, setSound } from '../lib/sound.js';
import { progressStore } from '../hooks/useProgress.js';
import { MODE_TITLES } from '../lib/stats.js';
import { useCourse } from '../hooks/useCourse.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import '../styles/practice.css';

export { MODE_TITLES };

/**
 * One practice run over `words`. `pool` supplies wrong options for quiz modes.
 * Every answer is written to the spaced-review schedule.
 * `next` ({ to, label, ko }) is the suggested step after the round.
 */
export function Session({ words, pool = words, mode, dayId, title, exitTo, exitLabel, next }) {
  const [round, setRound] = useState(() => ({ queue: shuffle(words), id: 0, startedAt: Date.now(), full: true }));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [direction, setDirection] = useState('ko-en');
  const [run, setRun] = useState({ now: 0, best: 0 });
  const [sound, setSoundState] = useState(soundOn);
  const done = index >= round.queue.length;
  const word = round.queue[index];
  const before = useRef({});

  const answer = useCallback(
    (correct, w = word) => {
      if (Object.hasOwn(before.current, w.id)) return;
      before.current[w.id] = progressStore.get().words[w.id]?.box ?? 0;
      progressStore.recordAnswer(w.id, correct);
      const graded = [...results, { word: w, correct }];
      setResults(graded);
      if (round.full && graded.length === round.queue.length) {
        progressStore.recordSession(dayId, mode, graded.filter((r) => r.correct).length, graded.length);
      }
      setRun((r) => {
        const now = correct ? r.now + 1 : 0;
        return { now, best: Math.max(r.best, now) };
      });
    },
    [word, results, round, dayId, mode],
  );
  const nextWord = () => setIndex(index + 1);

  useEffect(() => {
    if (done) feedback('done');
  }, [done]);

  const restart = (missed) => {
    setRound((r) => ({ queue: shuffle(missed ?? words), id: r.id + 1, startedAt: Date.now(), full: !missed }));
    setIndex(0);
    setResults([]);
    setRun({ now: 0, best: 0 });
    before.current = {};
  };

  const toggleSound = () => {
    setSound(!sound);
    setSoundState(!sound);
  };

  const pct = (Math.min(index, round.queue.length) / round.queue.length) * 100;

  return (
    <div className="session">
      <div className="session__top">
        <div className="wrap session__bar">
          <TLink to={exitTo} className="icon-btn" aria-label={exitLabel}>
            <Close />
          </TLink>
          <div className="session__title">
            <b>{title}</b>
            <span>{MODE_TITLES[mode]}</span>
          </div>
          <div className="session__end">
            {run.now >= 3 && !done && (
              <span className="combo" key={run.now} aria-live="polite">
                <b className="num">{run.now}</b> in a row
              </span>
            )}
            <span className="session__count num" aria-live="polite">{done ? 'Done' : `${index + 1}/${round.queue.length}`}</span>
            <button type="button" className="icon-btn icon-btn--plain" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? 'Turn sound effects off' : 'Turn sound effects on'}>
              {sound ? <SoundOn width={18} height={18} /> : <SoundOff width={18} height={18} />}
            </button>
          </div>
        </div>
        <div className="session__progress" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="session__stage wrap">
        {done ? (
          <Results
            results={results}
            before={before.current}
            seconds={Math.round((Date.now() - round.startedAt) / 1000)}
            bestRun={run.best}
            onRetry={restart}
            exitTo={exitTo}
            exitLabel={exitLabel}
            next={next}
          />
        ) : (
          <WordFrame key={`${round.id}-${index}`}>
            {mode === 'flashcards' && <Flashcard word={word} onAnswer={answer} onNext={nextWord} left={round.queue.length - index - 1} />}
            {mode === 'choice' && <Choice word={word} pool={pool} direction={direction} onAnswer={answer} onNext={nextWord} onDirection={index === 0 ? setDirection : null} />}
            {mode === 'typing' && <Typing word={word} onAnswer={answer} onNext={nextWord} />}
            {mode === 'listening' && <Listening word={word} pool={pool} onAnswer={answer} onNext={nextWord} />}
            {mode === 'match' && (
              <MatchBoard
                words={round.queue.slice(index, index + MATCH_PAIRS)}
                onAnswer={(w, correct) => answer(correct, w)}
                onDone={() => setIndex(index + MATCH_PAIRS)}
              />
            )}
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
      gsap.from(ref.current, { y: 36, opacity: 0, duration: 0.7 });
    },
    { scope: ref },
  );
  return (
    <div className="word-frame" ref={ref}>
      {children}
    </div>
  );
}

/** Keyboard shortcuts, ignored while typing in a field (except Enter). */
function useKeys(map, deps) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const inField = e.target instanceof HTMLInputElement;
      const fn = map[e.key];
      if (!fn || (inField && e.key !== 'Enter')) return;
      // A focused button or link activates itself; shortcuts only apply elsewhere.
      if ((e.key === ' ' || e.key === 'Enter') && e.target instanceof Element && e.target.closest('button, a')) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const shake = (el) => el && !reducedMotion() && gsap.fromTo(el, { x: 0 }, { x: 0, keyframes: { x: [-9, 9, -5, 5, 0] }, duration: 0.45, ease: 'power1.out' });
const pop = (el) => el && !reducedMotion() && gsap.fromTo(el, { scale: 0.97 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });

/* ---------------- Flashcards ---------------- */

function Flashcard({ word, onAnswer, onNext, left }) {
  const [flipped, setFlipped] = useState(false);
  const scene = useRef(null);
  const leaving = useRef(false);
  useEffect(() => warm(word.term), [word]);

  const flip = () => {
    const nextFlip = !flipped;
    setFlipped(nextFlip);
    if (nextFlip) speak(word.term);
  };

  const decide = (knew) => {
    if (!flipped || leaving.current) return;
    leaving.current = true;
    onAnswer(knew);
    feedback(knew ? 'right' : 'wrong');
    if (reducedMotion()) return onNext();
    gsap.to(scene.current.querySelector('.flash__card'), {
      x: knew ? 180 : -180,
      rotate: knew ? 8 : -8,
      opacity: 0,
      duration: 0.38,
      ease: 'power2.in',
      onComplete: onNext,
    });
  };

  useKeys({ ' ': flip, Enter: flip, ArrowLeft: () => decide(false), '1': () => decide(false), ArrowRight: () => decide(true), '2': () => decide(true) }, [flipped]);

  return (
    <div className="flash">
      <h1 className="visually-hidden">Flashcard: say the word, then flip to check</h1>
      <div className="flash__scene" ref={scene} data-left={Math.min(left, 2)}>
        <button
          type="button"
          className="flash__card"
          data-flipped={flipped}
          onClick={flip}
          aria-pressed={flipped}
        >
          <span className="flash__face" aria-hidden={flipped}>
            <span className="flash__ko ko" {...langOf(word)}>{word.term}</span>
            <span className="flash__hint">Say it out loud, then flip</span>
          </span>
          <span className="flash__face flash__face--back" aria-hidden={!flipped}>
            <span className="flash__en">{word.english}</span>
            <span className="flash__rom"><span className="ko" {...langOf(word)}>{word.term}</span> · {word.romanization}</span>
          </span>
        </button>
      </div>
      <div className="flash__actions">
        <SpeakButton text={word.term} />
        {flipped ? (
          <>
            <button type="button" className="btn btn--lg btn--ghost" onClick={() => decide(false)}>Not yet <kbd>1</kbd></button>
            <button type="button" className="btn btn--lg" onClick={() => decide(true)}>I knew it <kbd>2</kbd></button>
          </>
        ) : (
          <button type="button" className="btn btn--lg" onClick={flip}>Show meaning <kbd>Space</kbd></button>
        )}
      </div>
    </div>
  );
}

/** Language attributes for a word's term: Arabic ids start with "ar-". */
const langOf = (word) => (word.id.startsWith('ar-') ? { lang: 'ar', dir: 'rtl' } : { lang: 'ko' });

/* ---------------- Multiple choice (also used by Listening) ---------------- */

function Options({ q, picked, onPick }) {
  const course = useCourse();
  return (
    <ul className="options">
      {q.options.map((o, k) => {
        const state = picked == null ? '' : o.id === q.answerId ? 'right' : o.id === picked ? 'wrong' : 'dim';
        const native = /[\u0600-\u06FF가-힣]/.test(o.label);
        return (
          <li key={o.id}>
            <button type="button" className="option" data-state={state} disabled={picked != null} onClick={(e) => onPick(o.id, e.currentTarget)}>
              <kbd>{k + 1}</kbd>
              <span lang={native ? course.lang : undefined} dir={native ? course.dir : undefined} className={native ? 'ko option__ko' : ''}>{o.label}</span>
              {state === 'right' && <Check className="option__mark" />}
              {state === 'wrong' && <Close className="option__mark" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function useChoice(word, pool, direction, onAnswer, onNext) {
  const q = useMemo(() => buildMultipleChoice(word, pool, { direction }), [word, pool, direction]);
  const [picked, setPicked] = useState(null);
  const pick = (id, el) => {
    if (picked != null) return;
    setPicked(id);
    const right = id === q.answerId;
    onAnswer(right);
    feedback(right ? 'right' : 'wrong');
    const btn = el ?? document.querySelectorAll('.option')[q.options.findIndex((o) => o.id === id)];
    right ? pop(btn) : shake(btn);
  };
  const next = () => picked != null && onNext();
  const keys = { Enter: next };
  q.options.forEach((o, k) => (keys[String(k + 1)] = () => pick(o.id)));
  useKeys(keys, [picked, q]);
  return { q, picked, pick, next };
}

function Feedback({ word, correct, onNext }) {
  const ref = useRef(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return (
    <div className="feedback" data-correct={correct} role="status">
      <span className="feedback__icon">{correct ? <Check /> : <Close />}</span>
      <p>
        <b>{correct ? 'Correct' : 'Not quite'}</b>
        <span>
          <span className="ko" {...langOf(word)}>{word.term}</span> · {word.romanization} · {word.english}
        </span>
      </p>
      <button type="button" className="btn" onClick={onNext} ref={ref}>
        Next <kbd>Enter</kbd>
      </button>
    </div>
  );
}

function Choice({ word, pool, direction, onAnswer, onNext, onDirection }) {
  const { q, picked, pick, next } = useChoice(word, pool, direction, onAnswer, onNext);
  const course = useCourse();
  const koPrompt = direction === 'ko-en';
  return (
    <div className="quiz">
      {onDirection && (
        <div className="seg" role="group" aria-label="Question direction">
          <button type="button" aria-pressed={direction === 'ko-en'} onClick={() => onDirection('ko-en')}><span lang={course.lang}>{course.nativeName}</span> → English</button>
          <button type="button" aria-pressed={direction === 'en-ko'} onClick={() => onDirection('en-ko')}>English → <span lang={course.lang}>{course.nativeName}</span></button>
        </div>
      )}
      <p className="quiz__label">{koPrompt ? 'What does this mean?' : 'Which word means this?'}</p>
      <h1 className={`quiz__prompt ${koPrompt ? 'ko' : ''}`} {...(koPrompt ? langOf(word) : {})}>{q.prompt}</h1>
      <Options q={q} picked={picked} onPick={pick} />
      {picked != null && <Feedback word={word} correct={picked === q.answerId} onNext={next} />}
    </div>
  );
}

/* ---------------- Typing ---------------- */

function Typing({ word, onAnswer, onNext }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(false);
  const field = useRef(null);

  useEffect(() => field.current?.focus({ preventScroll: true }), []);

  const submit = (e) => {
    e.preventDefault();
    if (result) return onNext();
    if (!value.trim()) return;
    const r = checkTyped(value, word, { direction: 'ko-en' });
    const accepted = r.correct || r.closeness >= 0.8;
    onAnswer(accepted);
    setResult({ ...r, accepted });
    feedback(accepted ? 'right' : 'wrong');
    if (!accepted) shake(field.current.parentElement);
    else pop(field.current.parentElement);
  };

  return (
    <form className="quiz" onSubmit={submit}>
      <p className="quiz__label">Type the meaning in English</p>
      <h1 className="quiz__prompt ko" {...langOf(word)}>{word.term}</h1>
      <div className="type-field" data-state={result ? (result.correct ? 'right' : result.accepted ? 'close' : 'wrong') : ''}>
        <label className="visually-hidden" htmlFor="answer">Meaning of {word.term}</label>
        <input
          id="answer"
          ref={field}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={!!result}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          enterKeyHint={result ? 'next' : 'done'}
          placeholder={hint ? `Starts with “${word.english[0]}”` : 'Your answer'}
        />
        <button type="submit" className="btn">{result ? 'Next' : 'Check'}</button>
      </div>
      {result ? (
        <div className="feedback" data-correct={result.accepted} role="status">
          <span className="feedback__icon">{result.accepted ? <Check /> : <Close />}</span>
          <p>
            <b>{result.correct ? 'Correct' : result.accepted ? 'Close enough, check the spelling' : 'Not quite'}</b>
            <span><span className="ko" {...langOf(word)}>{word.term}</span> means “{word.english}”</span>
          </p>
        </div>
      ) : (
        <div className="quiz__aux">
          <button type="button" className="link-btn" onClick={() => setHint(true)} disabled={hint}>Show first letter</button>
          <SpeakButton text={word.term} />
        </div>
      )}
    </form>
  );
}

/* ---------------- Listening ---------------- */

function Listening({ word, pool, onAnswer, onNext }) {
  const { q, picked, pick, next } = useChoice(word, pool, 'ko-en', onAnswer, onNext);
  const supported = canSpeak();
  const [playing, setPlaying] = useState(false);
  const play = useCallback(() => {
    if (speak(word.term)) {
      setPlaying(true);
      setTimeout(() => setPlaying(false), 1100);
    }
  }, [word]);
  useEffect(() => {
    const t = setTimeout(play, 350);
    return () => clearTimeout(t);
  }, [play]);
  useKeys({ r: play, R: play }, [play]);

  return (
    <div className="quiz">
      {supported ? (
        <h1 className="quiz__label">Listen and pick the meaning</h1>
      ) : (
        <p className="quiz__label">Audio is not available in this browser, so here is the romanization</p>
      )}
      {supported ? (
        <button type="button" className="listen-btn" data-playing={playing} onClick={play} aria-label="Play the word again">
          <Speaker width={40} height={40} />
          <span className="listen-btn__ring" />
          <span className="listen-btn__key">R</span>
        </button>
      ) : (
        <h1 className="quiz__prompt">{word.romanization}</h1>
      )}
      <p className="quiz__reveal ko" {...langOf(word)} data-shown={picked != null}>{picked != null ? word.term : ' '}</p>
      <Options q={q} picked={picked} onPick={pick} />
      {picked != null && <Feedback word={word} correct={picked === q.answerId} onNext={next} />}
    </div>
  );
}

/* ---------------- Match: pair each word with its meaning ---------------- */

const MATCH_PAIRS = 5;

function MatchBoard({ words, onAnswer, onDone }) {
  const board = useMemo(() => buildMatchRound(words, { pairs: words.length }), [words]);
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const [selected, setSelected] = useState(null); // { side: 'left' | 'right', id }
  const [matched, setMatched] = useState(() => new Set());
  const [wrong, setWrong] = useState(null);
  const [status, setStatus] = useState('');
  const missed = useRef(new Set());

  const pick = (side, id) => {
    if (matched.has(id)) return;
    if (side === 'left') speak(byId.get(id).term);
    if (!selected || selected.side === side) return setSelected({ side, id });
    const leftId = side === 'left' ? id : selected.id;
    const rightId = side === 'right' ? id : selected.id;
    setSelected(null);
    if (isPair(leftId, rightId)) {
      const w = byId.get(leftId);
      feedback('right');
      onAnswer(w, !missed.current.has(leftId));
      const next = new Set(matched).add(leftId);
      setMatched(next);
      setStatus(`Matched: ${w.term} means ${w.english}.`);
      if (next.size === board.left.length) setTimeout(onDone, reducedMotion() ? 0 : 500);
    } else {
      // A wrong pair counts against both words: each was confused with the other.
      feedback('wrong');
      missed.current.add(leftId).add(rightId);
      setWrong({ leftId, rightId });
      setStatus('Not a pair. Try again.');
      setTimeout(() => setWrong(null), 450);
    }
  };

  const card = (side, c) => {
    const done = matched.has(c.id);
    const isSelected = selected?.side === side && selected.id === c.id;
    const isWrong = wrong && (side === 'left' ? wrong.leftId : wrong.rightId) === c.id;
    return (
      <li key={c.id}>
        <button
          type="button"
          className="match__card"
          data-side={side}
          data-done={done}
          data-wrong={Boolean(isWrong)}
          aria-pressed={isSelected}
          disabled={done}
          onClick={() => pick(side, c.id)}
        >
          {side === 'left' ? <span className="ko" {...langOf(byId.get(c.id))}>{c.text}</span> : c.text}
        </button>
      </li>
    );
  };

  return (
    <div className="quiz match">
      <h1 className="quiz__label">Match each word with its meaning</h1>
      <div className="match__cols">
        <ul aria-label="Words">{board.left.map((c) => card('left', c))}</ul>
        <ul aria-label="Meanings">{board.right.map((c) => card('right', c))}</ul>
      </div>
      <p className="visually-hidden" role="status">{status}</p>
    </div>
  );
}

/* ---------------- Results ---------------- */

const VERDICTS = {
  ko: ['완벽해요!', '잘했어요!', '좋아요.', '다시 해 봐요.'],
  ar: ['مُمْتَاز!', 'رَائِع!', 'جَيِّد.', 'مَرَّةً أُخْرَى.'],
};

function Results({ results, before, seconds, bestRun, onRetry, exitTo, exitLabel, next }) {
  const ref = useRef(null);
  const score = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((score / total) * 100);
  const missed = results.filter((r) => !r.correct).map((r) => r.word);
  const after = progressStore.get().words;
  const movedUp = Object.keys(before).filter((id) => (after[id]?.box ?? 0) > Math.max(before[id], 1)).length;
  const C = 2 * Math.PI * 54;
  const course = useCourse();
  const tier = pct === 100 ? 0 : pct >= 80 ? 1 : pct >= 50 ? 2 : 3;
  const verdict = [VERDICTS[course.id][tier], ['Perfect round.', 'Strong round.', 'Getting there.', 'A tough one. Run it again.'][tier]];
  const time = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap
        .timeline()
        .from('.results__ring circle:last-child', { strokeDashoffset: C, duration: 1.6 })
        .from('.results__pct', { textContent: 0, snap: { textContent: 1 }, duration: 1.6 }, 0)
        .from('.results > *:not(.results__score)', { y: 20, opacity: 0, stagger: 0.07 }, 0.25);
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
        <p><span className="results__pct num">{pct}</span><small>%</small></p>
      </div>
      <h1 className="results__title">
        <span className="ko" lang={course.lang} dir={course.dir}>{verdict[0]}</span>
        <span>{verdict[1]}</span>
      </h1>
      <ul className="results__stats">
        <li><b className="num">{score}/{total}</b><span>correct</span></li>
        <li><b className="num">{time}</b><span>time</span></li>
        <li><b className="num">{bestRun}</b><span>best run</span></li>
        <li><b className="num">{movedUp}</b><span>moved up a box</span></li>
      </ul>
      {missed.length > 0 && (
        <div className="results__missed card">
          <p className="results__missed-head">Ready to review now</p>
          <ul>
            {missed.map((w) => (
              <li key={w.id}>
                <span className="ko" {...langOf(w)}>{w.term}</span>
                <span className="muted">{w.english}</span>
                <SpeakButton text={w.term} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="results__actions">
        {next && (
          <TLink className="btn btn--lg btn--accent" to={next.to} native={next.native} en={next.label}>
            {next.label} <ArrowRight />
          </TLink>
        )}
        {missed.length > 0 ? (
          <button type="button" className={`btn btn--lg ${next ? 'btn--ghost' : ''}`} onClick={() => onRetry(missed)}>
            Retry {missed.length} missed
          </button>
        ) : (
          <button type="button" className="btn btn--lg btn--ghost" onClick={() => onRetry()}>Run it again</button>
        )}
        <TLink className="link" to={exitTo}>{exitLabel}</TLink>
      </div>
    </div>
  );
}
