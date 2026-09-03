import { test, expect } from '@playwright/test';

const API = '**/api/tf/**';

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
};

const mockOrg = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  description: 'A test org',
  role: 'owner',
};

const mockProject = {
  id: 'proj-1',
  name: 'Test Project',
  description: 'Project description',
  status: 'active',
  priority: 'medium',
  org_id: 'org-1',
  owner_id: 'user-1',
  task_count: 0,
  created_at: '2026-01-01T00:00:00Z',
};

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Task description',
  status: 'todo',
  priority: 'medium',
  project_id: 'proj-1',
  assignee_id: null,
  created_by: 'user-1',
  position: 0,
  labels: [],
  created_at: '2026-01-01T00:00:00Z',
};

const mockMember = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: null,
  role: 'owner',
};

const mockLabel = {
  id: 'label-1',
  name: 'Bug',
  color: '#ef4444',
  org_id: 'org-1',
};

function setupAuthMock(page) {
  page.route('**/api/tf/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockUser }),
    })
  );
}

function setupOrgMock(page) {
  page.route('**/api/tf/orgs', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockOrg]),
      });
    }
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          org: { ...mockOrg, name: body.name, description: body.description },
        }),
      });
    }
    return route.continue();
  });
}

function setupMembersMock(page) {
  page.route('**/api/tf/orgs/*/members', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockMember]),
      });
    }
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ member: { ...mockMember, id: 'user-2', email: 'new@example.com', role: 'member' } }),
      });
    }
    return route.continue();
  });
}

function setupProjectsMock(page) {
  page.route('**/api/tf/projects?**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockProject]),
      });
    }
    return route.continue();
  });
  page.route('**/api/tf/projects', (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ project: { ...mockProject, name: body.name, description: body.description } }),
      });
    }
    return route.continue();
  });
}

function setupProjectDetailMock(page) {
  page.route('**/api/tf/projects/proj-1', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ project: mockProject }),
      });
    }
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ project: { ...mockProject, ...body } }),
      });
    }
    if (route.request().method() === 'DELETE') {
      return route.fulfill({ status: 204 });
    }
    return route.continue();
  });
}

function setupTasksMock(page) {
  page.route('**/api/tf/projects/proj-1/tasks**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockTask]),
      });
    }
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ task: { ...mockTask, title: body.title, description: body.description } }),
      });
    }
    return route.continue();
  });
  page.route('**/api/tf/tasks/task-1', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ task: { ...mockTask, assignee: null, creator: mockUser } }),
      });
    }
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ task: { ...mockTask, ...body } }),
      });
    }
    if (route.request().method() === 'DELETE') {
      return route.fulfill({ status: 204 });
    }
    return route.continue();
  });
  page.route('**/api/tf/tasks/task-1/move', (route) => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ task: { ...mockTask, status: body.status } }),
      });
    }
    return route.continue();
  });
}

function setupDashboardMock(page) {
  page.route('**/api/tf/dashboard**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_projects: 1,
        total_tasks: 3,
        tasks_by_status: { todo: 1, in_progress: 1, in_review: 0, done: 1 },
        recent_activity: [
          {
            id: 'act-1',
            user: { id: 'user-1', name: 'Test User', avatar_url: null },
            action: 'created',
            entity_type: 'task',
            created_at: '2026-01-01T12:00:00Z',
          },
        ],
      }),
    })
  );
}

function setupLabelsMock(page) {
  page.route('**/api/tf/labels**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockLabel]),
      });
    }
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ label: mockLabel }),
      });
    }
    return route.continue();
  });
}

function setupSearchMock(page) {
  page.route('**/api/tf/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockTask]),
    })
  );
}

function setupAllMocks(page) {
  setupAuthMock(page);
  setupOrgMock(page);
  setupMembersMock(page);
  setupProjectsMock(page);
  setupProjectDetailMock(page);
  setupTasksMock(page);
  setupDashboardMock(page);
  setupLabelsMock(page);
  setupSearchMock(page);
}

function seedAuth(context) {
  return context.addInitScript(() => {
    localStorage.setItem('taskflow_token', 'test-token-e2e');
  });
}

