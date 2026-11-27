import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/korean-vocab-app/',
  plugins: [react()],
  test: { environment: 'node' },
});
