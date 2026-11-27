import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The v1.3.9 dynamic stylesheet uses this subset for the Latin UI and common Hangul.
const uiFont = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2-dynamic-subset/PretendardVariable.subset.91.woff2';

export default defineConfig({
  base: '/korean-vocab-app/',
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
