import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { TLink } from './Motion.jsx';
import { Moon, Sun } from './Icons.jsx';
import { useProgress } from '../hooks/useProgress.js';
import { getDueWords } from '../lib/srs.js';
import { allWords } from '../data/index.js';
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '../lib/motion.js';

export function Header({ theme, onToggleTheme }) {
  const ref = useRef(null);
  const progress = useProgress();
  const due = getDueWords(progress, allWords).length;

  // Slide away while scrolling down, come back on scroll up.
  useGSAP(() => {
    if (reducedMotion()) return;
    const hide = gsap.to(ref.current, { yPercent: -140, duration: 0.5, paused: true, ease: 'power3.out' });
    ScrollTrigger.create({
      start: 120,
      end: 'max',
      onUpdate: (self) => (self.direction === 1 ? hide.play() : hide.reverse()),
      onLeaveBack: () => hide.reverse(),
    });
  });

  return (
    <header className="site-header" ref={ref}>
      <div className="wrap site-header__bar">
        <TLink to="/" ko="한국어 공부" en="Home" className="brand" aria-label="Essential Korean Vocabulary, home">
          <span className="brand__mark" aria-hidden="true">한</span>
          <span className="brand__name">
            한국어 공부
            <small>Essential Korean Vocabulary</small>
          </span>
        </TLink>
        <nav className="nav" aria-label="Main">
          <TLink to="/#days">Days</TLink>
          <NavLink to="/review" aria-label={due ? `Review, ${due} words due` : 'Review'}>
            Review {due > 0 && <span className="nav__count" aria-hidden="true">{due}</span>}
          </NavLink>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
