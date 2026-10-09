import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path ensures compatibility with GitHub Pages subpaths
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  worker: {
    format: 'es',
  },
});
