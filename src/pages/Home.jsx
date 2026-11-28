import { lazy, Suspense } from 'react';
import { useProgress } from '../hooks/useProgress.js';
import Landing from './Landing.jsx';

const Today = lazy(() => import('./Today.jsx'));

/** New visitors get the course introduction; anyone with progress gets their Today dashboard. */
export default function Home() {
  const progress = useProgress();
  const started = Object.keys(progress.words).length > 0;
  if (!started) return <Landing />;
  return (
    <Suspense fallback={null}>
      <Today progress={progress} />
    </Suspense>
  );
}
