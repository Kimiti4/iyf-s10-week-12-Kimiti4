# J-026 Feature Traceability Matrix

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md), [J026_GENERATION_PLAN.md](J026_GENERATION_PLAN.md) |

---

## 1. Traceability Purpose

This matrix links every requirement to its implementation files and test coverage, ensuring full traceability from specification through code to verification.

---

## 2. Master Traceability Matrix

### Authentication

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-AUTH-001  | User Registration              | `auth.routes.js`, `auth.controller.js`, `user.model.js`                  | `Register.jsx`, `AuthContext.jsx`, `api.js`                             | `auth.test.js` (register tests)                                  | Planned  |
| REQ-AUTH-002  | User Login with JWT            | `auth.routes.js`, `auth.controller.js`, `user.model.js`, `jwt.js`        | `Login.jsx`, `AuthContext.jsx`, `api.js`                                | `auth.test.js` (login tests)                                     | Planned  |
| REQ-AUTH-003  | Session Persistence (localStorage) | –                                                                     | `AuthContext.jsx`, `api.js` (interceptor)                               | `AuthContext.test.jsx`                                            | Planned  |
| REQ-AUTH-004  | Logout Clears Session          | –                                                                         | `AuthContext.jsx`, `Navbar.jsx`                                         | `AuthContext.test.jsx`                                            | Planned  |

### Organization

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-ORG-001   | Create Organization            | `org.routes.js`, `org.controller.js`, `org.model.js`, `membership.model.js` | `OrgSettings.jsx`, `OrgForm.jsx`                                       | `org.test.js`                                                    | Planned  |
| REQ-ORG-002   | Invite Member by Email         | `org.routes.js`, `org.controller.js`, `membership.model.js`, `invitation.model.js` | `OrgSettings.jsx`, `MemberList.jsx`                             | `org.test.js` (invite tests)                                     | Planned  |
| REQ-ORG-003   | Manage Member Roles            | `org.routes.js`, `org.controller.js`, `membership.model.js`              | `OrgSettings.jsx`, `MemberList.jsx`                                     | `org.test.js` (role tests)                                       | Planned  |

### Project

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-PROJECT-001 | Create Project               | `project.routes.js`, `project.controller.js`, `project.model.js`         | `ProjectList.jsx`, `ProjectForm.jsx`                                    | `project.test.js`                                                | Planned  |
| REQ-PROJECT-002 | Edit Project                 | `project.routes.js`, `project.controller.js`, `project.model.js`         | `ProjectSettings.jsx`, `ProjectForm.jsx`                                | `project.test.js` (edit tests)                                   | Planned  |
| REQ-PROJECT-003 | Archive Project              | `project.routes.js`, `project.controller.js`, `project.model.js`         | `ProjectSettings.jsx`, `ProjectList.jsx`                                | `project.test.js` (archive tests)                                | Planned  |
| REQ-PROJECT-004 | Delete Project (Owner/Admin)  | `project.routes.js`, `project.controller.js`, `project.model.js`, `roleCheck.middleware.js` | `ProjectSettings.jsx`                                     | `project.test.js` (delete tests)                                 | Planned  |

### Task

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-TASK-001  | Create Task in Project         | `task.routes.js`, `task.controller.js`, `task.model.js`                  | `TaskForm.jsx`, `Board.jsx`                                             | `task.test.js`                                                   | Planned  |
| REQ-TASK-002  | Edit Task Details              | `task.routes.js`, `task.controller.js`, `task.model.js`                  | `TaskDetail.jsx`, `TaskForm.jsx`                                        | `task.test.js` (edit tests)                                      | Planned  |
| REQ-TASK-003  | Assign Task to Member          | `task.routes.js`, `task.controller.js`, `task.model.js`                  | `TaskDetail.jsx`, `TaskCard.jsx`                                         | `task.test.js` (assign tests)                                    | Planned  |
| REQ-TASK-004  | Move Task Through Statuses     | `task.routes.js`, `task.controller.js`, `task.model.js`                  | `KanbanBoard.jsx`, `TaskCard.jsx`, `StatusColumn.jsx`                   | `task.test.js` (status tests)                                    | Planned  |
| REQ-TASK-005  | Delete Task                    | `task.routes.js`, `task.controller.js`, `task.model.js`                  | `TaskDetail.jsx`, `Board.jsx`                                            | `task.test.js` (delete tests)                                    | Planned  |

### Board

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-BOARD-001 | Kanban Board View              | – (data comes from task endpoints)                                        | `KanbanBoard.jsx`, `StatusColumn.jsx`, `TaskCard.jsx`                   | `KanbanBoard.test.jsx`                                           | Planned  |
| REQ-BOARD-002 | Drag Tasks Between Columns     | – (status update via task PATCH)                                          | `KanbanBoard.jsx` (drag-drop logic), `@dnd-kit/core`                   | `KanbanBoard.test.jsx` (drag tests)                              | Planned  |

