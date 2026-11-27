// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MotionProvider } from '../Motion.jsx';
import { Session } from '../Session.jsx';
import { progressStore } from '../../hooks/useProgress.js';
import { localDateKey, PROGRESS_KEY } from '../../lib/progress.js';
import day from '../../data/days/day01.json';

// GSAP queries media preferences when its plugins register. Use the app's real
// reduced-motion path in jsdom, which has no layout, media queries or scrolling.
vi.hoisted(() => {
  window.matchMedia = (media) => ({
    media, matches: media === '(prefers-reduced-motion: reduce)',
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  });
  window.scrollTo = () => {};
});

beforeEach(() => {
  localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function start(mode, words) {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <MotionProvider>
        <Session words={words} pool={day.words} mode={mode} dayId={day.id} title={day.title}
          exitTo="/day/1" exitLabel="Back to Day 01" />
      </MotionProvider>
    </MemoryRouter>,
  );
  return user;
}

function saved() {
  const persisted = JSON.parse(localStorage.getItem(PROGRESS_KEY));
  expect(persisted).toEqual(progressStore.get());
  return persisted;
}

function expectResult(score, total) {
  screen.getByText('Done');
  screen.getByText(`${score}/${total}`);
  expect(screen.getByText('Back to Day 01', { selector: 'a' }).getAttribute('href')).toBe('/day/1');
}

function options() {
  const buttons = within(screen.getByRole('list')).getAllByRole('button');
  expect(buttons).toHaveLength(4);
  return buttons;
}

describe('Session', () => {
  it('flips with Space, grades with 1 and 2, and retries just the missed flashcard', async () => {
    const words = day.words.slice(0, 2);
    const user = start('flashcards', words);
    const firstCard = screen.getByRole('button', { name: /Press to see the meaning/ });
    const missed = words.find((w) => firstCard.getAttribute('aria-label').startsWith(w.korean + '.'));
    const known = words.find((w) => w !== missed);

    await user.keyboard('2'); // a hidden answer cannot be graded
    expect(progressStore.get().words).toEqual({});
    await user.keyboard('[Space]');
    screen.getByRole('button', { name: new RegExp(missed.english) });
    await user.keyboard('1');
    screen.getByRole('button', { name: known.korean + '. Press to see the meaning.' });
    await user.keyboard('[Space]2');
    expectResult(1, 2);
    expect(saved()).toMatchObject({
      days: { [day.id]: { best: 50, modes: ['flashcards'] } },
      words: { [missed.id]: { seen: 1, correctCount: 0 }, [known.id]: { seen: 1, correctCount: 1 } },
    });

    await user.click(screen.getByRole('button', { name: 'Retry 1 missed' }));
    screen.getByRole('button', { name: missed.korean + '. Press to see the meaning.' });
    await user.keyboard('[Space]2');
    expectResult(1, 1);
    screen.getByRole('heading', { name: /Perfect round/ });
    screen.getByRole('button', { name: 'Run it again' });
    expect(saved()).toMatchObject({
      words: { [missed.id]: { box: 2, seen: 2, correctCount: 1 }, [known.id]: { seen: 1 } },
      daily: { [localDateKey()]: 3 },
    });
  });

  it('selects each of the four numbered options in reverse direction and advances once with Enter', async () => {
    const words = day.words.slice(0, 4);
    const user = start('choice', words);
    await user.click(screen.getByRole('button', { name: 'English → 한국어' }));
    let score = 0;
    for (let key = 1; key <= 4; key++) {
      const prompt = screen.getByRole('heading', { level: 1 }).textContent;
      const word = words.find((w) => w.english === prompt);
      const choices = options();
      expect(choices.some((button) => within(button).queryByText(word.korean))).toBe(true);
      const correct = Boolean(within(choices[key - 1]).queryByText(word.korean));
      score += Number(correct);
      await user.keyboard(String(key));
      within(screen.getByRole('status')).getByText(correct ? 'Correct' : 'Not quite');
      expect(choices.every((button) => button.disabled)).toBe(true);
      await user.keyboard('1{Enter}'); // a second selection cannot overwrite the first
      expect(saved().words[word.id]).toMatchObject({ seen: 1, correctCount: Number(correct) });
    }
    expectResult(score, 4);
    expect(saved().days[day.id]).toMatchObject({ modes: ['choice'], best: score * 25 });
  });

  it('submits typed answers and advances with Enter, distinguishing exact, close and incorrect answers', async () => {
    const words = [day.words[2], day.words[4], day.words[6]]; // garlic, dessert, night view
    const cases = {
      garlic: ['garlic', 'Correct', 1],
      dessert: ['desert', 'Close enough, check the spelling', 1],
      'night view': ['unrelated', 'Not quite', 0],
    };
    const user = start('typing', words);
    for (let i = 0; i < words.length; i++) {
      const word = words.find((w) => w.korean === screen.getByRole('heading', { level: 1 }).textContent);
      const [answer, feedback, correctCount] = cases[word.english];
      const field = screen.getByRole('textbox', { name: 'Meaning of ' + word.korean });
      expect(document.activeElement).toBe(field);
      await user.keyboard('{Enter}');
      expect(screen.queryByRole('status')).toBeNull();
      await user.keyboard(answer + '{Enter}');
      within(screen.getByRole('status')).getByText(feedback);
      expect(field.readOnly).toBe(true);
      await user.keyboard('{Enter}');
      expect(saved().words[word.id]).toMatchObject({ seen: 1, correctCount });
    }
    expectResult(2, 3);
    expect(saved().days[day.id]).toMatchObject({ modes: ['typing'], best: 67 });
  });

  // The global Enter shortcut currently swallows native button activation.
  // Remove .fails when the UI preserves Enter on the focused answer.
  it.fails.each([
    ['choice', 'garlic'],
    ['flashcards', 'I knew it'],
  ])('activates a focused %s answer with Enter', async (mode, name) => {
    const word = day.words[2];
    const user = start(mode, [word]);
    if (mode === 'flashcards') await user.keyboard('[Space]');
    const answer = screen.getByRole('button', { name: new RegExp(name) });
    const controls = screen.getAllByRole('button').length + screen.getAllByRole('link').length;
    for (let i = 0; i < controls && document.activeElement !== answer; i++) await user.tab();
    expect(document.activeElement).toBe(answer);
    await user.keyboard('{Enter}');
    if (mode === 'choice') {
      within(screen.getByRole('status')).getByText('Correct');
      await user.keyboard('{Enter}');
    }
    expectResult(1, 1);
    expect(saved().words[word.id]).toMatchObject({ seen: 1, correctCount: 1 });
  });

  it('speaks Korean automatically, replays with R and scores the listening answer', async () => {
    const word = day.words[2];
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), getVoices: () => [], speak });
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text; } });
    const user = start('listening', [word]);
    screen.getByRole('button', { name: 'Play the word again' });
    expect(screen.queryByText(word.korean)).toBeNull();
    await waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
    await user.keyboard('R');
    expect(speak).toHaveBeenCalledTimes(2);
    for (const [utterance] of speak.mock.calls) {
      expect(utterance).toMatchObject({ text: word.korean, lang: 'ko-KR' });
    }

    const key = options().findIndex((button) => within(button).queryByText(word.english)) + 1;
    await user.keyboard(String(key));
    within(screen.getByRole('status')).getByText(word.korean);
    await user.keyboard('{Enter}');
    expectResult(1, 1);
    expect(saved()).toMatchObject({
      days: { [day.id]: { modes: ['listening'], best: 100 } },
      words: { [word.id]: { seen: 1, correctCount: 1 } },
    });
  });

  it('offers the romanized listening prompt when speech is unavailable', async () => {
    const word = day.words[0];
    const user = start('listening', [word]);
    screen.getByRole('heading', { name: word.romanization });
    expect(screen.queryByRole('button', { name: 'Play the word again' })).toBeNull();
    const choices = options();
    const wrong = choices.find((button) => !within(button).queryByText(word.english));
    await user.click(wrong);
    within(screen.getByRole('status')).getByText('Not quite');
    await user.keyboard('{Enter}');
    expectResult(0, 1);
    expect(saved().words[word.id]).toMatchObject({ seen: 1, correctCount: 0 });
  });
});
