import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makePost, makeAlert, makeJam, makeReel } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = Array.from({ length: 3 }, () => makePost());
const MOCK_ALERTS = [makeAlert({ severity: 'emergency' }), makeAlert({ severity: 'info' })];
const MOCK_JAMS = [makeJam(), makeJam({ status: 'completed' })];
const MOCK_REELS = [makeReel(), makeReel()];

async function mockAllRoutes(page) {
  await page.route('**/api/posts*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS, total: MOCK_POSTS.length }) })
  );
  await page.route('**/api/posts/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS, total: MOCK_POSTS.length }) })
  );
  await page.route('**/api/alerts*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ alerts: MOCK_ALERTS }) })
  );
  await page.route('**/api/alerts/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ alerts: MOCK_ALERTS }) })
  );
  await page.route('**/api/jams*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  await page.route('**/api/jams/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  // Discovery endpoints are intentionally not page-mocked: discoveryApi
  // unwraps `data.categories || data` / `data.posts || []`, and a wrong
  // shaped envelope (e.g. {trending:[...]}) reaches `categories.map` and
  // crashes DiscoveryPage. The fixture catch-all serves the safe '[]'
  // contract for all five /discover/* endpoints instead.
  await page.route('**/api/reels*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reels: MOCK_REELS }) })
  );
  await page.route('**/api/reels/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reels: MOCK_REELS }) })
  );
  await page.route('**/api/notifications*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
  await page.route('**/api/notifications/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
  // Mock socket.io polling to prevent uncontrolled external traffic
  // (the app auto-connects a realtime socket on boot).
  await page.route('**/socket.io/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' })
  );
}

test.describe('JN-01: Register → Feed → Discover → Profile → Alerts', () => {
  test('complete journey from registration to alerts', async ({ unauthenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockAllRoutes(page);
    await installCatchAll(page);

    let registrationPayload = null;
    await page.route('**/api/auth/register', (route) => {
      registrationPayload = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'e2e-new-token',
          user: { id: 'usr_new', username: 'newuser', email: 'new@jamii.link', role: 'user' },
        }),
      });
    });

    // Level A: Reachability - register page loads
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /join.*jamii/i })).toBeVisible();

    // Level B: Interaction - every required field must be discoverable and filled.
    await page.getByLabel(/full name/i).fill('newuser');
    await page.getByLabel(/email/i).fill('new@jamii.link');
    await page.getByLabel(/^password/i).fill('TestPass123!');
    await page.getByLabel(/confirm password/i).fill('TestPass123!');
    await page.getByRole('button', { name: /join jamiilink/i }).click();

    // Level C: Outcome - successful registration should reach the login page.
    await expect(page).toHaveURL(/\/login$/);
    expect(registrationPayload).toMatchObject({ username: 'newuser', email: 'new@jamii.link' });
    expect(registrationPayload.password).toBe('TestPass123!');

    // Seed auth for post-registration navigation (register mock doesn't persist token in app state)
    const { seedAuth } = await import('../fixtures/auth.js');
    await seedAuth(page.context(), { id: 'usr_new', username: 'newuser', email: 'new@jamii.link', role: 'user' });

    // Level A: Feed loads
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).first()).toBeVisible();

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
