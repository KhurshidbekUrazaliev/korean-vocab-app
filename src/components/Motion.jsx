import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reducedMotion } from '../lib/motion.js';

const MotionContext = createContext(null);
export const useMotion = () => useContext(MotionContext);

/** Smooth scrolling (Lenis, synced with ScrollTrigger) and the route-change curtain. */
export function MotionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lenisRef = useRef(null);
  const curtainRef = useRef(null);
  const busy = useRef(false);
  const [label, setLabel] = useState({ native: '', en: '' });

  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // After each route change: go to the hash target or the top, then refresh triggers.
  useEffect(() => {
    const id = location.hash.slice(1);
    const scroll = () => {
      const el = id && document.getElementById(id);
      if (lenisRef.current) lenisRef.current.scrollTo(el || 0, { immediate: true, offset: el ? -24 : 0 });
      else if (el) el.scrollIntoView();
      else window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    };
    const raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.hash]);

  const go = useCallback(
    (to, next = { native: '', en: '' }) => {
      if (busy.current) return;
      if (reducedMotion() || !curtainRef.current) return navigate(to);
      busy.current = true;
      setLabel(next);
      const el = curtainRef.current;
      gsap
        .timeline({ onComplete: () => (busy.current = false) })
        .set(el, { yPercent: 100, autoAlpha: 1 })
        .to(el, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
        .fromTo(el.firstChild, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5 }, '-=0.25')
        .add(() => navigate(to))
        .to(el.firstChild, { yPercent: -30, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.15')
        .to(el, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '-=0.2')
        .set(el, { yPercent: 100, autoAlpha: 0 });
    },
    [navigate],
  );

  return (
    <MotionContext.Provider value={{ go, lenis: lenisRef }}>
      {children}
      <div className="curtain" ref={curtainRef} aria-hidden="true">
        <div className="curtain__word">
          {label.native && <span lang={/[\u0600-\u06FF]/.test(label.native) ? 'ar' : 'ko'}>{label.native}</span>}
          {label.en && <small>{label.en}</small>}
        </div>
      </div>
    </MotionContext.Provider>
  );
}

/** A real <a href> link that plays the curtain on plain left clicks. */
export function TLink({ to, native, en, onClick, ...props }) {
  const { go } = useMotion();
  const location = useLocation();
  return (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const [path] = String(to).split('#');
        if (path === location.pathname || (path === '' && String(to).startsWith('#'))) return; // same page: let Lenis handle the anchor
        e.preventDefault();
        go(to, { native, en });
      }}
      {...props}
    />
  );
}
