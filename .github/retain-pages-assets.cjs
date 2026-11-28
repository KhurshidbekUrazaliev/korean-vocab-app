// Run after copying a fresh dist into the gh-pages checkout, before committing it.
// gh-pages' --before-add hook supplies the checkout directory as git.cwd.
const { execFileSync, spawnSync } = require('node:child_process');
const { readdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const manifest = '.pages-current-assets.json';
const fingerprinted = /^assets\/[\w.-]+-[\w-]{8}\.(?:js|css)$/;

function retainPagesAssets({ cwd }) {
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' });
  const current = readdirSync(join(cwd, 'assets'), { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => 'assets/' + entry.name)
    .filter(name => fingerprinted.test(name))
    .sort();
  if (!current.length) throw new Error('No fingerprinted Vite bundles in the new build.');

  const head = spawnSync('git', ['rev-parse', '--verify', '--quiet', 'HEAD'], { cwd });
  if (head.status === 0) {
    const tracked = git('ls-tree', '-rz', '--name-only', 'HEAD', '--', manifest, 'assets').split('\0');
    const previouslyShipped = tracked.filter(name => fingerprinted.test(name)).sort();
    // Older deployments have one generation in assets/ and no manifest.
    const last = tracked.includes(manifest)
      ? JSON.parse(git('show', 'HEAD:' + manifest))
      : previouslyShipped;
    if (!Array.isArray(last) || !last.every(name => previouslyShipped.includes(name))) {
      throw new Error('The published asset manifest does not match the gh-pages tree.');
    }
    // Audio, content and no-op releases should not evict an open tab's JS.
    const retain = JSON.stringify(last) === JSON.stringify(current) ? previouslyShipped : last;
    const missing = retain.filter(name => !current.includes(name));
    if (missing.length) git('restore', '--source=HEAD', '--worktree', '--', ...missing);
  } else if (head.status !== 1) {
    throw new Error('Could not read the gh-pages checkout.', { cause: head.error });
  }

  writeFileSync(join(cwd, manifest), JSON.stringify(current, null, 2) + '\n');
}

module.exports = retainPagesAssets;
if (require.main === module) retainPagesAssets({ cwd: process.cwd() });
