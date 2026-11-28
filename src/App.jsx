import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionProvider } from './components/Motion.jsx';
import { PageHead } from './components/PageHead.jsx';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { InstallBanner } from './components/InstallBanner.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useCourse } from './hooks/useCourse.js';
import { profileStore, useProfile } from './hooks/useProfile.js';

// Pages that belong to one course. Home is left out: / and /ar decide on their own.
const COURSE_PAGE = /^(\/ar)?\/(course|review|progress|letters|day\/\d+(\/practice\/[a-z]+)?)$/;

export function Layout({ bare = false }) {
  const [theme, toggleTheme] = useTheme();
  const { pathname } = useLocation();
  const course = useCourse();
  const profile = useProfile();

  // The course you are looking at becomes your current course, so Today follows you.
  useEffect(() => {
    if (profile && COURSE_PAGE.test(pathname)) profileStore.setCourse(course.id);
  }, [profile, pathname, course.id]);

  return (
    <MotionProvider>
      <PageHead />
      <a className="skip-link" href="#main">Skip to content</a>
      {!bare && <Header theme={theme} onToggleTheme={toggleTheme} />}
      <main id="main" className={bare ? '' : 'app-main'}>
        <Outlet />
        {!bare && <Footer />}
      </main>
      {!bare && <InstallBanner />}
    </MotionProvider>
  );
}
