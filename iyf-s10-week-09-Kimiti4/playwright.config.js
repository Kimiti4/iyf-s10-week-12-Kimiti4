import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E for the Vite + React JamiiLink SPA.
 * Serves the PRE-BUILT static dist via `vite preview` (deterministic, no
 * cold dev-server compile) and is fully backend-agnostic: every API call is
 * intercepted at the browser layer, so it runs with any backend or none.
 */
export default defineConfig({
  testDir: './e2e',
  // staging-auth.spec.js targets a specific live deployment and is excluded so
  // this suite stays deterministic and passes with any backend.
  testIgnore: /staging-auth\.spec\.js/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  timeout: 120000,
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});