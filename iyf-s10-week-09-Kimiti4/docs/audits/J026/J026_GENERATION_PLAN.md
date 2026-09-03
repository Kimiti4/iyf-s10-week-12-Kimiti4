# J-026 Generation Plan

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| Baseline     | Commit `6a2f5fb` (J-025+ state)                                       |
| See Also     | [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md), [J026_ARCHITECTURE.md](J026_ARCHITECTURE.md) |

---

## 1. Generation Principles

1. **Layer-by-layer** – Build infrastructure before features; features before UI polish.
2. **Test after** – Each step includes a verification gate before proceeding.
3. **Incremental** – Each phase produces a working, testable artifact.
4. **Traceable** – Every generated file maps to one or more requirements in `J026_REQUIREMENTS.md`.

---

## 2. Phase Overview

| Phase | Name                     | Steps | Dependencies     | Est. Time |
|-------|--------------------------|-------|------------------|-----------|
| 0     | Baseline Verification    | 3     | None             | 15 min    |
| 1     | Project Scaffolding      | 4     | Phase 0          | 20 min    |
| 2     | Database Schema          | 3     | Phase 1          | 30 min    |
| 3     | Authentication           | 5     | Phase 2          | 45 min    |
| 4     | Organization Management  | 4     | Phase 3          | 40 min    |
| 5     | Project Management       | 5     | Phase 4          | 40 min    |
| 6     | Task Management          | 6     | Phase 5          | 50 min    |
| 7     | Kanban Board & Drag-Drop | 4     | Phase 6          | 45 min    |
| 8     | Labels                   | 3     | Phase 6          | 25 min    |
| 9     | Activity Logging         | 3     | Phases 4–6       | 30 min    |
| 10    | Search & Filter          | 3     | Phase 6          | 25 min    |
| 11    | Dashboard                | 3     | Phases 6, 9      | 30 min    |
| 12    | UI Polish                | 3     | All prior phases | 30 min    |
| 13    | Final Verification       | 4     | All phases       | 30 min    |

---

## 3. Detailed Steps

### Phase 0: Baseline Verification

| Step | Action                                        | Verification                                |
|------|-----------------------------------------------|----------------------------------------------|
| 0.1  | Checkout `6a2f5fb`, confirm clean state       | `git log --oneline -1` shows `6a2f5fb`       |
| 0.2  | Run `npm install` in frontend and backend     | Dependencies installed without errors        |
| 0.3  | Run build and tests at baseline               | `npm run build` passes, all tests green      |

---

### Phase 1: Project Scaffolding

| Step | Action                                        | Files Created / Modified                    |
|------|-----------------------------------------------|----------------------------------------------|
| 1.1  | Initialize Vite React 18 project in `frontend/` | `frontend/package.json`, `vite.config.js`, `src/main.jsx` |
| 1.2  | Initialize Express project in `backend/`      | `backend/package.json`, `src/server.js`, `src/app.js` |
| 1.3  | Set up environment config (`.env.example`)    | `backend/.env.example`                       |
| 1.4  | Verify both servers start                     | Frontend on `:5173`, backend on `:3000`      |

---

### Phase 2: Database Schema

| Step | Action                                        | Files Created                               |
|------|-----------------------------------------------|----------------------------------------------|
| 2.1  | Create Supabase client utility                | `backend/src/utils/supabase.js`              |
| 2.2  | Write migration SQL for all 9 tables          | `backend/migrations/001_initial_schema.sql`  |
| 2.3  | Run migration against Supabase, verify tables | Tables visible in Supabase dashboard         |

**Tables created:** `users`, `organizations`, `memberships`, `projects`, `tasks`, `labels`, `task_labels`, `activities`, `invitations`

---

### Phase 3: Authentication

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 3.1  | Create JWT utility (sign, verify)             | REQ-AUTH-002  | `backend/src/utils/jwt.js`             |
| 3.2  | Create auth middleware                        | REQ-AUTH-002  | `backend/src/middleware/auth.middleware.js` |
| 3.3  | Build `POST /api/tf/auth/register`            | REQ-AUTH-001  | `auth.routes.js`, `auth.controller.js`, `user.model.js` |
| 3.4  | Build `POST /api/tf/auth/login`               | REQ-AUTH-002  | (same files)                           |
| 3.5  | Create frontend AuthContext + login/register pages | REQ-AUTH-003, REQ-AUTH-004 | `AuthContext.jsx`, `Login.jsx`, `Register.jsx`, `api.js` |

