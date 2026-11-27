# Course CI and publishing

Pull requests into `main` run a clean npm install, the test suite and the Vite production build. Chromium then scans the built site with axe. Each run uploads its accessibility findings. [Accessibility checks and strict mode](../e2e/README.md) A push to `main` runs the same checks and archives the built `dist/` directory, including `.nojekyll`.

The publish job synchronizes that artifact to the root of the existing `gh-pages` branch. It then requests a Pages build explicitly because branch updates made with the workflow token do not start one automatically. The repository’s Pages source stays on `gh-pages` at `/ (root)`. GitHub lists the resulting Pages build and deployment in Actions. [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Request a Pages build](https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build)
