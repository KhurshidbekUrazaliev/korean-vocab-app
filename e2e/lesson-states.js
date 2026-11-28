import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const courses = await Promise.all(['ko', 'ar'].map(async lang => {
  const day = JSON.parse(await readFile(new URL(`../src/data/${lang}/day01.json`, import.meta.url)));
  const letters = JSON.parse(await readFile(new URL(`../src/data/${lang}/letters.json`, import.meta.url)));
  return { lang, day, letterCount: letters.groups.flatMap(group => group.items).length };
}));

const courseStates = [
  'review-empty', 'course', 'day1', 'flash-front', 'flash-back', 'review-due', 'review-choice',
  'wrong-feedback', 'results-with-miss', 'today', 'progress', 'choice', 'reverse-choice',
  'typing', 'typing-feedback', 'listening', 'letters', 'match', 'match-selected', 'match-miss', 'match-paired',
];

export const expectedStates = [
  'landing', 'ar-landing', 'welcome', 'welcome-error',
  ...courseStates, ...courseStates.map(state => `ar-${state}`), 'profile-edit', '404',
];

function typingTarget(button) {
  const bounds = element => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { left, top, width, height };
  };
  const input = bounds(document.getElementById('answer'));
  const target = bounds(button);
  const center = document.elementFromPoint(target.left + target.width / 2, target.top + target.height / 2);
  const { width, height, offsetLeft, offsetTop, scale } = visualViewport;
  return {
    input, target, viewport: { width, height, offsetLeft, offsetTop, scale },
    layoutWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
    centerElement: center?.outerHTML.slice(0, 180), receivesTap: button.contains(center),
    fits: target.left >= offsetLeft - 1 && target.left + target.width <= offsetLeft + width + 1 &&
      target.top >= offsetTop - 1 && target.top + target.height <= offsetTop + height + 1,
  };
}

