import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E for the Vite + React JamiiLink SPA.
 * Spin up the real dev server; tests stay deterministic by intercepting
 * only the feed API (auth/drafts call real dev endpoints).
 */
export default defineConfig({
  testDir: './e2e',
  // staging-auth.spec.js targets the live Railway API and has its own config
  // (npx playwright test --config playwright-staging.config.js), so exclude it
  // from the default CI/dev run to keep this suite deterministic.
  testIgnore: /staging-auth\.spec\.js/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  timeout: 120000,
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});