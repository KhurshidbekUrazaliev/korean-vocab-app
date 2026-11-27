import { Outlet } from 'react-router-dom';
import { MotionProvider } from './components/Motion.jsx';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { useTheme } from './hooks/useTheme.js';

export function Layout({ bare = false }) {
  const [theme, toggleTheme] = useTheme();
  return (
    <MotionProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      {!bare && <Header theme={theme} onToggleTheme={toggleTheme} />}
      <main id="main" className={bare ? '' : 'app-main'}>
        <Outlet />
        {!bare && <Footer />}
      </main>
    </MotionProvider>
  );
}
