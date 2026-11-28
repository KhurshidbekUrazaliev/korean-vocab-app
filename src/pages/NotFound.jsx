import { TLink } from '../components/Motion.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import { useCourse } from '../hooks/useCourse.js';

const LOST = {
  ko: { phrase: '길을 잃었어요', word: '길을 잃다', rom: 'gireul ilda' },
  ar: { phrase: 'ضَلَلْتُ الطَّرِيق', word: 'ضَلَّ الطَّرِيق', rom: 'dalla at-tariiq' },
};

export default function NotFound() {
  const course = useCourse();
  const lost = LOST[course.id];
  return (
    <section className="not-found wrap">
      <p className="not-found__code" lang={course.lang} dir={course.dir} aria-hidden="true">{lost.phrase}</p>
      <h1 className="h2">This page doesn’t exist.</h1>
      <p className="lede">
        <span lang={course.lang} dir={course.dir}>{lost.word}</span> ({lost.rom}) means “to lose your way”. The link may be old, or the day isn’t published yet.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <TLink className="btn btn--lg btn--accent" to={course.path('/')} native={course.nativeName} en="Today">Go to Today <ArrowRight /></TLink>
        <TLink className="btn btn--lg btn--ghost" to={course.path('/course')}>Open the course</TLink>
      </div>
    </section>
  );
}
