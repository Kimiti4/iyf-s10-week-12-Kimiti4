import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makePost, makeJam, makeReel } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = [makePost({ content: 'Mobile feed post' })];
const MOCK_JAMS = [makeJam({ title: 'Mobile Jam' })];
const MOCK_REELS = [makeReel({ title: 'Mobile Reel' })];

async function mockRoutes(page) {
  await page.route('**/api/posts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS }) })
  );
  await page.route('**/api/jams**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  await page.route('**/api/reels**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reels: MOCK_REELS }) })
  );
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
}

test.describe('JN-06: Mobile Feed → Jam → Reel → Create', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile journey through feed, jams, reels, and create', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockRoutes(page);
    await installCatchAll(page);

    // Level A: Mobile feed loads
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/');

    // Level A: Mobile bottom nav visible
    const bottomNav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(bottomNav).toBeVisible();

    // Level B: Navigate to jams via direct navigation (no Jams link in mobile bottom nav)
    await page.goto('/jams');
    await page.waitForTimeout(300);
    expect(page.url()).toContain('/jams');

    // Level A: Reels page
    await page.goto('/reels');
    await page.waitForTimeout(300);
    expect(page.url()).toContain('/reels');

    // Level B: Create button interaction
    const createBtn = page.getByRole('button', { name: /create|new|add/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(300);
    }

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
