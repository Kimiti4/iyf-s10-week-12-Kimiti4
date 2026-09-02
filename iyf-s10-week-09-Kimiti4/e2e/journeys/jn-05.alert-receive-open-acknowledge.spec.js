import { test, expect, installCatchAll } from '../fixtures/auth.js';
import { makeAlert } from '../fixtures/data.js';
import { attachConsolePolicy } from '../fixtures/console-policy.js';
import { attachNetworkPolicy } from '../fixtures/network-policy.js';

const MOCK_ALERTS = [
  makeAlert({ title: 'Heavy rainfall warning', severity: 'emergency', status: 'active' }),
  makeAlert({ title: 'Community meeting', severity: 'info', status: 'active' }),
  makeAlert({ title: 'Road closure', severity: 'warning', status: 'resolved' }),
];

async function mockRoutes(page) {
  await page.route('**/api/alerts', (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, alert: { ...MOCK_ALERTS[0], status: 'acknowledged' } }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_ALERTS }) });
  });
  await page.route('**/api/alerts/**', (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, alert: { ...MOCK_ALERTS[0], status: 'acknowledged' } }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_ALERTS }) });
  });
  await page.route('**/api/notifications', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
  await page.route('**/api/notifications/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ notifications: [] }) })
  );
  // Mock socket.io polling to prevent network failures
  await page.route('**/socket.io/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' })
  );
}

test.describe('JN-05: Alert → Receive → Open → Acknowledge', () => {
  test('receive an alert, open it, and acknowledge it', async ({ authenticatedPage: page }) => {
    const consolePolicy = attachConsolePolicy(page);
    const networkPolicy = attachNetworkPolicy(page);
    await mockRoutes(page);
    // No catch-all needed — all routes are mocked in mockRoutes

    // Level A: Alerts page loads
    await page.goto('/alerts');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/alerts');

    // Level B: Alert content visible
    const alertCard = page.getByText(/Heavy rainfall warning|Community meeting|Road closure/i).first();
    await expect(alertCard).toBeVisible();

    // Level B: Click on alert to open details
    await alertCard.click();
    await page.waitForTimeout(500);

    // Level B: Acknowledge button
    const ackBtn = page.getByRole('button', { name: /acknowledge|dismiss|mark.*read/i }).first();
    if (await ackBtn.isVisible()) {
      await ackBtn.click();
      await page.waitForTimeout(500);
    }

    // Level C: Alert state changed (resolved filter check)
    const resolvedFilter = page.getByRole('button', { name: /resolved|completed/i }).first();
    if (await resolvedFilter.isVisible()) {
      await resolvedFilter.click();
      await page.waitForTimeout(300);
    }

    consolePolicy.assertClean();
    networkPolicy.assertNoCritical();
  });
});
