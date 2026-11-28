import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { TLink } from './Motion.jsx';
import { Moon, Sun, Today, Course, Repeat, Chart, Flame } from './Icons.jsx';
import { useProgress } from '../hooks/useProgress.js';
import { useCourse } from '../hooks/useCourse.js';
import { profileStore, useProfile } from '../hooks/useProfile.js';
import { getDueWords } from '../lib/srs.js';
import { getStreak } from '../lib/streak.js';
import { COURSE_LIST, switchPath } from '../data/index.js';

const TABS = [
  { to: '/', label: 'Today', Icon: Today, end: true },
  { to: '/course', label: 'Course', Icon: Course },
  { to: '/review', label: 'Review', Icon: Repeat, due: true },
  { to: '/progress', label: 'Progress', Icon: Chart },
];

/** Korean | Arabic switch. Moves to the same page in the other course and remembers the choice. */
export function LanguageSwitch({ className = '' }) {
  const course = useCourse();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Course language">
      {COURSE_LIST.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-pressed={c.id === course.id}
          onClick={() => {
            if (c.id === course.id) return;
            profileStore.setCourse(c.id);
            navigate(switchPath(pathname, c));
          }}
        >
          <span lang={c.lang}>{c.nativeName}</span>
          <span className="visually-hidden"> ({c.name})</span>
        </button>
      ))}
    </div>
  );
}

export function Header({ theme, onToggleTheme }) {
  const progress = useProgress();
  const course = useCourse();
  const profile = useProfile();
  const due = getDueWords(progress, course.allWords).length;
  const { current, practicedToday } = getStreak(progress);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const links = (cls) =>
    TABS.map(({ to, label, Icon, end, due: showDue }) => (
      <NavLink key={to} to={course.path(to)} end={end}>
        {cls === 'tab' && <Icon />}
        <span>{label}</span>
        {showDue && due > 0 && (
          <span className="count">
            {due > 99 ? '99+' : due}
            <span className="visually-hidden"> due</span>
          </span>
        )}
      </NavLink>
    ));

  return (
    <>
      <header className="appbar" data-scrolled={scrolled}>
        <div className="wrap appbar__inner">
          <TLink to={course.path('/')} native={course.nativeName} en="Today" className="brand">
            <span className="seal" lang={course.lang} aria-hidden="true">{course.seal}</span>
            <span className="brand__name">
              Essential Vocabulary
              <span className="brand__sub">{course.name}</span>
            </span>
          </TLink>
          <nav className="appnav" aria-label="Main">{links('nav')}</nav>
          <div className="appbar__end">
            <LanguageSwitch />
            {progress.activity.length > 0 && (
              <NavLink to={course.path('/progress')} className="streak" data-on={practicedToday} aria-label={`${current} day streak`}>
                <Flame />
                <span className="num">{current}</span>
              </NavLink>
            )}
            {profile && (
              <TLink to="/welcome" className="avatar" title={`${profile.name}: edit profile`}>
                <span aria-hidden="true">{[...profile.name.trim()][0]?.toUpperCase() ?? '?'}</span>
                <span className="visually-hidden">Profile: {profile.name}</span>
              </TLink>
            )}
            <button
              type="button"
              className="icon-btn icon-btn--plain"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
            </button>
          </div>
        </div>
      </header>
      <nav className="tabbar" aria-label="Main">{links('tab')}</nav>
    </>
  );
}