/** Every scan follows an assertion on the rendered React page or feedback state. */
export async function visitStates(page, baseURL, { theme, mobile }, scan) {
  const activate = locator => mobile ? locator.tap() : locator.click();
  async function open(route, selector, status = 200) {
    const url = new URL(route, baseURL).href;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), status, url);
    assert.equal(page.url(), url);
    await page.locator(`main#main ${selector}`).first().waitFor();
    await page.waitForFunction(expected =>
      document.documentElement.dataset.theme === expected &&
      matchMedia('(prefers-reduced-motion: reduce)').matches, theme);
  }
  await open('', '.signin__form');
  assert.ok(await page.getByRole('radio', { name: /Korean/ }).isChecked());
  await scan('landing');
  await open('ar', '.signin__form');
  assert.ok(await page.getByRole('radio', { name: /Arabic/ }).isChecked());
  await scan('ar-landing');

  await open('welcome', '.signin__form');
  await scan('welcome');
  await activate(page.getByRole('button', { name: 'Start learning Korean' }));
  const name = page.getByRole('textbox', { name: 'Your name' });
  await page.getByRole('alert').waitFor();
  assert.equal(await name.getAttribute('aria-invalid'), 'true');
  await scan('welcome-error');
  await name.fill('Ari');
  await activate(page.getByRole('button', { name: 'Start learning Korean' }));
  await page.getByRole('heading', { level: 1, name: /Ari/ }).waitFor();

  for (const course of courses) {
    const { lang, day } = course;
    const arabic = lang === 'ar';
    const root = arabic ? 'ar' : '';
    const meanings = new Map(day.words.map(word => [word.term, word.english]));
    const scanCourse = name => scan(arabic ? `ar-${name}` : name);
    const openCourse = (route, selector) => open([root, route].filter(Boolean).join('/'), selector);
    async function mode(name, selector) {
      await openCourse(`day/1/practice/${name}`, selector);
      const title = await page.locator('.session__title').innerText();
      assert.ok(title.includes('Day 01') && title.includes(day.title), title);
    }

    if (arabic) {
      await open('course', 'a.lesson');
      const language = page.getByRole('group', { name: 'Course language' });
      await activate(language.getByRole('button', { name: /Arabic/ }));
      await page.waitForURL(new URL('ar/course', baseURL).href);
      await language.getByRole('button', { name: /Arabic/, pressed: true }).waitFor();
    }
    await openCourse('review', '.review-page');
    assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Nothing due/);
    await scanCourse('review-empty');

    await openCourse('course', 'a.lesson');
    assert.equal(await page.locator('a.lesson').count(), 50);
    await scanCourse('course');

    await openCourse('day/1', '.word-row');
    assert.ok((await page.getByRole('heading', { level: 1 }).innerText()).includes(day.title));
    assert.deepEqual(await page.locator(`.word-row [lang="${lang}"]`).allTextContents(), day.words.map(word => word.term));
    assert.equal(await page.locator('.word-row').count(), day.words.length);
    await scanCourse('day1');

    await mode('flashcards', '.flash__card');
    const card = page.locator('.flash__card');
    assert.equal(await card.getAttribute('data-flipped'), 'false');
    await scanCourse('flash-front');
    await activate(card);
    await page.locator('.flash__card[data-flipped="true"]').waitFor();
    await scanCourse('flash-back');
    await activate(page.getByRole('button', { name: /Not yet/ }));
    await page.locator('.session__count').filter({ hasText: /^2\/10$/ }).waitFor();

    await openCourse('review', '.review-page__words li');
    assert.equal(await page.locator('.review-page__words li').count(), 1);
    await scanCourse('review-due');
    await activate(page.getByRole('button', { name: 'Review with multiple choice' }));
    await page.locator('.quiz__prompt').waitFor();
    await scanCourse('review-choice');
    const answer = meanings.get(await page.locator('.quiz__prompt').innerText());
    assert.ok(answer, 'The due word belongs to the lesson just practiced');
    const options = page.locator('button.option');
    const labels = await options.locator('span').allTextContents();
    assert.equal(labels.length, 4);
    assert.ok(labels.includes(answer));
    await activate(options.nth(labels.findIndex(label => label !== answer)));
    await page.locator('.feedback[data-correct="false"]').waitFor();
    await scanCourse('wrong-feedback');
    await activate(page.locator('.feedback button'));
    await page.getByRole('button', { name: 'Retry 1 missed' }).waitFor();
    assert.equal(await page.locator('.results__pct').innerText(), '0');
    await scanCourse('results-with-miss');

    await openCourse('', '.today__greet');
    await scanCourse('today');
    await openCourse('progress', '.progress-page');
    assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Your progress/);
    await scanCourse('progress');

    await mode('choice', '.quiz__prompt');
    assert.equal(await page.locator('.option').count(), 4);
    await scanCourse('choice');
    await activate(page.getByRole('button', { name: arabic ? 'English → العربية' : 'English → 한국어' }));
    await page.locator('.option__ko').first().waitFor();
    await scanCourse('reverse-choice');

    await mode('typing', '#answer');
    const check = page.getByRole('button', { name: 'Check', exact: true });
    const beforeScan = mobile ? await check.evaluate(typingTarget) : undefined;
    await scanCourse('typing');
    await page.locator('#answer').fill('incorrect answer');
    if (mobile) {
      await check.scrollIntoViewIfNeeded();
      const beforeTap = await check.evaluate(typingTarget);
      assert.ok(beforeTap.receivesTap && beforeTap.fits, JSON.stringify({ beforeScan, beforeTap }));
      try {
        await check.tap();
      } catch (error) {
        const afterTap = await check.evaluate(typingTarget);
        throw new Error(`Check tap failed. ${JSON.stringify({ beforeScan, beforeTap, afterTap })}\n${error.message}`);
      }
    } else await check.click();
    await page.locator('.feedback[data-correct="false"]').waitFor();
    await scanCourse('typing-feedback');

    await mode('listening', '.listen-btn');
    assert.equal(await page.locator('.option').count(), 4);
    await scanCourse('listening');
    await mode('match', '.match__cols');
    const words = page.getByRole('list', { name: 'Words' });
    const definitions = page.getByRole('list', { name: 'Meanings' });
    const boardTerms = await words.getByRole('button').allTextContents();
    const boardMeanings = await definitions.getByRole('button').allTextContents();
    assert.equal(boardTerms.length, 5);
    assert.deepEqual(boardMeanings.sort(), boardTerms.map(term => meanings.get(term)).sort());
    await scanCourse('match');
    const term = words.getByRole('button', { name: boardTerms[0], exact: true });
    await activate(term);
    assert.equal(await term.getAttribute('aria-pressed'), 'true');
    await scanCourse('match-selected');
    await activate(definitions.getByRole('button', { name: meanings.get(boardTerms[1]), exact: true }));
    const announcement = page.getByRole('status');
    await announcement.filter({ hasText: /Not a pair/ }).waitFor({ state: 'attached' });
    await scanCourse('match-miss');
    const meaning = definitions.getByRole('button', { name: meanings.get(boardTerms[0]), exact: true });
    await activate(meaning);
    await activate(term);
    await announcement.filter({ hasText: /Matched:/ }).waitFor({ state: 'attached' });
    assert.ok(await term.isDisabled() && await meaning.isDisabled());
    await scanCourse('match-paired');

    await openCourse('letters', '.letter__glyph');
    const letters = page.locator(`.letter__glyph[lang="${lang}"]`);
    assert.equal(await letters.count(), course.letterCount);
    assert.equal(await letters.first().getAttribute('dir'), arabic ? 'rtl' : 'ltr');
    await scanCourse('letters');
  }
  await open('welcome', '.signin__form');
  await page.getByRole('heading', { level: 1, name: /Your profile/ }).waitFor();
  assert.equal(await name.inputValue(), 'Ari');
  assert.ok(await page.getByRole('radio', { name: /Arabic/ }).isChecked());
  await scan('profile-edit');

  await open('a11y-missing-page', '.not-found', 404);
  assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /doesn’t exist/);
  await scan('404');
}
