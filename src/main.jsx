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
import NotFound from './pages/NotFound.jsx';

installBundleRecovery();

// Korean keeps the original URLs; the Arabic course repeats them under /ar.
const coursePages = (prefix) => [
  { path: prefix || '/', element: <Home /> },
  { path: `${prefix}/day/:n`, element: <Day /> },
  { path: `${prefix}/course`, element: <Course /> },
  { path: `${prefix}/review`, element: <Review /> },
  { path: `${prefix}/progress`, element: <Progress /> },
  { path: `${prefix}/letters`, element: <Letters /> },
];

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        ...coursePages(''),
        ...coursePages('/ar'),
        { path: '/welcome', element: <Welcome /> },
        { path: '/privacy', element: <Privacy /> },
        { path: '/terms', element: <Terms /> },
        { path: '*', element: <NotFound /> },
      ],
    },
    {
      element: <Layout bare />,
      children: [
        { path: '/day/:n/practice/:mode', element: <Practice /> },
        { path: '/ar/day/:n/practice/:mode', element: <Practice /> },
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
