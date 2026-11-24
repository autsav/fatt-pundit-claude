import { defineConfig, devices } from '@playwright/test';

// E2E against a built site: `npm run build`, then `npm run test:e2e`.
// BASE points at a running `astro preview` (Astro allows one preview per project; reuse it).
const BASE = process.env.BASE ?? 'http://localhost:4321';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: BASE },
  projects: [
    { name: 'phone', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: process.env.BASE ? undefined : { command: 'npx astro preview --port 4321', url: BASE, reuseExistingServer: true },
});