### Label

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-LABEL-001 | Create Labels with Colors      | `label.routes.js`, `label.controller.js`, `label.model.js`               | `LabelManager.jsx`, `LabelBadge.jsx`                                    | `label.test.js`                                                  | Planned  |
| REQ-LABEL-002 | Assign Labels to Tasks         | `label.routes.js`, `label.controller.js`, `taskLabel.model.js`           | `TaskDetail.jsx`, `TaskCard.jsx`, `LabelBadge.jsx`                      | `label.test.js` (assignment tests)                               | Planned  |

### Activity

| Requirement    | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|----------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-ACTIVITY-001 | Log and Display Project Activity | `activity.routes.js`, `activity.controller.js`, `activity.model.js`, `logActivity.js` | `ActivityFeed.jsx`, `ProjectSettings.jsx`, `Dashboard.jsx` | `activity.test.js`                                    | Planned  |

### Search

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-SEARCH-001 | Search Tasks by Title/Description | `search.routes.js`, `search.controller.js`, `task.model.js`            | `SearchBar.jsx`, `Search.jsx`                                           | `search.test.js`                                                 | Planned  |
| REQ-SEARCH-002 | Filter by Status/Priority/etc  | `task.routes.js`, `task.controller.js` (query params)                    | `TaskFilters.jsx`, `Board.jsx`, `Search.jsx`                            | `search.test.js` (filter tests)                                  | Planned  |

### Dashboard

| Requirement   | Description                    | Backend Files                                                              | Frontend Files                                                          | Test Files                                                        | Status   |
|---------------|--------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| REQ-DASH-001  | Dashboard with Stats           | `dashboard.routes.js`, `dashboard.controller.js`, `task.model.js`        | `Dashboard.jsx`, `StatsCard.jsx`                                        | `dashboard.test.js`                                              | Planned  |
| REQ-DASH-002  | Recent Activity Feed on Dashboard | `dashboard.routes.js`, `dashboard.controller.js`, `activity.model.js`  | `Dashboard.jsx`, `ActivityFeed.jsx`                                     | `dashboard.test.js` (activity feed tests)                        | Planned  |

### UI/UX

| Requirement   | Description                    | Backend Files | Frontend Files                                                                  | Test Files                                              | Status   |
|---------------|--------------------------------|---------------|---------------------------------------------------------------------------------|---------------------------------------------------------|----------|
| REQ-UI-001    | Responsive Mobile Layout       | –             | `MobileNav.jsx`, `Layout.jsx`, all page components, CSS/Tailwind               | Visual testing, browser devtools                       | Planned  |
| REQ-UI-002    | Dark Mode Support              | –             | `ThemeContext.jsx`, `index.css` (CSS variables), all components (class toggle) | `ThemeContext.test.jsx`, visual testing                 | Planned  |

---

## 3. Implementation → Test Coverage Summary

| Category        | Requirements | Implementation Files | Test Files Needed | Coverage Target |
|-----------------|-------------|----------------------|-------------------|-----------------|
| Authentication  | 4           | 5                    | 2                 | 100%            |
| Organization    | 3           | 4                    | 1                 | 100%            |
| Project         | 4           | 3                    | 1                 | 100%            |
| Task            | 5           | 3                    | 1                 | 100%            |
| Board           | 2           | 3                    | 1                 | 100%            |
| Label           | 2           | 3                    | 1                 | 100%            |
| Activity        | 1           | 4                    | 1                 | 100%            |
| Search          | 2           | 2                    | 1                 | 100%            |
| Dashboard       | 2           | 2                    | 1                 | 100%            |
| UI/UX           | 2           | 5+                   | 1                 | Visual/Manual   |
| **Total**       | **27**      | **~34**              | **~11**           | –               |

---

## 4. Middleware Traceability

| Middleware                | Used By                           | Purpose                                     |
|---------------------------|-----------------------------------|---------------------------------------------|
| `auth.middleware.js`      | All `/api/tf/*` except auth       | Verify JWT, attach `req.user`              |
| `orgAccess.middleware.js` | All org-scoped routes             | Verify user is member of target org         |
| `projectAccess.middleware.js` | All project-scoped routes     | Verify user has access to target project    |
| `roleCheck.middleware.js` | Delete project, manage members    | Verify user has required role (owner/admin) |
| `validate.middleware.js`  | All routes with request body      | Handle express-validator errors             |

---

## 5. Frontend Route → Requirement Mapping

| Frontend Route                                              | Requirements Covered                     |
|-------------------------------------------------------------|------------------------------------------|
| `/tf/login`                                                 | REQ-AUTH-002, REQ-AUTH-003               |
| `/tf/register`                                              | REQ-AUTH-001                             |
| `/tf/dashboard`                                             | REQ-DASH-001, REQ-DASH-002, REQ-ACTIVITY-001 |
| `/tf/organizations/:orgId/settings`                         | REQ-ORG-001, REQ-ORG-002, REQ-ORG-003   |
| `/tf/organizations/:orgId/projects`                         | REQ-PROJECT-001, REQ-PROJECT-003         |
| `/tf/organizations/:orgId/projects/:projectId/board`        | REQ-BOARD-001, REQ-BOARD-002, REQ-TASK-001, REQ-TASK-004, REQ-SEARCH-002 |
| `/tf/organizations/:orgId/projects/:projectId/settings`     | REQ-PROJECT-002, REQ-PROJECT-004, REQ-LABEL-001 |
| `/tf/organizations/:orgId/projects/:projectId/tasks/:taskId`| REQ-TASK-002, REQ-TASK-003, REQ-TASK-005, REQ-LABEL-002 |
| `/tf/search`                                                | REQ-SEARCH-001, REQ-SEARCH-002           |

