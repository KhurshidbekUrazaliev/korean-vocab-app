// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { PageHead } from '../PageHead.jsx';

afterEach(cleanup);

it('updates canonical, indexing, social previews and structured data on navigation', () => {
  render(<MemoryRouter initialEntries={['/day/1/practice/flashcards']}>
    <PageHead />
    <Link to="/day/1">Lesson</Link>
    <Link to="/progress">Progress</Link>
  </MemoryRouter>);
  const tags = selector => [...document.head.querySelectorAll(selector)];
  expect(tags('meta[name="robots"]').map(el => el.content)).toEqual(['noindex']);
  fireEvent.click(screen.getByText('Lesson'));
  expect(tags('meta[name="robots"]')).toHaveLength(0);
  expect(tags('link[rel="canonical"]').map(el => el.href)).toEqual(['https://khurshidbekurazaliev.github.io/inkday/day/1']);
  expect(tags('meta[property="og:url"]')[0].content).toMatch(/\/day\/1$/);
  expect(tags('meta[name="twitter:image"]')[0].content).toMatch(/\/og\/day01.jpg$/);
  expect(JSON.parse(tags('script[type="application/ld+json"]')[0].textContent)[1].hasDefinedTerm).toHaveLength(10);
  fireEvent.click(screen.getByText('Progress'));
  expect(tags('link[rel="canonical"],script[type="application/ld+json"]')).toHaveLength(0);
  expect(tags('meta[name="robots"]').map(el => el.content)).toEqual(['noindex']);
  expect(tags('meta[property="og:url"]')[0].content).toMatch(/\/progress$/);
});
