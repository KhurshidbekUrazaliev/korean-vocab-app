import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/base.css';
import { installBundleRecovery } from './lib/recoverBundle.js';
import { Layout } from './App.jsx';
import Home from './pages/Home.jsx';
import Day from './pages/Day.jsx';
import Practice from './pages/Practice.jsx';
import Review from './pages/Review.jsx';
import Course from './pages/Course.jsx';
import Progress from './pages/Progress.jsx';
import Letters from './pages/Letters.jsx';
import Welcome from './pages/Welcome.jsx';
import { Privacy, Terms } from './pages/Legal.jsx';
import Install from './pages/Install.jsx';
import NotFound from './pages/NotFound.jsx';

installBundleRecovery();

// Korean keeps the original URLs; the Arabic course repeats them under /ar.
// Course pages carry the course as a key, so switching language builds the page afresh
// instead of reusing state from the other course (Review keeps a snapshot of due words).
// The sign-in page is shared on purpose: switching there keeps what the visitor typed.
const coursePages = (prefix) => {
  const key = prefix || 'ko';
  return [
    { path: prefix || '/', element: <Home key={key} /> },
    { path: `${prefix}/day/:n`, element: <Day key={key} /> },
    { path: `${prefix}/course`, element: <Course key={key} /> },
    { path: `${prefix}/review`, element: <Review key={key} /> },
    { path: `${prefix}/progress`, element: <Progress key={key} /> },
    { path: `${prefix}/letters`, element: <Letters key={key} /> },
    { path: `${prefix}/welcome`, element: <Welcome /> },
  ];
};

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        ...coursePages(''),
        ...coursePages('/ar'),
        { path: '/install', element: <Install /> },
        { path: '/privacy', element: <Privacy /> },
        { path: '/terms', element: <Terms /> },
        { path: '*', element: <NotFound /> },
      ],
    },
    {
      element: <Layout bare />,
      children: [
        { path: '/day/:n/practice/:mode', element: <Practice key="ko" /> },
        { path: '/ar/day/:n/practice/:mode', element: <Practice key="ar" /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') },
);

// PageHead takes ownership of the prerendered metadata on startup.
document.head.querySelectorAll('title, meta[name="description"], [data-route-head]').forEach(el => el.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// Offline support and installability: the service worker is written by scripts/postbuild.js.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* The site works without it; it only adds offline pages and faster repeat visits. */
    });
  });
}
