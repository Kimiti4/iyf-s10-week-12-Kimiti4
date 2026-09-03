# J-026 Test Certification

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md), [J026_API_CONTRACT.md](J026_API_CONTRACT.md) |

---

## 1. Test Suite Overview

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Total Tests           | 40 E2E tests                                                         |
| Test Suites           | 10                                                                    |
| Framework             | Playwright (canonical)                                                |
| Mocking Strategy      | API mocking via `page.route()` (no backend dependency)               |
| Execution Target      | CI/CD pipeline (GitHub Actions)                                      |
| Status                | **PASS**                                                             |

---

## 2. Test Suites

| # | Suite                | Tests | Category      | Requirement Coverage |
|---|----------------------|-------|---------------|----------------------|
| 1 | Authentication       | 6     | Auth          | REQ-AUTH-001 through REQ-AUTH-003 |
| 2 | Organization Mgmt    | 3     | Org           | REQ-ORG-001 through REQ-ORG-002   |
| 3 | Project CRUD         | 5     | Projects      | REQ-PROJ-001 through REQ-PROJ-002 |
| 4 | Task Management      | 4     | Tasks         | REQ-TASK-001 through REQ-TASK-002 |
| 5 | Board View           | 4     | Board         | REQ-BOARD-001                     |
| 6 | Search & Filter      | 1     | Search        | REQ-SEARCH-001                    |
| 7 | Dashboard            | 3     | Dashboard     | REQ-DASH-001                      |
| 8 | Navigation & Routing | 5     | Navigation    | REQ-UI-001 through REQ-UI-002     |
| 9 | Responsive Layout    | 4     | Responsive    | REQ-UI-001                        |
| 10 | Error States         | 5     | Error States  | REQ-UI-002                        |
| **Total**              | **40** |               |                      |

---

## 3. Test Categories

### 3.1 Authentication (6 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| AUTH-001  | Register with valid credentials                | PASS   |
| AUTH-002  | Register with existing email returns 409       | PASS   |
| AUTH-003  | Login with valid credentials returns JWT       | PASS   |
| AUTH-004  | Login with invalid credentials returns 401     | PASS   |
| AUTH-005  | Access protected route without token returns 401 | PASS |
| AUTH-006  | Logout clears session                          | PASS   |

### 3.2 Organization Management (3 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| ORG-001   | Create organization                            | PASS   |
| ORG-002   | List user's organizations                      | PASS   |
| ORG-003   | Update organization (owner only)               | PASS   |

### 3.3 Project CRUD (5 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| PROJ-001  | Create project in organization                 | PASS   |
| PROJ-002  | List projects with status filter               | PASS   |
| PROJ-003  | Update project details                         | PASS   |
| PROJ-004  | Archive project                                | PASS   |
| PROJ-005  | Delete project (owner/admin only)              | PASS   |

### 3.4 Task Management (4 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| TASK-001  | Create task with title and priority            | PASS   |
| TASK-002  | Update task status (drag-and-drop simulation)  | PASS   |
| TASK-003  | Assign task to member                          | PASS   |
| TASK-004  | Delete task                                    | PASS   |

### 3.5 Board View (4 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| BOARD-001 | Display tasks in Kanban columns                | PASS   |
| BOARD-002 | Drag task between columns (status change)      | PASS   |
| BOARD-003 | Filter board by assignee                       | PASS   |
| BOARD-004 | Filter board by label                          | PASS   |

### 3.6 Search & Filter (1 test)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| SEARCH-001| Search tasks by title across projects          | PASS   |

### 3.7 Dashboard (3 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| DASH-001  | Display project and task statistics            | PASS   |
| DASH-002  | Display recent activity feed                   | PASS   |
| DASH-003  | Show overdue tasks count                       | PASS   |

### 3.8 Navigation & Routing (5 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| NAV-001   | Navigate between pages via sidebar             | PASS   |
| NAV-002   | Deep link to project page                      | PASS   |
| NAV-003   | Route guard redirects unauthenticated users    | PASS   |
| NAV-004   | Browser back/forward navigation works          | PASS   |
| NAV-005   | 404 page displayed for unknown routes          | PASS   |

### 3.9 Responsive Layout (4 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| RESP-001  | Sidebar collapses on mobile viewport           | PASS   |
| RESP-002  | Task list renders on small screens             | PASS   |
| RESP-003  | Touch-friendly tap targets (≥44px)             | PASS   |
| RESP-004  | Modal dialogs are responsive                   | PASS   |

### 3.10 Error States (5 tests)

| Test ID   | Description                                    | Status |
|-----------|------------------------------------------------|--------|
| ERR-001   | API error displays toast notification          | PASS   |
| ERR-002   | Empty state shown when no tasks exist          | PASS   |
| ERR-003   | Loading spinner shown during data fetch        | PASS   |
| ERR-004   | Network failure shows retry prompt             | PASS   |
| ERR-005   | Validation errors shown inline on forms        | PASS   |

---

## 4. Mocking Strategy

All 40 E2E tests use API mocking. No live backend is required for test execution.

| Mock Layer         | Implementation                          | Notes                              |
|--------------------|-----------------------------------------|-------------------------------------|
| HTTP Interception  | `page.route()` in Playwright           | Intercept all `/api/tf/*` requests |
| Auth Mock          | Mock JWT returned by login endpoint     | Token stored in localStorage       |
| Data Fixtures      | Static JSON fixtures per test           | Consistent data across test runs   |
| Error Simulation   | Route handlers return error status codes| Tests verify error UI              |

---

## 5. Framework Selection

| Framework    | Rationale                                                              |
|--------------|------------------------------------------------------------------------|
| Playwright   | **Canonical choice.** Cross-browser, native API mocking, CI-friendly  |
| Cypress      | Rejected — single-origin limitation, licensing concerns               |
| Selenium     | Rejected — legacy, verbose setup, slower execution                    |

---

## 6. CI/CD Integration

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| CI Platform           | GitHub Actions                                                        |
| Runner                | `ubuntu-latest`                                                       |
| Node Version          | 20.x                                                                  |
| Install Command       | `npm ci` (frontend)                                                   |
| Test Command          | `npx playwright test`                                                 |
| Parallel Execution    | Yes (default Playwright behavior)                                     |
| Artifact Collection   | HTML report + screenshots on failure                                  |
| Blocking              | Tests must pass before merge to `main`                                |

---

## 7. Acceptance Criteria

| # | Criterion                                            | Status |
|---|------------------------------------------------------|--------|
| 1 | 40 E2E tests exist and are discoverable              | PASS   |
| 2 | All tests use API mocking (no live backend)          | PASS   |
| 3 | All 10 suites have at least 1 test                   | PASS   |
| 4 | Playwright is the canonical test framework            | PASS   |
| 5 | Tests cover Auth, Org, Projects, Tasks, Board, Search, Dashboard, Navigation, Responsive, Error States | PASS |
| 6 | CI pipeline executes all tests                       | PASS   |

---

## 8. Notes

- All tests are self-contained and run in isolation.
- Test data is reset between runs via mocked API responses.
- No database seeding is required for test execution.
- See [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md) for full requirement traceability.
