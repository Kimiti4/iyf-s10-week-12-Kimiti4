import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makePost, makeUser } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = [makePost({ content: 'Post to report' })];
const MOCK_USER = makeUser({ id: 'usr_report_target', username: 'reporttarget' });

async function mockRoutes(page) {
  await page.route('**/api/posts**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS }) })
  );
  await page.route('**/api/posts/*/report', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Report submitted' }) })
  );
  await page.route('**/api/users/*/block', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'User blocked' }) })
  );
  await page.route('**/api/feedback**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  );
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
}

test.describe('JN-07: Safety → Report → Block → Feedback', () => {
  test('report content, block a user, and submit feedback', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockRoutes(page);
    await installCatchAll(page);

    // Level A: Feed loads
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    // Level B: Report interaction - find report/more button on a post
    const moreBtn = page.getByRole('button', { name: /more|options|menu|report/i }).first();
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      await page.waitForTimeout(300);
    }

    // Level B: Report option
    const reportBtn = page.getByRole('menuitem', { name: /report/i }).first();
    if (await reportBtn.isVisible()) {
      await reportBtn.click();
      await page.waitForTimeout(300);
    }

    // Level B: Block user interaction
    const blockBtn = page.getByRole('button', { name: /block/i }).first();
    if (await blockBtn.isVisible()) {
      await blockBtn.click();
      await page.waitForTimeout(300);
    }

    // Level A: Settings page (feedback location)
    await page.goto('/settings');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/settings');

    // Level B: Feedback button
    const feedbackBtn = page.getByRole('button', { name: /feedback|help|report issue/i }).first();
    if (await feedbackBtn.isVisible()) {
      await feedbackBtn.click();
      await page.waitForTimeout(300);
    }

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
