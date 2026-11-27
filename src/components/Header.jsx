import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { TLink } from './Motion.jsx';
import { Moon, Sun, Today, Course, Repeat, Chart, Flame } from './Icons.jsx';
import { useProgress } from '../hooks/useProgress.js';
import { getDueWords } from '../lib/srs.js';
import { getStreak } from '../lib/streak.js';
import { allWords } from '../data/index.js';

const TABS = [
  { to: '/', label: 'Today', Icon: Today, end: true },
  { to: '/course', label: 'Course', Icon: Course },
  { to: '/review', label: 'Review', Icon: Repeat, due: true },
  { to: '/progress', label: 'Progress', Icon: Chart },
];

export function Header({ theme, onToggleTheme }) {
  const progress = useProgress();
  const due = getDueWords(progress, allWords).length;
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
      <NavLink key={to} to={to} end={end}>
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
          <TLink to="/" ko="한국어 공부" en="Today" className="brand">
            <span className="seal" aria-hidden="true">한</span>
            <span className="brand__name">
              한국어 공부
              <span className="brand__sub">Essential Korean Vocabulary</span>
            </span>
          </TLink>
          <nav className="appnav" aria-label="Main">{links('nav')}</nav>
          <div className="appbar__end">
            {progress.activity.length > 0 && (
              <NavLink to="/progress" className="streak" data-on={practicedToday} aria-label={`${current} day streak`}>
                <Flame />
                <span className="num">{current}</span>
              </NavLink>
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
