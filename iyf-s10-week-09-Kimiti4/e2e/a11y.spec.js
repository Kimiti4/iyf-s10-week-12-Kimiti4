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

  test('drafts page is accessible', async ({ page }, testInfo) => {
    await page.goto('/drafts');
    await checkAccessibility(page, testInfo);
  });

  test('login page is accessible', async ({ page }, testInfo) => {
    await page.goto('/login');
    await checkAccessibility(page, testInfo);
    // Labels should be present on the email/password fields
    await expect(page.locator('label')).not.toHaveCount(0);
  });
});
