import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Itch.io build config: set base to './' for relative paths
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: true,
  },
});
