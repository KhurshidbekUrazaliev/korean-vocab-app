import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '../components/Icons.jsx';
import { COURSES, COURSE_LIST } from '../data/index.js';
import { BRAND } from '../data/brand.js';
import { GOALS, profileStore, useProfile } from '../hooks/useProfile.js';
import { useCourse } from '../hooks/useCourse.js';
import Landing from './Landing.jsx';

const GOAL_LABEL = { 10: 'Casual', 20: 'Regular', 30: 'Serious' };
const SAMPLE = { ko: '안녕하세요', ar: 'مَرْحَبًا' };

/**
 * Sign-in: a name, a language and a daily goal, saved on this device. No server, no password.
 * New visitors see this at / and /ar. Signed-in learners reach it from their avatar to edit.
 * The language follows the URL (/ar/welcome is Arabic) or, at /welcome, the saved profile.
 */
export default function Welcome() {
  const profile = useProfile();
  const navigate = useNavigate();
  const routeCourse = useCourse();
  const [name, setName] = useState(profile?.name ?? '');
  const [courseId, setCourseId] = useState(routeCourse.id);
  useEffect(() => {
    setCourseId(routeCourse.id);
  }, [routeCourse.id]);
  const [goal, setGoal] = useState(profile?.goal ?? 20);
  const [error, setError] = useState('');
  const ids = { name: useId(), error: useId() };
  const course = COURSES[courseId];

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a name so we know what to call you.');
      document.getElementById(ids.name)?.focus();
      return;
    }
    profileStore.save({ name, course: courseId, goal });
    navigate(course.path('/'));
  };

  const copy = (
    <div className="hero__copy signin">
      <p className="eyebrow">{BRAND}</p>
      <h1 className="display signin__title">{profile ? 'Your profile.' : 'Ten words a day, in the language you choose.'}</h1>
      <form className="signin__form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor={ids.name}>Your name</label>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="given-name"
            maxLength={40}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? ids.error : undefined}
            required
          />
          {error && (
            <p className="field__error" id={ids.error} role="alert">
              {error}
            </p>
          )}
        </div>

        <fieldset className="choice-group">
          <legend>I want to learn</legend>
          <div className="lang-cards">
            {COURSE_LIST.map((c) => (
              <label className="lang-card" key={c.id} data-checked={c.id === courseId}>
                <input type="radio" name="course" value={c.id} checked={c.id === courseId} onChange={() => setCourseId(c.id)} />
                <span className="lang-card__native ko" lang={c.lang} dir={c.dir}>{SAMPLE[c.id]}</span>
                <span className="lang-card__name">
                  {c.name} <span className="muted" lang={c.lang}>{c.nativeName}</span>
                </span>
                <span className="muted lang-card__meta">{c.days.length} days · {c.allWords.length} words</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="choice-group">
          <legend>Daily goal</legend>
          <div className="goal-pick">
            {GOALS.map((g) => (
              <label key={g} data-checked={g === goal}>
                <input type="radio" name="goal" value={g} checked={g === goal} onChange={() => setGoal(g)} />
                <b>{GOAL_LABEL[g]}</b>
                <span>{g} answers</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn btn--lg btn--accent signin__submit">
          {profile ? 'Save profile' : `Start learning ${course.name}`} <ArrowRight />
        </button>
        <p className="muted signin__note">No password and no email. Your profile and progress are saved on this device only.</p>
      </form>
    </div>
  );

  return <Landing course={course} copy={copy} />;
}
