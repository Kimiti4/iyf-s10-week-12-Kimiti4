import { test as base, expect } from '@playwright/test';

const DEFAULT_USER = {
  id: 'usr_e2e_001',
  username: 'testuser',
  email: 'test@jamii.link',
  role: 'user',
  avatar: '/avatars/default.png',
  bio: 'E2E test user',
};

const ADMIN_USER = {
  id: 'usr_e2e_admin',
  username: 'adminuser',
  email: 'admin@jamii.link',
  role: 'admin',
  avatar: '/avatars/admin.png',
  bio: 'E2E admin user',
};

const FOUNDER_USER = {
  id: 'usr_e2e_founder',
  username: 'founderuser',
  email: 'founder@jamii.link',
  role: 'founder',
  avatar: '/avatars/founder.png',
  bio: 'E2E founder user',
};

async function seedAuth(context, user = DEFAULT_USER) {
  const token = `e2e-token-${user.id}`;
  await context.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });

  await context.route('**/api/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user }),
    })
  );
}

async function seedUnauthenticated(context) {
  await context.addInitScript(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });

  await context.route('**/api/auth/me', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: 'Not authenticated' }),
    })
  );
}

/** Install a per-page catch-all for unmocked API routes.
 *  Must be called AFTER test-specific page.route() calls so page routes
 *  take priority.  Prevents CORS failures from the real Railway backend. */
function installCatchAll(page) {
  return page.route('**/api/**', (route) => {
    const url = route.request().url();
    if (/\/(categories|suggested-users|trending|for-you|search)/.test(url)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}

function installSocketMock(page) {
  return page.route('**/socket.io/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' })
  );
}

const test = base.extend({
  authenticatedPage: async ({ page, context }, use) => {
    await seedAuth(context, DEFAULT_USER);
    await use(page);
  },

  adminPage: async ({ page, context }, use) => {
    await seedAuth(context, ADMIN_USER);
    await use(page);
  },

  founderPage: async ({ page, context }, use) => {
    await seedAuth(context, FOUNDER_USER);
    await use(page);
  },

  unauthenticatedPage: async ({ page, context }, use) => {
    await seedUnauthenticated(context);
    await use(page);
  },
});

export { test, expect, seedAuth, seedUnauthenticated, installCatchAll, installSocketMock, DEFAULT_USER, ADMIN_USER, FOUNDER_USER };
