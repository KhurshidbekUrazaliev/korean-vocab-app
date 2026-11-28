import { useParams } from 'react-router-dom';
import { Session } from '../components/Session.jsx';
import { pad } from '../data/index.js';
import { useCourse } from '../hooks/useCourse.js';
import { MODE_ORDER, MODE_TITLES } from '../lib/stats.js';
import NotFound from './NotFound.jsx';

export default function Practice() {
  const { n, mode } = useParams();
  const course = useCourse();
  const day = course.getDay(n);
  if (!day || !Object.hasOwn(MODE_TITLES, mode)) return <NotFound />;

  // After a round, suggest the next step of the lesson, then the next day.
  const step = MODE_ORDER.indexOf(mode);
  const nextDay = course.getDay(day.number + 1);
  const next =
    step >= 0 && step < MODE_ORDER.length - 1
      ? { to: course.path(`/day/${day.number}/practice/${MODE_ORDER[step + 1]}`), label: `Next: ${MODE_TITLES[MODE_ORDER[step + 1]]}`, native: day.titleNative }
      : nextDay
        ? { to: course.path(`/day/${nextDay.number}`), label: `Next: Day ${pad(nextDay.number)}`, native: nextDay.titleNative }
        : { to: course.path('/review'), label: 'Review due words', native: course.reviewNative };

  return (
    <Session
      key={`${day.id}-${mode}`}
      words={day.words}
      mode={mode}
      dayId={day.id}
      title={`Day ${pad(day.number)} · ${day.title}`}
      exitTo={course.path(`/day/${day.number}`)}
      exitLabel={`Back to Day ${pad(day.number)}`}
      next={next}
    />
  );
}
