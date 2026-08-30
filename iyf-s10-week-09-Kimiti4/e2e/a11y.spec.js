import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility compliance gate.
 * Run: npx playwright test e2e/a11y.spec.js
 * Requires: npm i -D @axe-core/playwright
 */
test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/posts', (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ posts: [{ _id: '1', content: 'Accessible test post', author: 'User' }] }),
          })
        : route.continue()
    );
  });

  async function checkAccessibility(page, testInfo) {
    // Wait for all Framer Motion entrance animations (parents and staggered
    // children) to complete so axe measures final colors/opacity instead of
    // mid-animation (opacity:0) states that yield blended backgrounds.
    await page.waitForFunction(() => {
      const els = document.querySelectorAll('body *');
      for (const el of els) {
        const o = parseFloat(getComputedStyle(el).opacity || '1');
        if (o > 0 && o < 0.99) return false;
      }
      return true;
    }, undefined, { timeout: 15000 }).catch(() => {
      // If animations run forever, proceed; axe will still flag real issues.
    });

    const { violations } = await new AxeBuilder({ page }).analyze();
    if (violations.length > 0) {
      testInfo.attachments.push({
        name: 'a11y-violations',
        contentType: 'application/json',
        body: JSON.stringify(violations, null, 2),
      });
    }
    const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(critical, `Critical/serious a11y violations: ${violations.map((v) => v.id).join(', ')}`).toHaveLength(0);
  }

  test('feed is accessible and keyboard-navigable', async ({ page }, testInfo) => {
    await page.goto('/');
    await checkAccessibility(page, testInfo);
    await page.keyboard.press('Tab');
    await expect(page.locator('a:focus, button:focus').first()).toBeVisible();
  });

  test('drafts page is accessible', async ({ page, context }, testInfo) => {
    // Seed auth so ProtectedRoute renders DraftsPage instead of redirecting to /login
    await context.addInitScript(() => {
      localStorage.setItem('token', 'test-token-for-a11y');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-a11y',
        email: 'a11y@jamii.link',
        username: 'a11yuser',
        role: 'user',
      }));
    });
    // Mock the boot-time token verification so the seeded session survives
    // AuthContext.initializeAuth() and we actually scan DraftsPage (not the
    // login page we'd otherwise be redirected to).
    await context.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'test-user-a11y',
            email: 'a11y@jamii.link',
            username: 'a11yuser',
            role: 'user',
          },
        }),
      })
    );
    await page.goto('/drafts');
    // Guard: confirm we're really on DraftsPage, not redirected to /login
    await expect(page.getByText(/No pending drafts/i).first()).toBeVisible();
    await checkAccessibility(page, testInfo);
  });

  test('login page is accessible', async ({ page }, testInfo) => {
    await page.goto('/login');
    await checkAccessibility(page, testInfo);
    // Labels should be present on the email/password fields
    await expect(page.locator('label')).not.toHaveCount(0);
  });
});
