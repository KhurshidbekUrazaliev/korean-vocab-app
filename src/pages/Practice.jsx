import { useParams } from 'react-router-dom';
import { Session } from '../components/Session.jsx';
import { getDay, pad } from '../data/index.js';
import { MODE_ORDER, MODE_TITLES } from '../lib/stats.js';
import NotFound from './NotFound.jsx';

export default function Practice() {
  const { n, mode } = useParams();
  const day = getDay(n);
  if (!day || !MODE_TITLES[mode]) return <NotFound />;

  // After a round, suggest the next step of the lesson, then the next day.
  const step = MODE_ORDER.indexOf(mode);
  const nextDay = getDay(day.number + 1);
  const next =
    step < MODE_ORDER.length - 1
      ? { to: `/day/${day.number}/practice/${MODE_ORDER[step + 1]}`, label: `Next: ${MODE_TITLES[MODE_ORDER[step + 1]]}`, ko: day.titleKo }
      : nextDay
        ? { to: `/day/${nextDay.number}`, label: `Next: Day ${pad(nextDay.number)}`, ko: nextDay.titleKo }
        : { to: '/review', label: 'Review due words', ko: '복습' };

  return (
    <>
      <title>{`${MODE_TITLES[mode]}: Day ${pad(day.number)} ${day.title} | Essential Korean Vocabulary`}</title>
      <meta name="robots" content="noindex" />
      <Session
        key={`${day.id}-${mode}`}
        words={day.words}
        mode={mode}
        dayId={day.id}
        title={`Day ${pad(day.number)} · ${day.title}`}
        exitTo={`/day/${day.number}`}
        exitLabel={`Back to Day ${pad(day.number)}`}
        next={next}
      />
    </>
  );
}
