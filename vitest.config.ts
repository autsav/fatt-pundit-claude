import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Pure rules in src/lib (booking, hours). Browser flows live in tests/e2e (Playwright).
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['tests/unit/**/*.test.ts'], passWithNoTests: true },
});
