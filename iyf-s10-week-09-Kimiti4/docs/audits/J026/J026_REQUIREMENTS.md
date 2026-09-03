# J-026 Requirements Specification

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_BASELINE.md](J026_BASELINE.md), [J026_FEATURE_TRACEABILITY.md](J026_FEATURE_TRACEABILITY.md) |

---

## 1. Authentication Requirements

### REQ-AUTH-001 – User Registration

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-AUTH-001                                                         |
| Title             | User Registration with Email/Password                                 |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Backend (auth routes), Frontend (register page)                       |

**Description:**  
A visitor can register a new account by providing a valid email address and a password meeting minimum security requirements. Upon successful registration, a confirmation is returned and the user can log in.

**Acceptance Criteria:**
- [ ] `POST /api/tf/auth/register` accepts `{ email, password, name }`.
- [ ] Password must be at least 8 characters, contain one uppercase, one lowercase, and one digit.
- [ ] Email is validated for format and uniqueness (case-insensitive).
- [ ] A new user record is created in Supabase `users` table with hashed password (bcrypt).
- [ ] On success, returns `201 Created` with `{ user: { id, email, name, createdAt } }`.
- [ ] On duplicate email, returns `409 Conflict` with `{ error: "Email already registered" }`.
- [ ] Frontend form validates all fields client-side before submission.
- [ ] Frontend redirects to `/tf/login` after successful registration.

---

### REQ-AUTH-002 – User Login with JWT

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-AUTH-002                                                         |
| Title             | User Login with JWT                                                   |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Backend (auth routes), Frontend (login page, auth context)            |

**Description:**  
A registered user can log in with email and password. On success, the server returns a signed JWT access token.

**Acceptance Criteria:**
- [ ] `POST /api/tf/auth/login` accepts `{ email, password }`.
- [ ] Server validates credentials against stored bcrypt hash.
- [ ] On success, returns `200 OK` with `{ token, user: { id, email, name } }`.
- [ ] JWT payload contains `{ userId, email, iat, exp }` with 24-hour expiry.
- [ ] JWT is signed with a server-side secret (`JWT_SECRET` env var).
- [ ] On invalid credentials, returns `401 Unauthorized` with `{ error: "Invalid email or password" }`.
- [ ] Frontend stores token in `localStorage` (see REQ-AUTH-003).
- [ ] Frontend updates auth context with user profile.

---

### REQ-AUTH-003 – Session Persistence via localStorage

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-AUTH-003                                                         |
| Title             | Session Persistence via localStorage                                   |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Frontend (auth context, interceptor)                                  |

**Description:**  
The JWT token and user profile are persisted in `localStorage` so the user remains authenticated across page refreshes and browser restarts until token expiry or explicit logout.

**Acceptance Criteria:**
- [ ] On successful login, token is stored as `localStorage.setItem('tf_token', token)`.
- [ ] User profile is stored as `localStorage.setItem('tf_user', JSON.stringify(user))`.
- [ ] On app load, auth context reads from `localStorage` and validates token expiry.
- [ ] If token is expired, auth context clears stored data and redirects to `/tf/login`.
- [ ] Axios interceptor attaches `Authorization: Bearer <token>` to all `/api/tf/*` requests.
- [ ] On `401` response from API, interceptor clears `localStorage` and redirects to `/tf/login`.

---

### REQ-AUTH-004 – Logout Clears Session

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-AUTH-004                                                         |
| Title             | Logout Clears Session                                                 |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Frontend (auth context, navbar)                                       |

**Description:**  
Clicking logout removes all stored authentication data and redirects the user to the login page.

**Acceptance Criteria:**
- [ ] Logout action calls `localStorage.removeItem('tf_token')` and `localStorage.removeItem('tf_user')`.
- [ ] Auth context is reset to unauthenticated state.
- [ ] User is redirected to `/tf/login`.
- [ ] Any subsequent API call requires re-authentication.
- [ ] Logout is accessible from the navbar regardless of current page.

---

## 2. Organization Requirements

### REQ-ORG-001 – Create Organization

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-ORG-001                                                          |
| Title             | Create Organization                                                   |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Backend (org routes), Frontend (onboarding / org settings)            |

**Description:**  
An authenticated user can create an organization. The creator becomes the owner.

