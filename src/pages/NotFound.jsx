import { TLink } from '../components/Motion.jsx';
import { ArrowRight } from '../components/Icons.jsx';

export default function NotFound() {
  return (
    <section className="not-found wrap">
      <p className="not-found__code" lang="ko" aria-hidden="true">길을 잃었어요</p>
      <h1 className="h2">This page doesn’t exist.</h1>
      <p className="lede">길을 잃다 (gireul ilda) means “to lose your way”. The link may be old, or the day isn’t published yet.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <TLink className="btn btn--lg btn--accent" to="/" ko="처음" en="Today">Go to Today <ArrowRight /></TLink>
        <TLink className="btn btn--lg btn--ghost" to="/course">Open the course</TLink>
      </div>
    </section>
  );
}
