import { useParams } from 'react-router-dom';
import { Session, MODE_TITLES } from '../components/Session.jsx';
import { getDay, pad } from '../data/index.js';
import NotFound from './NotFound.jsx';

export default function Practice() {
  const { n, mode } = useParams();
  const day = getDay(n);
  if (!day || !MODE_TITLES[mode]) return <NotFound />;
  const others = Object.keys(MODE_TITLES)
    .filter((m) => m !== mode)
    .slice(0, 2)
    .map((m) => ({ to: `/day/${day.number}/practice/${m}`, label: `Try ${MODE_TITLES[m].toLowerCase()}` }));

  return (
    <>
      <title>{`${MODE_TITLES[mode]}: Day ${pad(day.number)} ${day.title} | Essential Korean Vocabulary`}</title>
      <meta name="robots" content="noindex" />
      <Session
        key={`${day.id}-${mode}`}
        words={day.words}
        mode={mode}
        dayId={day.id}
        exitTo={`/day/${day.number}`}
        exitLabel={`Back to Day ${pad(day.number)}`}
        otherModes={others}
      />
    </>
  );
}
