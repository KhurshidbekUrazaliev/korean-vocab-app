import { useRef } from 'react';
import { TLink } from './Motion.jsx';
import { days } from '../data/index.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';

export function Footer() {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from('.footer__wordmark span', {
        yPercent: 100,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
      });
    },
    { scope: ref },
  );

  return (
    <footer className="site-footer" ref={ref}>
      <div className="wrap">
        <div className="footer__grid">
          <h2>Ten words a day. Real practice, not just reading.</h2>
          <div>
            <h3>Practice</h3>
            <ul>
              <li><TLink to="/#days">All {days.length} days</TLink></li>
              <li><TLink to="/review" ko="복습" en="Review">Review due words</TLink></li>
              <li><TLink to="/day/1" ko={days[0].titleKo} en="Day 01">Start Day 01</TLink></li>
            </ul>
          </div>
          <div>
            <h3>About</h3>
            <ul>
              <li><TLink to="/privacy">Privacy</TLink></li>
              <li><TLink to="/terms">Terms</TLink></li>
              <li><a href="https://github.com/KhurshidbekUrazaliev/korean-vocab-app">Source on GitHub</a></li>
            </ul>
          </div>
        </div>
        <p className="footer__wordmark" aria-hidden="true">
          {'한국어 공부'.split('').map((c, i) => (
            <span key={i}>{c === ' ' ? ' ' : c}</span>
          ))}
        </p>
        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Essential Korean Vocabulary</span>
          <span>Progress is saved in this browser only.</span>
        </div>
      </div>
    </footer>
  );
}