**Acceptance Criteria:**
- [ ] `POST /api/tf/organizations` accepts `{ name, description? }`.
- [ ] An `organizations` record is created with the user as `owner_id`.
- [ ] A `memberships` record is created linking the user to the org with role `owner`.
- [ ] On success, returns `201 Created` with the organization object.
- [ ] Organization name is required and must be 1–100 characters.
- [ ] User can belong to multiple organizations.
- [ ] Frontend form validates name length before submission.

---

### REQ-ORG-002 – Invite Member by Email

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-ORG-002                                                          |
| Title             | Invite Member by Email                                                |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (org member routes), Frontend (org members page)              |

**Description:**  
An org owner or admin can invite a new member by email address.

**Acceptance Criteria:**
- [ ] `POST /api/tf/organizations/:orgId/members` accepts `{ email, role }`.
- [ ] Only `owner` and `admin` roles can invite.
- [ ] If the invited email has a registered user, a `memberships` record is created immediately.
- [ ] If not registered, an `invitations` record is created (email sent when system supports it).
- [ ] Duplicate membership returns `409 Conflict`.
- [ ] Default role for new invite is `member`.

---

### REQ-ORG-003 – Manage Member Roles

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-ORG-003                                                          |
| Title             | Manage Member Roles                                                   |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (org member routes), Frontend (org members page)              |

**Description:**  
An org owner or admin can change a member's role or remove them from the organization.

**Acceptance Criteria:**
- [ ] `PATCH /api/tf/organizations/:orgId/members/:userId` accepts `{ role }`.
- [ ] Roles: `owner`, `admin`, `member`, `viewer`.
- [ ] Only `owner` can assign `owner` role.
- [ ] Only `owner` and `admin` can change roles or remove members.
- [ ] A user cannot remove themselves if they are the sole owner.
- [ ] `DELETE /api/tf/organizations/:orgId/members/:userId` removes membership.

---

## 3. Project Requirements

### REQ-PROJECT-001 – Create Project

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-PROJECT-001                                                       |
| Title             | Create Project                                                        |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Backend (project routes), Frontend (project create modal/page)        |

**Description:**  
An authenticated member of an organization can create a project within that organization.

**Acceptance Criteria:**
- [ ] `POST /api/tf/organizations/:orgId/projects` accepts `{ name, description?, startDate?, endDate? }`.
- [ ] Project name is required, 1–120 characters.
- [ ] User must be a member of the organization.
- [ ] On success, returns `201 Created` with project object including `id`, `name`, `status: active`.
- [ ] Project is created with the authenticated user as `created_by`.

---

### REQ-PROJECT-002 – Edit Project

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-PROJECT-002                                                       |
| Title             | Edit Project                                                          |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (project routes), Frontend (project settings page)            |

**Description:**  
Project members with appropriate permissions can update project details.

**Acceptance Criteria:**
- [ ] `PATCH /api/tf/organizations/:orgId/projects/:projectId` accepts `{ name?, description?, startDate?, endDate? }`.
- [ ] Only project creator, org owner, and org admin can edit.
- [ ] On success, returns `200 OK` with updated project object.
- [ ] Optimistic concurrency check via `updated_at` timestamp.

---

### REQ-PROJECT-003 – Archive Project

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-PROJECT-003                                                       |
| Title             | Archive Project                                                       |
| Priority          | P2 – Could Have                                                       |
| Component(s)      | Backend (project routes), Frontend (project settings page)            |

**Description:**  
A project can be archived, hiding it from default project lists without deleting it.

**Acceptance Criteria:**
- [ ] `PATCH /api/tf/organizations/:orgId/projects/:projectId` accepts `{ status: "archived" }`.
- [ ] Only project creator, org owner, and org admin can archive.
- [ ] Archived projects are excluded from default project listing.
- [ ] Archived projects can be viewed via a filter.
- [ ] Archived projects can be restored to `active` status.

---

### REQ-PROJECT-004 – Delete Project (Owner/Admin Only)

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-PROJECT-004                                                       |
| Title             | Delete Project (Owner/Admin Only)                                     |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (project routes), Frontend (project settings page)            |

**Description:**  
Only the organization owner or admin can permanently delete a project and all its associated tasks.

**Acceptance Criteria:**
- [ ] `DELETE /api/tf/organizations/:orgId/projects/:projectId` returns `204 No Content`.
- [ ] Only org `owner` and `admin` can delete.
- [ ] All tasks, labels, and activity records for the project are cascade-deleted.
- [ ] Frontend shows a confirmation dialog before deletion.

---

## 4. Task Requirements

### REQ-TASK-001 – Create Task in Project

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-TASK-001                                                         |
| Title             | Create Task in Project                                                |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Backend (task routes), Frontend (task create modal / inline)          |

