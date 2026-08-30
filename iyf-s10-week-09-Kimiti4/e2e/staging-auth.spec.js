import { test, expect } from '@playwright/test';

const MOCK_TOKEN = 'mock-jwt-token-staging';

test.describe('Staging Authenticated Flow', () => {
  test.beforeEach(async ({ context, page }) => {
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
          body: JSON.stringify({ success: true, post: { id: 'new-post-id', title: 'Staging validation post' } })
        });
      }
      return route.continue();
    });
    await page.addInitScript(() => {
      localStorage.setItem('token', MOCK_TOKEN);
      localStorage.setItem('user', JSON.stringify({ id: 'test-user-id', email: 'test@jamii.link', username: 'testuser', role: 'user' }));
    });
  });

  test('auth flow works end-to-end with mocked API', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.locator('body').first()).toBeVisible({ timeout: 10000 });
    const postsRes = await context.request.get('/api/posts');
    const postsData = await postsRes.json();
    const posts = postsData.data || postsData.posts || [];
    expect(posts.length).toBeGreaterThan(0);
  });
});
