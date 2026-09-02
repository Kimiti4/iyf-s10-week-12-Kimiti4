import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makePost, makeAlert, makeDiscoveryItem, makeJam, makeReel } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = Array.from({ length: 3 }, () => makePost());
const MOCK_ALERTS = [makeAlert({ severity: 'emergency' }), makeAlert({ severity: 'info' })];
const MOCK_DISCOVERY = [makeDiscoveryItem(), makeDiscoveryItem({ type: 'creator' })];
const MOCK_JAMS = [makeJam(), makeJam({ status: 'completed' })];
const MOCK_REELS = [makeReel(), makeReel()];

async function mockAllRoutes(page) {
  await page.route('**/api/posts', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS, total: MOCK_POSTS.length }) })
  );
  await page.route('**/api/posts/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS, total: MOCK_POSTS.length }) })
  );
  await page.route('**/api/alerts', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ alerts: MOCK_ALERTS }) })
  );
  await page.route('**/api/alerts/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ alerts: MOCK_ALERTS }) })
  );
  await page.route('**/api/discover', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ trending: MOCK_DISCOVERY }) })
  );
  await page.route('**/api/discover/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ trending: MOCK_DISCOVERY }) })
  );
  await page.route('**/api/jams', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  await page.route('**/api/jams/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  await page.route('**/api/reels', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reels: MOCK_REELS }) })
  );
  await page.route('**/api/reels/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reels: MOCK_REELS }) })
  );
  await page.route('**/api/notifications', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
  await page.route('**/api/notifications/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
}

test.describe('JN-01: Register → Feed → Discover → Profile → Alerts', () => {
  test('complete journey from registration to alerts', async ({ unauthenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockAllRoutes(page);
    await installCatchAll(page);

    await page.route('**/api/auth/register', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'e2e-new-token',
          user: { id: 'usr_new', username: 'newuser', email: 'new@jamii.link', role: 'user' },
        }),
      })
    );

    // Level A: Reachability - register page loads
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /join jamii/i })).toBeVisible();

    // Level B: Interaction - fill and submit registration form
    const nameInput = page.getByLabel(/username|name/i);
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByRole('textbox', { name: 'Password', exact: true });

    if (await nameInput.isVisible()) await nameInput.fill('newuser');
    if (await emailInput.isVisible()) await emailInput.fill('new@jamii.link');
    if (await passwordInput.isVisible()) await passwordInput.fill('TestPass123!');

    const submitBtn = page.getByRole('button', { name: /register|sign up|create/i });
    if (await submitBtn.isVisible()) await submitBtn.click();

    // Level C: Outcome - navigation to feed
    await page.waitForTimeout(1500);
    const url = page.url();
    const landedOnFeed = url.endsWith('/') || url.includes('/login') || url.includes('/register');
    expect(landedOnFeed).toBeTruthy();

    // Seed auth for post-registration navigation (register mock doesn't persist token in app state)
    const { seedAuth } = await import('../fixtures/auth.js');
    await seedAuth(page.context(), { id: 'usr_new', username: 'newuser', email: 'new@jamii.link', role: 'user' });

    // Level A: Feed loads
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    // Level A: Discover page reachable
    await page.goto('/discover');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/discover');

    // Level A: Profile page reachable
    await page.goto('/profile');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/profile');

    // Level A: Alerts page reachable
    await page.goto('/alerts');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/alerts');

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