**Description:**  
A project member can create a task within a project.

**Acceptance Criteria:**
- [ ] `POST /api/tf/organizations/:orgId/projects/:projectId/tasks` accepts `{ title, description?, priority?, assigneeId?, dueDate? }`.
- [ ] Task title is required, 1–200 characters.
- [ ] Default priority is `medium`, default status is `todo`.
- [ ] On success, returns `201 Created` with task object.
- [ ] An activity record is created for the task creation event.

---

### REQ-TASK-002 – Edit Task Details

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-TASK-002                                                         |
| Title             | Edit Task Details                                                     |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (task routes), Frontend (task detail page / modal)            |

**Description:**  
Task assignees and project members can edit task title, description, priority, and due date.

**Acceptance Criteria:**
- [ ] `PATCH /api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId` accepts updatable fields.
- [ ] Changes are logged as activity records.
- [ ] Only project members can edit tasks.

---

### REQ-TASK-003 – Assign Task to Member

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-TASK-003                                                         |
| Title             | Assign Task to Member                                                 |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (task routes), Frontend (task detail / board)                 |

**Description:**  
A task can be assigned to any member of the organization.

**Acceptance Criteria:**
- [ ] `PATCH /api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId` accepts `{ assigneeId }`.
- [ ] `assigneeId` can be set to `null` to unassign.
- [ ] Assignee must be a member of the organization.
- [ ] Assignment change is logged as an activity record.

---

### REQ-TASK-004 – Move Task Through Statuses

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-TASK-004                                                         |
| Title             | Move Task Through Statuses                                            |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Backend (task routes), Frontend (kanban board)                        |

**Description:**  
Tasks move through a defined workflow: `todo` → `in_progress` → `in_review` → `done`.

**Acceptance Criteria:**
- [ ] `PATCH /api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId` accepts `{ status }`.
- [ ] Valid statuses: `todo`, `in_progress`, `in_review`, `done`.
- [ ] Invalid status returns `400 Bad Request`.
- [ ] Status change is logged as an activity record.
- [ ] Kanban board reflects the new status column.

---

### REQ-TASK-005 – Delete Task

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-TASK-005                                                         |
| Title             | Delete Task                                                           |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (task routes), Frontend (task detail / board context menu)    |

**Description:**  
A project member or task creator can delete a task.

**Acceptance Criteria:**
- [ ] `DELETE /api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId` returns `204 No Content`.
- [ ] Only task creator, assignee, org owner, and org admin can delete.
- [ ] Associated label assignments are cascade-deleted.
- [ ] Frontend shows confirmation dialog before deletion.

---

## 5. Board Requirements

### REQ-BOARD-001 – Kanban Board View with Status Columns

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-BOARD-001                                                        |
| Title             | Kanban Board View with Status Columns                                 |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Frontend (board page)                                                 |

**Description:**  
Each project has a kanban board displaying tasks organized in columns by status.

**Acceptance Criteria:**
- [ ] Board route: `/tf/organizations/:orgId/projects/:projectId/board`.
- [ ] Columns: `Todo`, `In Progress`, `In Review`, `Done`.
- [ ] Each column shows count of tasks in that status.
- [ ] Tasks are displayed as cards showing title, priority badge, assignee avatar, and labels.
- [ ] Empty columns display a placeholder message.

---

### REQ-BOARD-002 – Drag Tasks Between Columns

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-BOARD-002                                                        |
| Title             | Drag Tasks Between Columns                                            |
| Priority          | P0 – Must Have                                                        |
| Component(s)      | Frontend (board page, drag-and-drop library)                          |

**Description:**  
Users can drag a task card from one column to another to change its status.

**Acceptance Criteria:**
- [ ] Tasks are draggable between status columns.
- [ ] Drag-and-drop uses a library (e.g., `@dnd-kit/core` or `react-beautiful-dnd`).
- [ ] On drop, `PATCH /api/tf/.../tasks/:taskId` is called with the new status.
- [ ] Optimistic UI update before server confirmation.
- [ ] On server error, revert to previous status with error notification.
- [ ] Touch/drag works on mobile (see REQ-UI-001).

---

## 6. Label Requirements

### REQ-LABEL-001 – Create Labels with Colors

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-LABEL-001                                                        |
| Title             | Create Labels with Colors                                             |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (label routes), Frontend (project settings / label manager)   |

**Description:**  
Users can create colored labels to categorize tasks within a project.

