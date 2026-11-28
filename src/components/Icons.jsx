import { MARK_PATHS } from '../data/brand.js';

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const ArrowRight = (p) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowLeft = (p) => (
  <svg {...base} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const Speaker = (p) => (
  <svg {...base} {...p}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>
);
export const Close = (p) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Check = (p) => (
  <svg {...base} {...p}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
export const Moon = (p) => (
  <svg {...base} {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>
);
export const Sun = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const Today = (p) => (
  <svg {...base} {...p}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" /></svg>
);
export const Course = (p) => (
  <svg {...base} {...p}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" /></svg>
);
export const Repeat = (p) => (
  <svg {...base} {...p}><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" /></svg>
);
export const Chart = (p) => (
  <svg {...base} {...p}><path d="M4 20h16M7 16v-5M12 16V7M17 16v-8" /></svg>
);
export const Flame = (p) => (
  <svg {...base} {...p}><path d="M12 21c4 0 7-2.7 7-6.6 0-3.6-2.6-5.6-3.9-8.4-.4 2-1.4 3.3-2.6 3.9C12.7 7 11 4.6 9 3c.3 3-2.5 5.2-3.6 7.7C3.9 14.4 6.5 21 12 21z" /></svg>
);
export const SoundOn = (p) => (
  <svg {...base} {...p}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /></svg>
);
export const SoundOff = (p) => (
  <svg {...base} {...p}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="m17 9.5 5 5M22 9.5l-5 5" /></svg>
);
export const Play = (p) => (
  <svg {...base} {...p}><path d="M7 5v14l12-7z" fill="currentColor" stroke="none" /></svg>
);
export const Download = (p) => (
  <svg {...base} {...p}><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" /></svg>
);
export const Share = (p) => (
  <svg {...base} {...p}><path d="M12 3.5v11M8 7l4-3.5L16 7M7 11H5.5v9.5h13V11H17" /></svg>
);

/** The Inkday mark in the current theme's accent colours. */
export const Logo = (p) => (
  <svg width="32" height="32" viewBox="0 0 512 512" aria-hidden="true" {...p}>
    <rect width="512" height="512" rx="112" fill="var(--accent)" />
    {MARK_PATHS.map((d) => <path key={d} d={d} fill="var(--accent-ink)" />)}
  </svg>
);
