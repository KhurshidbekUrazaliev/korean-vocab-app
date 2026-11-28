import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// The v1.3.9 dynamic stylesheet uses this subset for the Latin UI and common Hangul.
const uiFont = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2-dynamic-subset/PretendardVariable.subset.91.woff2';

export default defineConfig({
  base: '/inkday/',
  plugins: [
    react(),
    {
      name: 'preload-course-font',
      transformIndexHtml() {
        return [{
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous', href: uiFont },
          injectTo: 'head-prepend',
        }];
      },
    },
    {
      name: 'arabic-course-font',
      transformIndexHtml: {
        order: 'pre',
        handler: () => [{
          tag: 'style',
          children: `@font-face {
            font-family: 'Noto Naskh Arabic';
            font-style: normal;
            font-weight: 400 700;
            font-display: swap;
            src: url('@fontsource-variable/noto-naskh-arabic/files/noto-naskh-arabic-arabic-wght-normal.woff2') format('woff2');
          }`,
        }],
      },
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'assets/noto-naskh-arabic-LICENSE.txt',
          source: readFileSync(new URL(import.meta.resolve('@fontsource-variable/noto-naskh-arabic/LICENSE'))),
        });
      },
    },
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              // Keep the React adapter with React. Moving it here creates a cycle at startup.
              name: 'motion',
              test: /[\\/]node_modules[\\/](?:gsap|lenis)[\\/]/,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
  test: { environment: 'node' },
});