**Verification:** Register a new user, log in, receive JWT, call `/api/tf/auth/me`.

---

### Phase 4: Organization Management

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 4.1  | Build org model (CRUD queries)                | REQ-ORG-001   | `org.model.js`, `membership.model.js`  |
| 4.2  | Build org routes + controller                 | REQ-ORG-001   | `org.routes.js`, `org.controller.js`   |
| 4.3  | Build membership routes (invite, role mgmt)   | REQ-ORG-002, REQ-ORG-003 | `org.routes.js` (extended)       |
| 4.4  | Build frontend org pages (create, members)    | REQ-ORG-001–003 | `OrgSettings.jsx`, `MemberList.jsx`, `OrgForm.jsx` |

**Verification:** Create org, invite member, change role, list members.

---

### Phase 5: Project Management

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 5.1  | Build project model (CRUD)                    | REQ-PROJECT-001 | `project.model.js`                    |
| 5.2  | Build project routes + controller             | REQ-PROJECT-001–004 | `project.routes.js`, `project.controller.js` |
| 5.3  | Add orgAccess + projectAccess middleware       | All project reqs | `orgAccess.middleware.js`, `projectAccess.middleware.js` |
| 5.4  | Build frontend project pages                  | REQ-PROJECT-001–004 | `ProjectList.jsx`, `ProjectForm.jsx`, `ProjectSettings.jsx` |
| 5.5  | Implement archive and delete flows            | REQ-PROJECT-003, REQ-PROJECT-004 | (same files)           |

**Verification:** Create project, edit, archive, restore, delete (owner vs non-owner).

---

### Phase 6: Task Management

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 6.1  | Build task model (CRUD + filters)             | REQ-TASK-001–005 | `task.model.js`                      |
| 6.2  | Build task routes + controller                | REQ-TASK-001–005 | `task.routes.js`, `task.controller.js` |
| 6.3  | Implement status validation                   | REQ-TASK-004  | (in task.controller.js)                |
| 6.4  | Implement assignment logic                    | REQ-TASK-003  | (in task.controller.js)                |
| 6.5  | Build frontend task components                | REQ-TASK-001–005 | `TaskForm.jsx`, `TaskDetail.jsx`, `TaskFilters.jsx` |
| 6.6  | Wire up task CRUD in project pages            | All task reqs | (board page integration)               |

**Verification:** Create, edit, assign, change status, delete tasks. Validate status enum.

---

### Phase 7: Kanban Board & Drag-Drop

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 7.1  | Install `@dnd-kit/core` (or similar)          | REQ-BOARD-002 | `frontend/package.json` update         |
| 7.2  | Build KanbanBoard, StatusColumn, TaskCard     | REQ-BOARD-001 | `KanbanBoard.jsx`, `StatusColumn.jsx`, `TaskCard.jsx` |
| 7.3  | Implement drag-drop with optimistic update    | REQ-BOARD-002 | (in KanbanBoard.jsx)                   |
| 7.4  | Test drag on mobile (touch support)           | REQ-UI-001    | Manual / browser devtools              |

**Verification:** Drag a task from "Todo" to "In Progress", verify DB update, verify mobile touch.

---

### Phase 8: Labels

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 8.1  | Build label model + taskLabel model           | REQ-LABEL-001, REQ-LABEL-002 | `label.model.js`, `taskLabel.model.js` |
| 8.2  | Build label routes + controller               | REQ-LABEL-001, REQ-LABEL-002 | `label.routes.js`, `label.controller.js` |
| 8.3  | Build frontend label components               | REQ-LABEL-001, REQ-LABEL-002 | `LabelManager.jsx`, `LabelBadge.jsx`   |

**Verification:** Create label, assign to task, remove from task, verify on task card.

---

### Phase 9: Activity Logging

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 9.1  | Build activity model                          | REQ-ACTIVITY-001 | `activity.model.js`                  |
| 9.2  | Create activity logging helper                | REQ-ACTIVITY-001 | `backend/src/utils/logActivity.js`    |
| 9.3  | Integrate logging into task/project/org controllers + build activity route & feed UI | REQ-ACTIVITY-001 | `activity.routes.js`, `activity.controller.js`, `ActivityFeed.jsx` |

