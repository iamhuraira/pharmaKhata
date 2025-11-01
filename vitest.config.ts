import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/out/**',
      '**/tests/**', // Exclude Playwright tests
      '**/coverage/**',
    ],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});

