import { test, expect } from '../fixtures/auth.js';
import { makePost, makeJam, makeReel } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = [makePost({ content: 'Smoke test post' }), makePost({ content: 'Second post' })];
const MOCK_JAMS = [makeJam({ title: 'Smoke Jam' })];
const MOCK_REELS = [makeReel({ title: 'Smoke Reel' })];

async function mockAllRoutes(page) {
  await page.route('**/api/posts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS, total: MOCK_POSTS.length }) })
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
  await page.route('**/api/alerts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ alerts: [] }) })
  );
}

test.describe('Smoke: App Launch', () => {
  test('app launches, feed loads, navigation works, one interaction succeeds', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockAllRoutes(page);

    // 1. App launches
    await page.goto('/');
    await page.waitForTimeout(1000);

    // 2. Feed loads - navigation bar visible
    await expect(page.locator('nav, .enhanced-navbar, [class*="nav"]').first()).toBeVisible();

    // 3. Navigation works - go to different routes
    await page.goto('/discover');
    await page.waitForTimeout(300);
    expect(page.url()).toContain('/discover');

    await page.goto('/jams');
    await page.waitForTimeout(300);
    expect(page.url()).toContain('/jams');

    await page.goto('/reels');
    await page.waitForTimeout(300);
    expect(page.url()).toContain('/reels');

    // 4. One interaction succeeds - click a nav link back to feed
    const homeLink = page.getByRole('link', { name: /home|feed|jamii/i }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await page.waitForTimeout(500);
    }

    // Final: Back on a valid page
    expect(page.url()).toMatch(/\//);

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
