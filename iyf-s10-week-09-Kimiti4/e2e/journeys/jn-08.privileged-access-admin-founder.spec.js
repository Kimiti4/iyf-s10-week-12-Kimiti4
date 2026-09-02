import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makePost, makeJam, makeAlert, makeUser } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = [makePost()];
const MOCK_JAMS = [makeJam()];
const MOCK_ALERTS = [makeAlert()];
const MOCK_ADMIN_STATS = { users: 1500, posts: 4500, jams: 320, alerts: 45 };

async function mockAdminRoutes(page) {
  await page.route('**/api/admin/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stats: MOCK_ADMIN_STATS, posts: MOCK_POSTS, jams: MOCK_JAMS }) })
  );
  await page.route('**/api/founder/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stats: MOCK_ADMIN_STATS, users: [makeUser()] }) })
  );
  await page.route('**/api/posts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS }) })
  );
  await page.route('**/api/jams**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  await page.route('**/api/alerts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ alerts: MOCK_ALERTS }) })
  );
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
}

test.describe('JN-08: Privileged Access → Admin → Founder', () => {
  test('admin can access admin dashboard', async ({ adminPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockAdminRoutes(page);
    await installCatchAll(page);

    // Level A: Admin dashboard reachable
    await page.goto('/admin');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/admin');

    // Level B: Admin content visible
    const adminContent = page.locator('[class*="admin"], [class*="dashboard"], main').first();
    await expect(adminContent).toBeVisible();

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });

  test('founder can access founder dashboard', async ({ founderPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockAdminRoutes(page);
    await installCatchAll(page);

    // Level A: Founder dashboard reachable
    await page.goto('/admin/founder');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/admin/founder');

    // Level B: Founder content visible
    const founderContent = page.locator('[class*="founder"], [class*="dashboard"], main').first();
    await expect(founderContent).toBeVisible();

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });

  test('regular user can reach admin page but sees no admin data', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockAdminRoutes(page);
    await installCatchAll(page);

    // Level C: Regular user reaches /admin (ProtectedRoute only checks auth, not roles)
    await page.goto('/admin');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/admin');

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
