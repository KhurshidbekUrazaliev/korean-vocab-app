import { TLink } from '../components/Motion.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { RevealText } from '../components/Reveal.jsx';

export default function NotFound() {
  return (
    <section className="not-found wrap">
      <title>Page not found | Essential Korean Vocabulary</title>
      <meta name="robots" content="noindex" />
      <p className="not-found__code" aria-hidden="true">404</p>
      <RevealText as="h1" className="h2" onScroll={false}>길을 잃었어요. This page doesn’t exist.</RevealText>
      <p className="lede">길을 잃다 (gireul ilda) means “to lose your way”. The link may be old, or the day isn’t published yet.</p>
      <div className="hero__ctas">
        <TLink className="btn" to="/" ko="처음" en="Home">Go to the home page<span className="btn__icon"><ArrowRight /></span></TLink>
        <TLink className="btn btn--ghost" to="/#days">See all days</TLink>
      </div>
    </section>
  );
}
