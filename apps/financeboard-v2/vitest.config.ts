import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      thresholds: {
        'src/lib/bookings.ts': { lines: 100, functions: 100, branches: 100 },
        'src/lib/format.ts': { lines: 100, functions: 100, branches: 100 },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
