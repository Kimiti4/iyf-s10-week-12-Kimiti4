import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  retries: 1,
  fullyParallel: false,
  use: {
    baseURL: process.env.STAGING_FRONTEND_URL || 'https://iyf-s10-week-12-kimiti4.up.railway.app',
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
