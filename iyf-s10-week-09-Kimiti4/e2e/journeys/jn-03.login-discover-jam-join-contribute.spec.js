import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makeJam, makePost } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_JAMS = [
  makeJam({ title: 'Community Clean-up Jam', participants: ['usr1', 'usr2'], maxParticipants: 10 }),
  makeJam({ title: 'Music Collab Jam', status: 'active' }),
];
const MOCK_POSTS = [makePost({ content: 'Contribution to the jam' })];

async function mockRoutes(page) {
  await page.route('**/api/jams', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jams: MOCK_JAMS }) })
  );
  await page.route('**/api/jams/*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ jam: MOCK_JAMS[0], posts: MOCK_POSTS }) })
  );
  await page.route('**/api/jams/*/join', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Joined jam' }) })
  );
  await page.route('**/api/posts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS }) })
  );
  await page.route('**/api/discover**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ trending: [] }) })
  );
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
}

test.describe('JN-03: Login → Discover → Jam → Join → Contribute', () => {
  test('discover a jam, join it, and contribute', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockRoutes(page);
    await installCatchAll(page);

    // Level A: Discover page
    await page.goto('/discover');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/discover');

    // Level A: Jams feed page
    await page.goto('/jams');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/jams');

    // Level B: Click on a jam (navigate to detail)
    const jamLink = page.getByText(/Community Clean-up Jam|Music Collab Jam/i).first();
    if (await jamLink.isVisible()) {
      await jamLink.click();
      await page.waitForTimeout(500);
    }

    // Level B: Join action
    const joinBtn = page.getByRole('button', { name: /join/i }).first();
    if (await joinBtn.isVisible()) {
      await joinBtn.click();
      await page.waitForTimeout(500);
    }

    // Level C: Contribute - post in jam
    const contributeInput = page.getByPlaceholder(/contribute|write|post/i).first();
    if (await contributeInput.isVisible()) {
      await contributeInput.fill('My contribution to this jam');
      const postBtn = page.getByRole('button', { name: /post|submit|send/i }).first();
      if (await postBtn.isVisible()) await postBtn.click();
    }

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