**Verification:** Perform task create/status change, verify activity record exists, verify feed displays.

---

### Phase 10: Search & Filter

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 10.1 | Build search controller (Postgres `ILIKE`)    | REQ-SEARCH-001 | `search.controller.js`, `search.routes.js` |
| 10.2 | Implement query-param filters on task list    | REQ-SEARCH-002 | (in task.routes.js / controller)       |
| 10.3 | Build frontend SearchBar + Search page         | REQ-SEARCH-001, REQ-SEARCH-002 | `SearchBar.jsx`, `Search.jsx`, `TaskFilters.jsx` |

**Verification:** Search by keyword, filter by status/priority/assignee/label, verify URL params.

---

### Phase 11: Dashboard

| Step | Action                                        | Req Covered   | Files Created                          |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 11.1 | Build dashboard stats query                   | REQ-DASH-001  | `dashboard.controller.js`, `dashboard.routes.js` |
| 11.2 | Build dashboard activity endpoint             | REQ-DASH-002  | (same files)                           |
| 11.3 | Build frontend Dashboard page                 | REQ-DASH-001, REQ-DASH-002 | `Dashboard.jsx`, `StatsCard.jsx`, `ActivityFeed.jsx` |

**Verification:** Login, view dashboard with correct stats, view recent activity feed.

---

### Phase 12: UI Polish

| Step | Action                                        | Req Covered   | Files Created / Modified                |
|------|-----------------------------------------------|---------------|----------------------------------------|
| 12.1 | Implement responsive mobile layout            | REQ-UI-001    | `MobileNav.jsx`, CSS updates           |
| 12.2 | Implement dark mode toggle + theme system     | REQ-UI-002    | `ThemeContext.jsx`, `index.css` (CSS variables) |
| 12.3 | Test all pages at 320px, 768px, 1024px+       | REQ-UI-001    | Manual testing across breakpoints      |

**Verification:** Verify hamburger nav on mobile, dark mode toggle, horizontal scroll on board.

---

### Phase 13: Final Verification

| Step | Action                                        | Verification                                |
|------|-----------------------------------------------|----------------------------------------------|
| 13.1 | Run full test suite                           | All tests pass                               |
| 13.2 | Run lint across frontend + backend            | No lint errors                               |
| 13.3 | Run build for production                      | Build succeeds, no warnings                  |
| 13.4 | End-to-end smoke test (register → create org → create project → create task → drag on board → search → dashboard) | All flows complete successfully |

---

## 4. Requirement → Phase Mapping

| Requirement     | Phase(s) |
|-----------------|----------|
| REQ-AUTH-001    | 3        |
| REQ-AUTH-002    | 3        |
| REQ-AUTH-003    | 3        |
| REQ-AUTH-004    | 3        |
| REQ-ORG-001     | 4        |
| REQ-ORG-002     | 4        |
| REQ-ORG-003     | 4        |
| REQ-PROJECT-001 | 5        |
| REQ-PROJECT-002 | 5        |
| REQ-PROJECT-003 | 5        |
| REQ-PROJECT-004 | 5        |
| REQ-TASK-001    | 6        |
| REQ-TASK-002    | 6        |
| REQ-TASK-003    | 6        |
| REQ-TASK-004    | 6        |
| REQ-TASK-005    | 6        |
| REQ-BOARD-001   | 7        |
| REQ-BOARD-002   | 7        |
| REQ-LABEL-001   | 8        |
| REQ-LABEL-002   | 8        |
| REQ-ACTIVITY-001| 9        |
| REQ-SEARCH-001  | 10       |
| REQ-SEARCH-002  | 10       |
| REQ-DASH-001    | 11       |
| REQ-DASH-002    | 11       |
| REQ-UI-001      | 12       |
| REQ-UI-002      | 12       |

---

## 5. Estimated Total Effort

| Metric              | Value           |
|---------------------|-----------------|
| Total Phases        | 14 (0–13)      |
| Total Steps         | 50              |
| Estimated Time      | ~7.5 hours      |
| Files to Create     | ~45–55          |
| Database Tables     | 9               |
| API Endpoints       | ~25             |
| Frontend Pages      | 9               |
