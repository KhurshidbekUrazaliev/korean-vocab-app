// The Inkday mark: a lowercase i whose dot is a single brush dot of ink.
// Drawn on a 512 grid. The app bar, the app icons and the sharing cards all draw from here.
export const BRAND = 'Inkday';

export const MARK_PATHS = [
  'M214 112C238 86 300 100 306 146C312 190 268 214 236 196C206 180 196 132 214 112Z',
  'M220 262L292 244V412Q292 428 276 428H236Q220 428 220 412Z',
];

/** The mark as standalone SVG markup, for image generation. `radius` is on the 512 grid; 0 is full bleed. */
export function markSvg({ size = 512, radius = 112, bg = '#a8322a', fg = '#fffaf3' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">`
    + `<rect width="512" height="512" rx="${radius}" fill="${bg}"/>`
    + MARK_PATHS.map((d) => `<path d="${d}" fill="${fg}"/>`).join('')
    + '</svg>';
}
