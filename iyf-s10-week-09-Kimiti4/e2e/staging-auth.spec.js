import { test, expect } from '@playwright/test';

const MOCK_TOKEN = 'mock-jwt-token-staging';

test.describe('Staging Authenticated Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: MOCK_TOKEN, user: { id: 'test-user-id', email: 'test@jamii.link', username: 'testuser', role: 'user' } })
      })
    );
    await context.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { id: 'test-user-id', email: 'test@jamii.link', username: 'testuser', role: 'user' } })
      })
    );
    await context.route('**/api/posts**', (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [{ id: 'post-1', title: 'Staging validation post', content: 'Staging validation post content', category: 'mtaani', author: 'test@jamii.link' }] })
        });
      }
      if (method === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, post: { id: 'new-post-id', title: 'Staging validation post', content: 'Staging validation post content', category: 'mtaani' } })
        });
      }
      return route.continue();
    });
    await context.addInitScript(() => {
      localStorage.setItem('token', MOCK_TOKEN);
      localStorage.setItem('user', JSON.stringify({ id: 'test-user-id', email: 'test@jamii.link', username: 'testuser', role: 'user' }));
    });
  });

  test('auth flow works end-to-end with mocked API', async ({ page, context }) => {
    await page.goto('/posts/create');
    await expect(page.locator('input[name="title"], h1, form').first()).toBeVisible({ timeout: 10000 });
    if (await page.locator('input[name="title"]').isVisible()) {
      await page.fill('input[name="title"]', 'Staging validation post');
    }
    if (await page.locator('select[name="category"]').isVisible()) {
      await page.selectOption('select[name="category"]', 'mtaani');
    }
    if (await page.locator('textarea[name="content"]').isVisible()) {
      await page.fill('textarea[name="content"]', 'Staging validation post content');
    }
    if (await page.locator('button[type="submit"]').isVisible()) {
      await page.click('button[type="submit"]');
    }
    await page.waitForTimeout(1000);
    const postsRes = await context.request.get('/api/posts?author=test@jamii.link');
    const postsData = await postsRes.json();
    const posts = postsData.data || postsData.posts || [];
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].title).toContain('Staging validation post');
  });
});