---

## 6. API Endpoint → Requirement Mapping

| API Endpoint                                                  | Requirement(s)                            |
|---------------------------------------------------------------|-------------------------------------------|
| `POST /api/tf/auth/register`                                  | REQ-AUTH-001                              |
| `POST /api/tf/auth/login`                                     | REQ-AUTH-002                              |
| `GET /api/tf/auth/me`                                         | REQ-AUTH-003                              |
| `POST /api/tf/organizations`                                  | REQ-ORG-001                               |
| `GET /api/tf/organizations`                                   | REQ-ORG-001                               |
| `GET /api/tf/organizations/:orgId`                            | REQ-ORG-001                               |
| `PATCH /api/tf/organizations/:orgId`                          | REQ-ORG-001                               |
| `POST /api/tf/organizations/:orgId/members`                   | REQ-ORG-002                               |
| `GET /api/tf/organizations/:orgId/members`                    | REQ-ORG-002, REQ-ORG-003                  |
| `PATCH /api/tf/organizations/:orgId/members/:userId`          | REQ-ORG-003                               |
| `DELETE /api/tf/organizations/:orgId/members/:userId`         | REQ-ORG-003                               |
| `POST /api/tf/organizations/:orgId/projects`                  | REQ-PROJECT-001                           |
| `GET /api/tf/organizations/:orgId/projects`                   | REQ-PROJECT-001, REQ-PROJECT-003          |
| `GET /api/tf/organizations/:orgId/projects/:projectId`        | REQ-PROJECT-001                           |
| `PATCH /api/tf/organizations/:orgId/projects/:projectId`      | REQ-PROJECT-002, REQ-PROJECT-003          |
| `DELETE /api/tf/organizations/:orgId/projects/:projectId`     | REQ-PROJECT-004                           |
| `POST /api/tf/.../tasks`                                      | REQ-TASK-001                              |
| `GET /api/tf/.../tasks`                                       | REQ-TASK-001, REQ-SEARCH-002              |
| `GET /api/tf/.../tasks/:taskId`                               | REQ-TASK-002                              |
| `PATCH /api/tf/.../tasks/:taskId`                             | REQ-TASK-002, REQ-TASK-003, REQ-TASK-004  |
| `DELETE /api/tf/.../tasks/:taskId`                            | REQ-TASK-005                              |
| `POST /api/tf/.../labels`                                     | REQ-LABEL-001                             |
| `GET /api/tf/.../labels`                                      | REQ-LABEL-001                             |
| `PATCH /api/tf/.../labels/:labelId`                           | REQ-LABEL-001                             |
| `DELETE /api/tf/.../labels/:labelId`                          | REQ-LABEL-001                             |
| `POST /api/tf/.../tasks/:taskId/labels`                       | REQ-LABEL-002                             |
| `DELETE /api/tf/.../tasks/:taskId/labels/:labelId`            | REQ-LABEL-002                             |
| `GET /api/tf/.../activity`                                    | REQ-ACTIVITY-001                          |
| `GET /api/tf/organizations/:orgId/search`                     | REQ-SEARCH-001                            |
| `GET /api/tf/dashboard`                                       | REQ-DASH-001                              |
| `GET /api/tf/dashboard/activity`                              | REQ-DASH-002, REQ-ACTIVITY-001            |

---

## 7. Status Legend

| Status     | Meaning                                                   |
|------------|-----------------------------------------------------------|
| Planned    | Requirement documented, implementation pending            |
| In Progress| Implementation started, not yet complete                  |
| Complete   | Implementation done, tests passing                        |
| Verified   | Fully tested, lint clean, build passing                   |
| Deferred   | Deprioritized for this audit cycle                        |

---

## 8. Cross-Reference to Other Audit Documents

| Document                          | Purpose                                      |
|-----------------------------------|----------------------------------------------|
| [J026_BASELINE.md](J026_BASELINE.md)           | Baseline commit and pre-generation checklist |
| [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md)   | Full requirement specifications              |
| [J026_DOMAIN_MODEL.md](J026_DOMAIN_MODEL.md)   | Entity-relationship documentation            |
| [J026_ARCHITECTURE.md](J026_ARCHITECTURE.md)   | System architecture diagrams                 |
| [J026_API_CONTRACT.md](J026_API_CONTRACT.md)   | API endpoint schemas                         |
| [J026_GENERATION_PLAN.md](J026_GENERATION_PLAN.md) | Step-by-step build sequence              |