test.describe('Auth Flow', () => {
  test('register page renders and shows form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('#reg-name')).toBeVisible();
    await expect(page.locator('#reg-email')).toBeVisible();
    await expect(page.locator('#reg-password')).toBeVisible();
    await expect(page.locator('#reg-confirm')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('login page renders and shows form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('register redirects to dashboard on success', async ({ page, context }) => {
    await page.route('**/api/tf/auth/register', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUser, token: 'test-token' }),
      })
    );
    setupOrgMock(page);
    setupDashboardMock(page);

    await page.goto('/register');
    await page.fill('#reg-name', 'Test User');
    await page.fill('#reg-email', 'test@example.com');
    await page.fill('#reg-password', 'password123');
    await page.fill('#reg-confirm', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tf/);
  });

  test('login redirects to dashboard on success', async ({ page }) => {
    await page.route('**/api/tf/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUser, token: 'test-token' }),
      })
    );
    setupOrgMock(page);
    setupDashboardMock(page);

    await page.goto('/login');
    await page.fill('#login-email', 'test@example.com');
    await page.fill('#login-password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tf/);
  });

  test('logout redirects to login', async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);

    await page.goto('/tf');
    await expect(page.locator('.sidebar')).toBeVisible();

    await page.click('[aria-label="Logout"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.route('**/api/tf/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    );

    await page.goto('/login');
    await page.fill('#login-email', 'wrong@example.com');
    await page.fill('#login-password', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });
});

test.describe('Organization', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('create organization shows form and submits', async ({ page }) => {
    await page.goto('/tf/organizations');
    await expect(page.getByText('Organizations')).toBeVisible();

    await page.click('[aria-label="Create organization"]');
    await expect(page.getByText('Create Organization')).toBeVisible();

    await page.fill('#org-name', 'New Org');
    await page.fill('#org-desc', 'A new org');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Organization created!')).toBeVisible();
  });

  test('view members list', async ({ page }) => {
    await page.goto('/tf/organizations');
    await expect(page.getByText('Members')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
  });

  test('invite member', async ({ page }) => {
    await page.goto('/tf/organizations');
    await page.fill('input[type="email"]', 'new@example.com');
    await page.click('button:has-text("Invite")');
    await expect(page.getByText('Invitation sent!')).toBeVisible();
  });
});

test.describe('Project CRUD', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('projects page lists projects', async ({ page }) => {
    await page.goto('/tf/projects');
    await expect(page.getByText('Test Project')).toBeVisible();
  });

  test('create project via form', async ({ page }) => {
    await page.goto('/tf/projects');
    await page.click('[aria-label="Create project"]');
    await expect(page.getByText('Create Project')).toBeVisible();

    await page.fill('#proj-name', 'New Project');
    await page.fill('#proj-desc', 'Description');
    await page.click('button[type="submit"]:has-text("Create Project")');
    await expect(page.getByText('Project created!')).toBeVisible();
  });

  test('project detail page shows project info', async ({ page }) => {
    await page.goto('/tf/projects/proj-1');
    await expect(page.getByText('Test Project')).toBeVisible();
    await expect(page.getByText('Board')).toBeVisible();
  });

  test('archive project from settings tab', async ({ page }) => {
    await page.route('**/api/tf/projects/proj-1', (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ project: { ...mockProject, status: 'archived' } }),
        });
      }
      return route.continue();
    });

    await page.goto('/tf/projects/proj-1');
    await page.click('button:has-text("Settings")');
    await page.click('button:has-text("Archive Project")');
    await expect(page.getByText('Project archived')).toBeVisible();
  });

  test('delete project navigates back to list', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    await page.goto('/tf/projects/proj-1');
    await page.click('button:has-text("Settings")');
    await page.click('button:has-text("Delete Project")');
    await expect(page).toHaveURL(/\/tf\/projects$/);
  });
});

test.describe('Task CRUD', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('create task from project detail', async ({ page }) => {
    await page.goto('/tf/projects/proj-1');
    await page.click('button:has-text("Add Task")');
    await expect(page.locator('.task-modal, [role="dialog"]')).toBeVisible();
  });

  test('task detail page shows task info', async ({ page }) => {
    await page.goto('/tf/projects/proj-1/tasks/task-1');
    await expect(page.getByDisplayValue('Test Task')).toBeVisible();
    await expect(page.getByText('Description')).toBeVisible();
  });

  test('update task status via select', async ({ page }) => {
    await page.goto('/tf/projects/proj-1/tasks/task-1');
    await page.selectOption('#td-status', 'in_progress');
    await page.click('button:has-text("Save Changes")');
    await expect(page.getByText('Task updated!')).toBeVisible();
  });

  test('delete task navigates back', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    await page.goto('/tf/projects/proj-1/tasks/task-1');
    await page.click('[aria-label="Delete task"]');
    await expect(page).toHaveURL(/\/tf\/projects\/proj-1$/);
  });
});

