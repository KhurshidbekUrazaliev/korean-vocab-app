import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/base.css';
import { Layout } from './App.jsx';
import Home from './pages/Home.jsx';
import Day from './pages/Day.jsx';
import Practice from './pages/Practice.jsx';
import Review from './pages/Review.jsx';
import { Privacy, Terms } from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/day/:n', element: <Day /> },
        { path: '/review', element: <Review /> },
        { path: '/privacy', element: <Privacy /> },
        { path: '/terms', element: <Terms /> },
        { path: '*', element: <NotFound /> },
      ],
    },
    { element: <Layout bare />, children: [{ path: '/day/:n/practice/:mode', element: <Practice /> }] },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') },
);

// The static HTML from scripts/postbuild.js carries its own title, description and canonical
// for crawlers. Each page renders these itself, so drop the static copies to avoid duplicates.
document.head.querySelectorAll('title, meta[name="description"], link[rel="canonical"]').forEach((el) => el.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
