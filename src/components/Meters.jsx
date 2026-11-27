/** Circular progress ring. value 0..1 */
export function Ring({ value, size = 44, stroke = 4, label, children, tone = 'accent' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={`ring ring--${tone}`} style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="ring__track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="ring__value"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
        />
      </svg>
      {children != null && <span className="ring__label">{children}</span>}
    </span>
  );
}

/** Five small bars showing a word's review box (0 = new, 5 = long-term). */
export function Mastery({ level, label = true }) {
  const names = ['New', 'Learning', 'Learning', 'Familiar', 'Strong', 'Mastered'];
  return (
    <span className="mastery" data-level={level} title={names[level]} aria-label={`Mastery: ${names[level]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} data-on={i <= level} />
      ))}
      {label && <span className="mastery__name">{level > 0 ? names[level] : ''}</span>}
    </span>
  );
}
