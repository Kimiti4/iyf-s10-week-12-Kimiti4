import { test, expect } from '@playwright/test';

const STAGING_API = process.env.STAGING_API_URL || 'https://iyf-s10-week-12-kimiti4.up.railway.app';
const TEST_USER = { email: 'test@jamii.link', password: 'TestPass123!' };

test.describe('Staging Authenticated Flow', () => {
  test.beforeAll(async ({ request }) => {
    await request.post(`${STAGING_API}/api/test/seed`);
  });

  test.afterAll(async ({ request }) => {
    await request.delete(`${STAGING_API}/api/test/cleanup`);
  });

  test('real auth → post → verify in DB', async ({ page, context }) => {
    const res = await context.request.post(`${STAGING_API}/api/auth/login`, {
      data: TEST_USER
    });
    const { token } = await res.json();

    await context.addInitScript(([t]) => {
      localStorage.setItem('token', t);
    }, [token]);

    await page.goto('/original/posts/create');
    await page.waitForTimeout(1000);

    await page.fill('input[name="title"]', 'Staging validation post');
    await page.selectOption('select[name="category"]', 'mtaani');
    await page.fill('textarea[name="content"]', 'Staging validation post content');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const postsRes = await context.request.get(`${STAGING_API}/api/posts?author=${TEST_USER.email}`);
    const postsData = await postsRes.json();
    const posts = postsData.data || postsData.posts || [];
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].title).toContain('Staging validation post');
  });
});