**Acceptance Criteria:**
- [ ] `POST /api/tf/organizations/:orgId/projects/:projectId/labels` accepts `{ name, color }`.
- [ ] Label name is required, 1–50 characters.
- [ ] Color is a valid hex color code (e.g., `#FF5733`).
- [ ] On success, returns `201 Created` with label object.
- [ ] Labels are unique per project (name uniqueness enforced).

---

### REQ-LABEL-002 – Assign Labels to Tasks

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-LABEL-002                                                        |
| Title             | Assign Labels to Tasks                                                |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (task-label routes), Frontend (task detail / board card)      |

**Description:**  
One or more labels can be assigned to a task.

**Acceptance Criteria:**
- [ ] `POST /api/tf/organizations/:orgId/projects/:projectId/tasks/:taskId/labels` accepts `{ labelId }`.
- [ ] `DELETE /api/tf/.../tasks/:taskId/labels/:labelId` removes a label.
- [ ] Multiple labels can be assigned to a single task.
- [ ] Duplicate label assignment returns `409 Conflict`.
- [ ] Assigned labels are displayed on task cards in the kanban board.

---

## 7. Activity Requirements

### REQ-ACTIVITY-001 – Log and Display Project Activity

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-ACTIVITY-001                                                      |
| Title             | Log and Display Project Activity                                      |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (activity routes), Frontend (activity feed component)         |

**Description:**  
All significant actions within a project are logged and displayed in a chronological activity feed.

**Acceptance Criteria:**
- [ ] Activity events include: task created, edited, status changed, assigned, label added/removed, project created, member added/removed.
- [ ] Each activity record contains: `id`, `projectId`, `userId`, `action`, `entityType`, `entityId`, `details` (JSON), `createdAt`.
- [ ] `GET /api/tf/organizations/:orgId/projects/:projectId/activity` returns paginated activity list (50 per page).
- [ ] Activity feed component is available on project pages and dashboard.
- [ ] Activity records are read-only (cannot be edited or deleted by users).

---

## 8. Search & Filter Requirements

### REQ-SEARCH-001 – Search Tasks by Title/Description

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-SEARCH-001                                                       |
| Title             | Search Tasks by Title/Description                                     |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (search routes), Frontend (search bar / page)                 |

**Description:**  
Users can search for tasks within an organization by title or description text.

**Acceptance Criteria:**
- [ ] `GET /api/tf/organizations/:orgId/search?q=<query>` returns matching tasks.
- [ ] Search is case-insensitive and supports partial matches.
- [ ] Results include task title, project name, status, priority, and assignee.
- [ ] Results are limited to tasks in projects the user has access to.
- [ ] Frontend provides a global search bar accessible from all pages.

---

### REQ-SEARCH-002 – Filter by Status/Priority/Assignee/Label

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-SEARCH-002                                                       |
| Title             | Filter by Status/Priority/Assignee/Label                              |
| Priority          | P2 – Could Have                                                       |
| Component(s)      | Backend (task routes), Frontend (board / task list filters)           |

**Description:**  
Tasks can be filtered on the kanban board and task list views by status, priority, assignee, and label.

**Acceptance Criteria:**
- [ ] `GET /api/tf/.../projects/:projectId/tasks?status=<s>&priority=<p>&assigneeId=<id>&labelId=<id>` accepts query filters.
- [ ] Filters can be combined (AND logic).
- [ ] Frontend filter controls are visible above the board/list.
- [ ] Active filters are reflected in the URL query string for shareability.
- [ ] "Clear filters" button resets all filters.

---

## 9. Dashboard Requirements

### REQ-DASH-001 – Dashboard with Project/Task Stats

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-DASH-001                                                         |
| Title             | Dashboard with Project/Task Stats                                     |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Backend (dashboard routes), Frontend (dashboard page)                 |

**Description:**  
The dashboard provides an overview of the user's organizations, projects, and task statistics.

**Acceptance Criteria:**
- [ ] `GET /api/tf/dashboard` returns aggregated stats.
- [ ] Stats include: total projects, total tasks, tasks by status (todo/in_progress/in_review/done), tasks assigned to user, overdue tasks.
- [ ] Frontend route: `/tf/dashboard`.
- [ ] Stats cards are displayed in a responsive grid.
- [ ] Clicking a stat card navigates to the relevant filtered view.

---

