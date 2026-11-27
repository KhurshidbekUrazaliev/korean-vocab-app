import { useRef } from 'react';
import { gsap, SplitText, useGSAP, reducedMotion } from '../lib/motion.js';

/**
 * Splits text into masked lines that slide up. Plays on mount (hero) or when
 * scrolled into view. Renders plain text when motion is reduced.
 */
export function RevealText({ as: Tag = 'p', children, className, onScroll = true, delay = 0, ...rest }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(ref.current, { type: 'lines', mask: 'lines', linesClass: 'line' , autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.2,
            stagger: 0.09,
            delay,
            scrollTrigger: onScroll ? { trigger: ref.current, start: 'top 85%', once: true } : undefined,
          }),
      });
      return () => split.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/** Fades and lifts direct children into view, staggered. */
export function RevealGroup({ as: Tag = 'div', children, className, stagger = 0.08, y = 32, ...rest }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(ref.current.children, {
        y,
        opacity: 0,
        duration: 1,
        stagger,
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
