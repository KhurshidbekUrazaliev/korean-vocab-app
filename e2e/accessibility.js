import assert from 'node:assert/strict';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { servePages } from './pages-server.js';
import { expectedStates, visitStates } from './lesson-states.js';

const require = createRequire(import.meta.url);
const reports = new URL('results/', import.meta.url);
const baseline = JSON.parse(await readFile(new URL('known-findings.json', import.meta.url)));
const strict = process.env.A11Y_STRICT === '1';
const profiles = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

function fingerprint(rule, node, state) {
  return JSON.stringify([rule, node.target, node.xpath, state]);
}

const expected = new Set(baseline.flatMap(({ rule, target, xpath, states }) =>
  states.map(state => fingerprint(rule, { target, xpath }, state))));
const observed = new Set();
const summary = { strict, states: [], errors: [], unmatchedBaseline: [] };

async function runProfile(browser, url, profile, theme) {
  const context = await browser.newContext({ viewport: profiles[profile], colorScheme: theme, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  const report = { profile, theme, browser: browser.version(), states: {} };
  const id = `${profile}/${theme}`;
  page.on('pageerror', error => summary.errors.push(`${id} ${page.url()}: ${error.message}`));
  try {
    await visitStates(page, url, theme, async name => {
      if (!await page.evaluate(() => typeof window.axe !== 'undefined')) {
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      }
      // Clicks can leave the pointer over the next control on small screens.
      // Sample the resting state consistently across randomized question orders.
      await page.mouse.move(0, 0);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const state = `${id}/${name}`;
      // All default-enabled axe rules run against the entire document.
      const result = await page.evaluate(() => axe.run(document, {
        xpath: true, resultTypes: ['violations', 'incomplete'],
      }));
      assert.ok(!Object.hasOwn(report.states, name), `Duplicate scan: ${state}`);
      report.states[name] = {
        url: new URL(page.url()).pathname, engine: result.testEngine,
        violations: result.violations, incomplete: result.incomplete,
      };
      let known = 0;
      const newFindings = [];
      for (const rule of result.violations) {
        for (const node of rule.nodes) {
          const key = fingerprint(rule.id, node, state);
          observed.add(key);
          if (expected.has(key)) known++;
          else newFindings.push({ rule: rule.id, target: node.target, xpath: node.xpath });
        }
      }
      summary.states.push({ state, known, newFindings });
      console.log(`${state}: ${known} known, ${newFindings.length} unexpected`);
      for (const finding of newFindings) console.error('  ', finding.rule, JSON.stringify(finding.target));
    });
    assert.deepEqual(Object.keys(report.states).sort(), [...expectedStates].sort(), `Incomplete profile: ${id}`);
  } catch (error) {
    summary.errors.push(`${id}: ${error.stack}`);
    console.error(`${id}: ${error.message}`);
  } finally {
    await writeFile(new URL(`${profile}-${theme}.json`, reports), JSON.stringify(report, null, 2));
    await context.close();
  }
}

await mkdir(reports, { recursive: true });
const server = await servePages();
let browser;
try {
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  // Run two contexts at a time so a hosted runner has headroom for contrast checks.
  for (const profile of Object.keys(profiles)) {
    await Promise.all(['light', 'dark'].map(theme => runProfile(browser, server.url, profile, theme)));
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
