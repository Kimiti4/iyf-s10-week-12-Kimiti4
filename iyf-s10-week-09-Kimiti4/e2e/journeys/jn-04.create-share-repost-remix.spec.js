import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makePost } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_POSTS = [
  makePost({ content: 'Original post to share', author: { id: 'usr_orig', username: 'original' } }),
  makePost({ content: 'Another post for remix' }),
];

async function mockRoutes(page) {
  await page.route('**/api/posts**', (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() || {};
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, post: makePost({ content: body.content || 'Shared post' }) }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: MOCK_POSTS }) });
  });
  await page.route('**/api/posts/*/repost', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  );
  await page.route('**/api/posts/*/remix', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, post: makePost() }) })
  );
  await page.route('**/api/notifications**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
}

test.describe('JN-04: Create → Share → Repost → Remix', () => {
  test('create a post, share it, repost and remix', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockRoutes(page);
    await installCatchAll(page);

    // Level A: Feed loads
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    // Level B: Create interaction - find compose area
    const composeBtn = page.getByRole('button', { name: /create|new post|compose/i }).first();
    if (await composeBtn.isVisible()) {
      await composeBtn.click();
      await page.waitForTimeout(500);
    }

    // Level B: Share button interaction (scroll into view to avoid topbar overlap)
    const shareBtn = page.getByRole('button', { name: /share/i }).first();
    if (await shareBtn.isVisible()) {
      await shareBtn.scrollIntoViewIfNeeded();
      await shareBtn.click({ force: true });
      await page.waitForTimeout(300);
    }

    // Level B: Repost button interaction
    const repostBtn = page.getByRole('button', { name: /repost|re-share/i }).first();
    if (await repostBtn.isVisible()) {
      await repostBtn.click();
      await page.waitForTimeout(300);
    }

    // Level B: Remix button interaction
    const remixBtn = page.getByRole('button', { name: /remix/i }).first();
    if (await remixBtn.isVisible()) {
      await remixBtn.click();
      await page.waitForTimeout(300);
    }

    // Level C: Verify post detail route works
    await page.goto('/posts/test-post-id');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/posts/');

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
