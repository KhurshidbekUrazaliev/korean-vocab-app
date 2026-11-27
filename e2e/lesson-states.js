import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const day = JSON.parse(await readFile(new URL('../src/data/days/day01.json', import.meta.url)));
const meanings = new Map(day.words.map(word => [word.korean, word.english]));

export const expectedStates = [
  'landing', 'review-empty', 'course', 'day1', 'flash-front', 'flash-back', 'review-due',
  'review-choice', 'wrong-feedback', 'results-with-miss', 'today', 'progress', 'choice',
  'reverse-choice', 'typing', 'typing-feedback', 'listening', '404',
];

/** Every scan follows an assertion on the rendered React page or feedback state. */
export async function visitStates(page, baseURL, theme, scan) {
  async function open(route, selector, status = 200) {
    const url = new URL(route, baseURL).href;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), status, url);
    assert.equal(page.url(), url);
    await page.locator(`main#main ${selector}`).first().waitFor();
    await page.waitForFunction(expected =>
      document.documentElement.dataset.theme === expected &&
      matchMedia('(prefers-reduced-motion: reduce)').matches, theme);
    await page.waitForFunction(() => document.fonts.status === 'loaded');
  }
  async function mode(name, selector) {
    await open(`day/1/practice/${name}`, selector);
    assert.match(await page.locator('.session__title').innerText(), /Day 01/);
  }

  await open('', '.hero__still');
  await scan('landing');

  await open('review', '.review-page');
  assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Nothing due/);
  await scan('review-empty');

  await open('course', 'a.lesson');
  assert.equal(await page.locator('a.lesson').count(), 50);
  await scan('course');

  await open('day/1', '.word-row');
  assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Dining Out/);
  assert.equal(await page.locator('.word-row').count(), day.words.length);
  await scan('day1');

  await mode('flashcards', '.flash__card');
  const card = page.locator('.flash__card');
  assert.equal(await card.getAttribute('data-flipped'), 'false');
  await scan('flash-front');
  await card.click();
  await page.locator('.flash__card[data-flipped="true"]').waitFor();
  await scan('flash-back');
  await page.getByRole('button', { name: /Not yet/ }).click();
  await page.locator('.session__count').filter({ hasText: /^2\/10$/ }).waitFor();

  await open('review', '.review-page__words li');
  assert.equal(await page.locator('.review-page__words li').count(), 1);
  await scan('review-due');
  await page.getByRole('button', { name: 'Review with multiple choice' }).click();
  await page.locator('.quiz__prompt').waitFor();
  await scan('review-choice');
  const answer = meanings.get(await page.locator('.quiz__prompt').innerText());
  assert.ok(answer, 'The due word belongs to the lesson just practiced');
  const options = page.locator('button.option');
  const labels = await options.locator('span').allTextContents();
  assert.equal(labels.length, 4);
  assert.ok(labels.includes(answer));
  await options.nth(labels.findIndex(label => label !== answer)).click();
  await page.locator('.feedback[data-correct="false"]').waitFor();
  await scan('wrong-feedback');
  await page.locator('.feedback button').click();
  await page.getByRole('button', { name: 'Retry 1 missed' }).waitFor();
  assert.equal(await page.locator('.results__pct').innerText(), '0');
  await scan('results-with-miss');

  await open('', '.today__greet');
  await scan('today');
  await open('progress', '.progress-page');
  assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Your progress/);
  await scan('progress');

  await mode('choice', '.quiz__prompt');
  assert.equal(await page.locator('.option').count(), 4);
  await scan('choice');
  await page.getByRole('button', { name: 'English → 한국어' }).click();
  await page.locator('.option__ko').first().waitFor();
  await scan('reverse-choice');

  await mode('typing', '#answer');
  await scan('typing');
  await page.locator('#answer').fill('incorrect answer');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.locator('.feedback[data-correct="false"]').waitFor();
  await scan('typing-feedback');

  await mode('listening', '.listen-btn');
  assert.equal(await page.locator('.option').count(), 4);
  await scan('listening');
  await open('a11y-missing-page', '.not-found', 404);
  assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /doesn’t exist/);
  await scan('404');
}
