import { lazy, Suspense, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useCourse } from '../hooks/useCourse.js';
import { profileStore, useProfile } from '../hooks/useProfile.js';
import { useProgress } from '../hooks/useProgress.js';
import Welcome from './Welcome.jsx';

const Today = lazy(() => import('./Today.jsx'));

/**
 * / and /ar. Signed-out visitors get the sign-in page; signed-in learners get Today for the
 * course they last used. Opening /ar directly makes Arabic the current course.
 */
export default function Home() {
  const course = useCourse();
  const profile = useProfile();
  const progress = useProgress();
  const wrongHome = profile && course.id === 'ko' && profile.course === 'ar';

  useEffect(() => {
    if (profile && !wrongHome) profileStore.setCourse(course.id);
  }, [profile, wrongHome, course.id]);

  if (!profile) return <Welcome initialCourse={course.id} />;
  if (wrongHome) return <Navigate to="/ar" replace />;
  return (
    <Suspense fallback={null}>
      <Today progress={progress} />
    </Suspense>
  );
}