test.describe('Board View', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('board page renders columns', async ({ page }) => {
    await page.goto('/tf/projects/proj-1/board');
    await expect(page.getByText('Todo')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Review')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();
  });

  test('board shows task in correct column', async ({ page }) => {
    await page.goto('/tf/projects/proj-1/board');
    await expect(page.getByText('Test Task')).toBeVisible();
  });

  test('board columns show task counts', async ({ page }) => {
    await page.goto('/tf/projects/proj-1/board');
    const todoColumn = page.locator('[aria-label="Todo column"]');
    await expect(todoColumn.getByText('1')).toBeVisible();
  });

  test('board has back to project link', async ({ page }) => {
    await page.goto('/tf/projects/proj-1/board');
    await expect(page.getByText('Back to Project')).toBeVisible();
  });
});

test.describe('Search', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('search API is mocked and callable', async ({ page }) => {
    await page.goto('/tf');
    const response = await page.request.get('http://localhost:5175/api/tf/search?q=test&org_id=org-1');
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('dashboard shows stats cards', async ({ page }) => {
    await page.goto('/tf');
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Projects')).toBeVisible();
    await expect(page.getByText('Total Tasks')).toBeVisible();
  });

  test('dashboard shows recent projects', async ({ page }) => {
    await page.goto('/tf');
    await expect(page.getByText('Recent Projects')).toBeVisible();
    await expect(page.getByText('Test Project')).toBeVisible();
  });

  test('dashboard shows recent activity', async ({ page }) => {
    await page.goto('/tf');
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('sidebar has all nav links', async ({ page }) => {
    await page.goto('/tf');
    const sidebar = page.locator('[role="navigation"]');
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Organizations')).toBeVisible();
    await expect(sidebar.getByText('Projects')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();
  });

  test('sidebar shows user info', async ({ page }) => {
    await page.goto('/tf');
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('sidebar shows org selector', async ({ page }) => {
    await page.goto('/tf');
    await expect(page.getByText('Test Organization')).toBeVisible();
  });

  test('navigating to / redirects to /tf', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/tf/);
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/tf/settings');
    await expect(page.getByText('Settings')).toBeVisible();
  });
});

test.describe('Responsive', () => {
  test.beforeEach(async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);
  });

  test('mobile viewport shows menu button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tf');
    await expect(page.locator('[aria-label="Open menu"]')).toBeVisible();
  });

  test('mobile menu opens sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tf');
    await page.click('[aria-label="Open menu"]');
    await expect(page.locator('.sidebar')).toHaveClass(/sidebar-open/);
  });

  test('mobile menu closes when overlay clicked', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tf');
    await page.click('[aria-label="Open menu"]');
    await page.click('.sidebar-overlay');
    await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);
  });

  test('dashboard stats visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tf');
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Projects')).toBeVisible();
  });
});

test.describe('Error States', () => {
  test('invalid login shows error toast', async ({ page }) => {
    await page.route('**/api/tf/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    );

    await page.goto('/login');
    await page.fill('#login-email', 'bad@example.com');
    await page.fill('#login-password', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('empty projects page shows CTA', async ({ page, context }) => {
    await seedAuth(context);
    setupAuthMock(page);
    setupOrgMock(page);
    setupMembersMock(page);
    setupDashboardMock(page);
    setupLabelsMock(page);
    setupSearchMock(page);

    await page.route('**/api/tf/projects?**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    );

    await page.goto('/tf/projects');
    await expect(page.getByText(/no projects/i)).toBeVisible();
    await expect(page.getByText(/create your first project/i)).toBeVisible();
  });

  test('empty organizations shows CTA', async ({ page, context }) => {
    await seedAuth(context);
    setupAuthMock(page);
    setupDashboardMock(page);
    setupProjectsMock(page);
    setupMembersMock(page);
    setupLabelsMock(page);
    setupSearchMock(page);

    await page.route('**/api/tf/orgs', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      return route.continue();
    });

    await page.goto('/tf/organizations');
    await expect(page.getByText(/no organizations/i)).toBeVisible();
  });

  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/tf');
    await expect(page).toHaveURL(/\/login/);
  });

  test('404 page renders for unknown routes', async ({ page, context }) => {
    await seedAuth(context);
    setupAllMocks(page);

    await page.goto('/tf/nonexistent-page');
    await expect(page.getByText(/not found/i).or(page.getByText(/404/i))).toBeVisible();
  });
});
