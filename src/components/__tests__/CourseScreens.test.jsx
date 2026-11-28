// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Header } from '../Header.jsx';
import { MotionProvider } from '../Motion.jsx';
import { profileStore } from '../../hooks/useProfile.js';
import Home from '../../pages/Home.jsx';
import Welcome from '../../pages/Welcome.jsx';
import Day from '../../pages/Day.jsx';
import NotFound from '../../pages/NotFound.jsx';
import Practice from '../../pages/Practice.jsx';
import arabicDay from '../../data/ar/day01.json';
import { loadProgress } from '../../lib/progress.js';

vi.hoisted(() => {
  window.matchMedia = media => ({
    media, matches: media === '(prefers-reduced-motion: reduce)',
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  });
  window.scrollTo = () => {};
});

beforeEach(() => {
  vi.stubGlobal('Audio', undefined);
  localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
  // Refresh the shared store as a tab receiving a profile change would.
  const unsubscribe = profileStore.subscribe(() => {});
  window.dispatchEvent(new StorageEvent('storage', { key: 'kv.profile' }));
  unsubscribe();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function visit(path) {
  const router = createMemoryRouter([{
    element: <MotionProvider><Header theme="light" /><main><Outlet /></main></MotionProvider>,
    children: [
      { path: '/', element: <Home /> },
      { path: '/ar', element: <Home /> },
      { path: '/welcome', element: <Welcome /> },
      { path: '/ar/welcome', element: <Welcome /> },
      { path: '/day/:n', element: <Day /> },
      { path: '/ar/day/:n', element: <Day /> },
      { path: '/ar/day/:n/practice/:mode', element: <Practice /> },
      { path: '*', element: <NotFound /> },
    ],
  }], { initialEntries: [path] });
  const view = render(<RouterProvider router={router} />);
  return { user: userEvent.setup(), router, view };
}

const profile = () => JSON.parse(localStorage.getItem('kv.profile'));

it('validates the learner’s name, saves their language and goal, and honors them on return', async () => {
  const { user, router, view } = visit('/welcome');
  const name = screen.getByRole('textbox', { name: 'Your name' });
  const language = within(screen.getByRole('group', { name: 'I want to learn' }));
  const goals = within(screen.getByRole('group', { name: 'Daily goal' }));
  expect(language.getByRole('radio', { name: /Korean/ }).checked).toBe(true);
  expect(goals.getByRole('radio', { name: /20 answers/ }).checked).toBe(true);

  await user.type(name, '  ');
  await user.click(screen.getByRole('button', { name: 'Start learning Korean' }));
  expect(screen.getByRole('alert').textContent).toMatch(/Enter a name/);
  expect(document.activeElement).toBe(name);
  expect(name.getAttribute('aria-invalid')).toBe('true');
  expect(profile()).toBeNull();

  await user.type(name, 'Noor ');
  await user.click(language.getByRole('radio', { name: /Arabic/ }));
  await user.click(goals.getByRole('radio', { name: /30 answers/ }));
  await user.click(screen.getByRole('button', { name: 'Start learning Arabic' }));
  await screen.findByRole('heading', { name: /Noor/ });
  expect(router.state.location.pathname).toBe('/ar');
  screen.getByText('30 answers to go');
  expect(profile()).toMatchObject({ name: 'Noor', course: 'ar', goal: 30 });
  expect(Number.isFinite(Date.parse(profile().createdAt))).toBe(true);

  view.unmount();
  const returning = visit('/');
  await screen.findByRole('heading', { name: /Noor/ });
  expect(returning.router.state.location.pathname).toBe('/ar');
  screen.getByText('30 answers to go');
});

it('keeps sign-in available when a visitor picks Arabic in the welcome header', async () => {
  const { user } = visit('/welcome');
  const language = within(screen.getByRole('group', { name: 'Course language' }));
  await user.click(language.getByRole('button', { name: /Arabic/ }));
  const form = screen.getByRole('group', { name: 'I want to learn' });
  expect(within(form).getByRole('radio', { name: /Arabic/ }).checked).toBe(true);
  screen.getByRole('button', { name: 'Start learning Arabic' });
});

it('switches the current lesson in both directions and remembers the chosen course', async () => {
  const saved = profileStore.save({ name: 'Mina', course: 'ko', goal: 10 });
  const { user, router } = visit('/day/2');
  const language = within(screen.getByRole('group', { name: 'Course language' }));
  const korean = language.getByRole('button', { name: /Korean/ });
  const arabic = language.getByRole('button', { name: /Arabic/ });
  expect(korean.getAttribute('aria-pressed')).toBe('true');
  const originalTitle = screen.getByRole('heading', { level: 1 }).textContent;

  await user.click(arabic);
  await screen.findByRole('heading', { level: 1, name: /Numbers/ });
  expect(router.state.location.pathname).toBe('/ar/day/2');
  expect(arabic.getAttribute('aria-pressed')).toBe('true');
  expect(korean.getAttribute('aria-pressed')).toBe('false');
  expect(profile()).toEqual({ ...saved, course: 'ar' });

  await user.click(korean);
  expect(router.state.location.pathname).toBe('/day/2');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(originalTitle);
  expect(profile()).toEqual(saved);
});

it('matches Arabic words in both directions, grades misses and persists two boards as one lesson', async () => {
  const { user } = visit('/ar/day/1/practice/match');
  const records = new Map(arabicDay.words.map(word => [word.term, word]));
  const missed = new Set();
  const covered = new Set();
  for (let round = 0; round < 2; round++) {
    const terms = within(screen.getByRole('list', { name: 'Words' }));
    const meanings = within(screen.getByRole('list', { name: 'Meanings' }));
    const cards = terms.getAllByRole('button');
    const entries = cards.map(card => records.get(card.textContent));
    expect(cards).toHaveLength(5);
    expect(meanings.getAllByRole('button')).toHaveLength(5);
    for (const entry of entries) {
      expect(covered.has(entry.id)).toBe(false);
      covered.add(entry.id);
    }
    if (round === 0) {
      await user.click(cards[0]);
      expect(cards[0].getAttribute('aria-pressed')).toBe('true');
      await user.click(meanings.getByRole('button', { name: entries[1].english }));
      expect(screen.getByRole('status').textContent).toMatch(/Not a pair/);
      missed.add(entries[0].id);
      missed.add(entries[1].id);
    }
    for (const entry of entries) {
      const term = terms.getByRole('button', { name: entry.term });
      const meaning = meanings.getByRole('button', { name: entry.english });
      await user.click(meaning);
      await user.click(term);
      expect(term.disabled).toBe(true);
      expect(meaning.disabled).toBe(true);
    }
    if (round === 0) {
      // The next board replaces all five pairs after the final match.
      const next = arabicDay.words.find(word => !covered.has(word.id));
      await screen.findByRole('button', { name: next.term });
    }
  }
  await screen.findByText('8/10');
  const saved = loadProgress(localStorage);
  expect(saved.days[arabicDay.id]).toMatchObject({ modes: ['match'], best: 80 });
  for (const word of arabicDay.words) {
    expect(saved.words[word.id].correctCount).toBe(missed.has(word.id) ? 0 : 1);
  }
  await user.click(screen.getByRole('button', { name: 'Retry 2 missed' }));
  const retry = within(screen.getByRole('list', { name: 'Words' })).getAllByRole('button');
  expect(new Set(retry.map(card => records.get(card.textContent).id))).toEqual(missed);
});

it('keeps the remaining Match cards in place after grading a pair', async () => {
  const random = vi.spyOn(Math, 'random').mockReturnValue(0);
  try {
    const { user } = visit('/ar/day/1/practice/match');
    const terms = within(screen.getByRole('list', { name: 'Words' }));
    const meanings = within(screen.getByRole('list', { name: 'Meanings' }));
    const labels = list => list.getAllByRole('button').map(card => card.textContent);
    const before = { terms: labels(terms), meanings: labels(meanings) };
    const word = arabicDay.words.find(entry => entry.term === before.terms[0]);
    // A second shuffle would now produce different positions on this same board.
    random.mockReturnValue(0.999);
    await user.click(terms.getByRole('button', { name: word.term }));
    await user.click(meanings.getByRole('button', { name: word.english }));
    expect(screen.getByRole('status').textContent).toContain('Matched:');
    expect({ terms: labels(terms), meanings: labels(meanings) }).toEqual(before);
  } finally {
    random.mockRestore();
  }
});