### REQ-DASH-002 – Recent Activity Feed on Dashboard

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-DASH-002                                                         |
| Title             | Recent Activity Feed on Dashboard                                     |
| Priority          | P2 – Could Have                                                       |
| Component(s)      | Backend (dashboard routes), Frontend (dashboard page)                 |

**Description:**  
The dashboard displays the 20 most recent activity events across all the user's projects.

**Acceptance Criteria:**
- [ ] `GET /api/tf/dashboard/activity` returns the 20 most recent activity records across user's projects.
- [ ] Each activity item shows: user name, action description, project name, and timestamp.
- [ ] Activity feed is sorted by `createdAt` descending.
- [ ] "View all" link navigates to the project's full activity page.

---

## 10. UI/UX Requirements

### REQ-UI-001 – Responsive Mobile Layout

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-UI-001                                                           |
| Title             | Responsive Mobile Layout                                              |
| Priority          | P1 – Should Have                                                      |
| Component(s)      | Frontend (all pages, CSS framework)                                   |

**Description:**  
All pages are responsive and usable on mobile devices (320px and above).

**Acceptance Criteria:**
- [ ] Navigation collapses to a hamburger menu on screens < 768px.
- [ ] Kanban board scrolls horizontally on mobile.
- [ ] Forms are full-width on mobile.
- [ ] Task detail modal is full-screen on mobile.
- [ ] Touch targets are at least 44px × 44px.
- [ ] No horizontal overflow on any page at 320px width.

---

### REQ-UI-002 – Dark Mode Support

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| ID                | REQ-UI-002                                                           |
| Title             | Dark Mode Support                                                     |
| Priority          | P2 – Could Have                                                       |
| Component(s)      | Frontend (theme system, CSS variables)                                |

**Description:**  
The application supports a dark color scheme that can be toggled by the user.

**Acceptance Criteria:**
- [ ] Theme toggle button in the navbar or user menu.
- [ ] Preference is stored in `localStorage` (`tf_theme`).
- [ ] Respects `prefers-color-scheme` media query as default.
- [ ] All components render correctly in both light and dark modes.
- [ ] Color contrast meets WCAG AA standards in both modes.
- [ ] Theme preference persists across sessions.

---

## Summary Matrix

| ID              | Title                              | Priority | Status       |
|-----------------|------------------------------------|----------|--------------|
| REQ-AUTH-001    | User Registration                  | P0       | Planned      |
| REQ-AUTH-002    | User Login with JWT                | P0       | Planned      |
| REQ-AUTH-003    | Session Persistence (localStorage) | P0       | Planned      |
| REQ-AUTH-004    | Logout Clears Session              | P0       | Planned      |
| REQ-ORG-001     | Create Organization                | P0       | Planned      |
| REQ-ORG-002     | Invite Member by Email             | P1       | Planned      |
| REQ-ORG-003     | Manage Member Roles                | P1       | Planned      |
| REQ-PROJECT-001 | Create Project                     | P0       | Planned      |
| REQ-PROJECT-002 | Edit Project                       | P1       | Planned      |
| REQ-PROJECT-003 | Archive Project                    | P2       | Planned      |
| REQ-PROJECT-004 | Delete Project (Owner/Admin)       | P1       | Planned      |
| REQ-TASK-001    | Create Task in Project             | P0       | Planned      |
| REQ-TASK-002    | Edit Task Details                  | P1       | Planned      |
| REQ-TASK-003    | Assign Task to Member              | P1       | Planned      |
| REQ-TASK-004    | Move Task Through Statuses         | P0       | Planned      |
| REQ-TASK-005    | Delete Task                        | P1       | Planned      |
| REQ-BOARD-001   | Kanban Board View                  | P0       | Planned      |
| REQ-BOARD-002   | Drag Tasks Between Columns         | P0       | Planned      |
| REQ-LABEL-001   | Create Labels with Colors          | P1       | Planned      |
| REQ-LABEL-002   | Assign Labels to Tasks             | P1       | Planned      |
| REQ-ACTIVITY-001| Log and Display Activity           | P1       | Planned      |
| REQ-SEARCH-001  | Search Tasks by Title/Description  | P1       | Planned      |
| REQ-SEARCH-002  | Filter by Status/Priority/etc      | P2       | Planned      |
| REQ-DASH-001    | Dashboard with Stats               | P1       | Planned      |
| REQ-DASH-002    | Recent Activity Feed on Dashboard  | P2       | Planned      |
| REQ-UI-001      | Responsive Mobile Layout           | P1       | Planned      |
| REQ-UI-002      | Dark Mode Support                  | P2       | Planned      |
