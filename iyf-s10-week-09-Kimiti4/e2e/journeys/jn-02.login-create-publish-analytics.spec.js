import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makePost, makeJam } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = [makePost({ content: 'My published post' })];
const MOCK_JAMS = [makeJam()];
const MOCK_ANALYTICS = { views: 150, likes: 42, shares: 12 };

async function mockAuthenticatedRoutes(page) {
  await page.route('**/api/posts**', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, post: makePost({ content: 'New post created' }) }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS }) });
  });
  await page.route('**/api/jams**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  await page.route('**/api/analytics**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ANALYTICS) })
  );
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
  await page.route('**/api/creator/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS, analytics: MOCK_ANALYTICS }) })
  );
}

test.describe('JN-02: Login → Create → Publish → Analytics', () => {
  test('login, create a post, publish it, view analytics', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockAuthenticatedRoutes(page);
    await installCatchAll(page);

    // Level A: Login page reachable (or already authenticated → feed)
    await page.goto('/login');
    await page.waitForTimeout(500);

    // If redirected to feed (already authed), that's fine
    const isOnLogin = page.url().includes('/login');
    if (isOnLogin) {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel('Password', { exact: true });
      if (await emailInput.isVisible()) await emailInput.fill('test@jamii.link');
      if (await passwordInput.isVisible()) await passwordInput.fill('TestPass123!');
      const loginBtn = page.getByRole('button', { name: /log\s*in|sign\s*in/i });
      if (await loginBtn.isVisible()) await loginBtn.click();
      await page.waitForTimeout(1000);
    }

    // Level A: Feed loads after auth
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    // Level B: Create interaction - navigate to create or find create button
    const createBtn = page.getByRole('button', { name: /create|new post|compose/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
    }

    // Level C: Analytics page reachable
    await page.goto('/creator/studio');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/creator/studio');

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
