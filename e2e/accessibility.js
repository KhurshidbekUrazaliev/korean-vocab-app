import assert from 'node:assert/strict';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { servePages } from './pages-server.js';
import { expectedStates, visitStates } from './lesson-states.js';
import { renderedFonts } from './rendered-fonts.js';

const require = createRequire(import.meta.url);
const reports = new URL('results/', import.meta.url);
const baseline = JSON.parse(await readFile(new URL('known-findings.json', import.meta.url)));
const strict = process.env.A11Y_STRICT === '1';
const profiles = {
  desktop: { viewport: { width: 1280, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};

function fingerprint(rule, node, state) {
  return JSON.stringify([rule, node.target, node.xpath, state]);
}

const expected = new Set(baseline.flatMap(({ rule, target, xpath, states }) =>
  states.map(state => fingerprint(rule, { target, xpath }, state))));
const observed = new Set();
const summary = { strict, states: [], errors: [], unmatchedBaseline: [] };

async function runProfile(browser, url, profile, theme) {
  const context = await browser.newContext({ ...profiles[profile], colorScheme: theme, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  const report = { profile, theme, browser: browser.version(), states: {}, resourceFailures: [], errors: [] };
  const states = [];
  const seen = new Set();
  const id = `${profile}/${theme}`;
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(`${id} ${page.url()}: ${error.message}`));
  function resourceFailure(request, reason, transient) {
    const type = request.resourceType();
    if (!['stylesheet', 'font', 'script'].includes(type)) return;
    const externalFont = (type === 'stylesheet' || type === 'font') && new URL(request.url()).origin !== new URL(url).origin;
    report.resourceFailures.push({ type, url: request.url(), reason, retryable: externalFont && transient });
  }
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) resourceFailure(response.request(), `HTTP ${status}`, status === 429 || status >= 500);
  });
  page.on('requestfailed', request => {
    const reason = request.failure()?.errorText;
    // A navigation can cancel an obsolete request. The next scan still has
    // to prove that the current page actually rendered with its web fonts.
    if (reason !== 'net::ERR_ABORTED') resourceFailure(request, reason, true);
  });
  try {
    const session = await context.newCDPSession(page);
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    report.input = await page.evaluate(() => ({
      touch: navigator.maxTouchPoints > 0, coarse: matchMedia('(pointer: coarse)').matches,
      hover: matchMedia('(hover: hover)').matches,
    }));
    const mobile = profile === 'mobile';
    assert.deepEqual(report.input, { touch: mobile, coarse: mobile, hover: !mobile }, id);
    await visitStates(page, url, { theme, mobile }, async name => {
      if (!await page.evaluate(() => typeof window.axe !== 'undefined')) {
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      }
      // Clicks can leave the pointer over the next control on small screens.
      // Sample the resting state consistently across randomized question orders.
      if (!mobile) await page.mouse.move(0, 0);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const state = `${id}/${name}`;
      const fonts = await renderedFonts(page, session);
      // All default-enabled axe rules run against the entire document.
      const result = await page.evaluate(() => axe.run(document, {
        xpath: true, resultTypes: ['violations', 'incomplete'],
      }));
      assert.ok(!Object.hasOwn(report.states, name), `Duplicate scan: ${state}`);
      report.states[name] = {
        url: new URL(page.url()).pathname, engine: result.testEngine, fonts,
        violations: result.violations, incomplete: result.incomplete,
      };
      let known = 0;
      const newFindings = [];
      for (const rule of result.violations) {
        for (const node of rule.nodes) {
          const key = fingerprint(rule.id, node, state);
          seen.add(key);
          if (expected.has(key)) known++;
          else newFindings.push({ rule: rule.id, target: node.target, xpath: node.xpath });
        }
      }
      states.push({ state, known, newFindings });
      console.log(`${state}: ${known} known, ${newFindings.length} unexpected`);
      for (const finding of newFindings) console.error('  ', finding.rule, JSON.stringify(finding.target));
    });
    assert.deepEqual(Object.keys(report.states).sort(), [...expectedStates].sort(), `Incomplete profile: ${id}`);
  } catch (error) {
    report.errors.push(`${id}: ${error.stack}`);
    console.error(`${id}: ${error.message}`);
  } finally {
    await context.close();
  }
  const failed = report.resourceFailures;
  const retryable = failed.length > 0 && failed.every(f => f.retryable) &&
    !pageErrors.length && !states.some(s => s.newFindings.length);
  report.errors.push(...pageErrors, ...failed.map(f => `${id} ${f.type} ${f.url}: ${f.reason}`));
  return { report, states, seen, retryable };
}

async function checkProfile(browser, url, profile, theme) {
  let run = await runProfile(browser, url, profile, theme);
  if (run.retryable) {
    const firstAttempt = run.report.resourceFailures;
    console.log(`${profile}/${theme}: retrying once after an external font service failure`);
    run = await runProfile(browser, url, profile, theme);
    run.report.firstAttemptResourceFailures = firstAttempt;
  }
  await writeFile(new URL(`${profile}-${theme}.json`, reports), JSON.stringify(run.report, null, 2));
  summary.states.push(...run.states);
  summary.errors.push(...run.report.errors);
  for (const key of run.seen) observed.add(key);
}

await mkdir(reports, { recursive: true });
const server = await servePages();
let browser;
try {
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  // Run two contexts at a time so a hosted runner has headroom for contrast checks.
  for (const profile of Object.keys(profiles)) {
    await Promise.all(['light', 'dark'].map(theme => checkProfile(browser, server.url, profile, theme)));
  }
} catch (error) {
  summary.errors.push(error.stack);
  console.error(error.message);
} finally {
  await browser?.close();
  server.close();
  summary.unmatchedBaseline = [...expected].filter(key => !observed.has(key)).map(key => JSON.parse(key));
}

const newCount = summary.states.reduce((total, state) => total + state.newFindings.length, 0);
const knownCount = summary.states.reduce((total, state) => total + state.known, 0);
const expectedScans = Object.keys(profiles).length * 2 * expectedStates.length;
if (summary.states.length !== expectedScans) summary.errors.push(`Expected ${expectedScans} states, scanned ${summary.states.length}.`);
console.log(`${summary.states.length} scans, ${knownCount} known violations, ${newCount} unexpected, ${summary.errors.length} execution errors. Full results in e2e/results/.`);
if (summary.unmatchedBaseline.length) console.log(`${summary.unmatchedBaseline.length} baseline entries did not recur. Review their removal.`);
summary.totals = { expectedScans, scans: summary.states.length, known: knownCount, unexpected: newCount, errors: summary.errors.length };
await writeFile(new URL('summary.json', reports), JSON.stringify(summary, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, [
    '### Accessibility', '',
    `Scanned **${summary.states.length}/${expectedScans}** states. **${knownCount}** known findings, **${newCount}** unexpected findings, **${summary.errors.length}** execution errors.`,
    '', 'See the `accessibility-findings` artifact for full axe results and `e2e/FINDINGS.md` for the existing UI issues.', '',
  ].join('\n'));
}
if (summary.errors.length || newCount || (strict && knownCount)) process.exitCode = 1;
