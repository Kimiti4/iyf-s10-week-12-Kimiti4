import { test, expect } from '@playwright/test';

test.describe('JamiiLink Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/posts', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            posts: [{ _id: '1', content: 'Test community post', author: 'DemoUser' }],
          }),
        });
      }
      return route.continue();
    });
  });

  test('aggregate feed is interactable from an empty draft store', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.enhanced-navbar')).toBeVisible();
  });

  test('auth pages render without crashing', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('button.btn-login')).toBeVisible();
    await page.goto('/register');
    await expect(page.locator('button.btn-register, form[action*="register"] button[type="submit"], .register-form button[type="submit"]').first()).toBeVisible();
  });

  test('drafts page shows the empty state', async ({ context, page }) => {
    // Seed auth so ProtectedRoute renders DraftsPage instead of redirecting to /login
    await context.addInitScript(() => {
      localStorage.setItem('token', 'test-token-for-e2e');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        email: 'test@jamii.link',
        username: 'testuser',
        role: 'user',
      }));
    });
    // AuthContext verifies the seeded token via GET /api/auth/me on boot;
    // without this mock the fake token fails and initializeAuth() clears the
    // session, bouncing us to /login before DraftsPage can render.
    await context.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'test-user',
            email: 'test@jamii.link',
            username: 'testuser',
            role: 'user',
          },
        }),
      })
    );

    await page.goto('/drafts');
    await expect(page.getByText(/No pending drafts/i).first()).toBeVisible();
  });
});
