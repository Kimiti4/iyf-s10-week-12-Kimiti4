# J-026 Provenance

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_PRODUCT_SELECTION.md](J026_PRODUCT_SELECTION.md)               |

---

## 1. Generation Chain

| Stage                 | Artifact / Source                               | Version  |
|-----------------------|-------------------------------------------------|----------|
| Specification         | `product-specification.json`                    | v1.0.0   |
| Requirements          | `J026_REQUIREMENTS.md`                         | 1.0.0    |
| Domain Model          | `J026_DOMAIN_MODEL.md`                         | 1.0.0    |
| Architecture          | `J026_ARCHITECTURE.md`                         | 1.0.0    |
| API Contract          | `J026_API_CONTRACT.md`                         | 1.0.0    |
| Generation Plan       | `J026_GENERATION_PLAN.md`                      | 1.0.0    |
| Feature Traceability  | `J026_FEATURE_TRACEABILITY.md`                 | 1.0.0    |
| Baseline Verification | `J026_BASELINE.md`                             | 1.0.0    |
| Generator             | Tiannara Product Compiler v1                    | J-026    |

---

## 2. Specification

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Source File           | `docs/audits/J026/product-specification.json`                        |
| Version               | 1.0.0                                                                 |
| Product               | TaskFlow – Team Task & Project Management SaaS                       |
| Domain                | Project & Task Management                                             |

---

## 3. Requirements

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Total Requirements    | 27                                                                    |
| Auth Requirements     | REQ-AUTH-001 through REQ-AUTH-003                                    |
| Org Requirements      | REQ-ORG-001 through REQ-ORG-002                                      |
| Project Requirements  | REQ-PROJ-001 through REQ-PROJ-002                                    |
| Task Requirements     | REQ-TASK-001 through REQ-TASK-002                                    |
| Board Requirements    | REQ-BOARD-001                                                        |
| Search Requirements   | REQ-SEARCH-001                                                       |
| Dashboard Requirements| REQ-DASH-001                                                         |
| UI Requirements       | REQ-UI-001 through REQ-UI-002                                        |
| Full listing          | [J026_REQUIREMENTS.md](J026_REQUIREMENTS.md)                        |

---

## 4. Domain Model

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Entities              | 9                                                                     |
| Relationships         | 13                                                                    |
| Entity List           | User, Organization, OrganizationMember, Project, Task, Label, TaskLabel, Activity, Invitation |
| Full listing          | [J026_DOMAIN_MODEL.md](J026_DOMAIN_MODEL.md)                        |

---

## 5. Architecture

| Layer        | Technology                        | Notes                          |
|--------------|-----------------------------------|--------------------------------|
| Frontend     | React 18 + Vite                   | SPA, `/tf/*` route prefix     |
| Backend      | Express.js                        | REST API, `/api/tf/*` prefix  |
| Database     | Supabase Postgres                 | Managed Postgres instance      |
| Auth         | JWT (JSON Web Tokens)             | Bearer token in Authorization  |

Full architecture documentation: [J026_ARCHITECTURE.md](J026_ARCHITECTURE.md)

---

## 6. Codebase Inventory

### 6.1 Backend

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Total Files           | 16                                                                    |
| Route Modules         | 9                                                                     |
| Middleware Files       | 3                                                                     |
| Utility Files         | 4                                                                     |

**Route Modules:**

| #  | Module                | Endpoints |
|----|-----------------------|-----------|
| 1  | `routes/auth.js`      | 3         |
| 2  | `routes/organizations.js` | 5      |
| 3  | `routes/projects.js`  | 4         |
| 4  | `routes/tasks.js`     | 5         |
| 5  | `routes/labels.js`    | 4         |
| 6  | `routes/taskLabels.js`| 2         |
| 7  | `routes/activity.js`  | 1         |
| 8  | `routes/search.js`    | 1         |
| 9  | `routes/dashboard.js` | 2         |

### 6.2 Frontend

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Total Files           | 39                                                                    |
| Pages                 | 10                                                                    |
| Components            | 14                                                                    |
| Services              | 7                                                                     |
| Hooks                 | 5                                                                     |
| Contexts              | 2                                                                     |
| Utilities             | 1                                                                     |

**Pages:**

| #  | Page                    | Route                              |
|----|-------------------------|------------------------------------|
| 1  | LoginPage               | `/tf/login`                       |
| 2  | RegisterPage            | `/tf/register`                    |
| 3  | DashboardPage           | `/tf/dashboard`                   |
| 4  | OrganizationsPage       | `/tf/organizations`               |
| 5  | ProjectsPage            | `/tf/org/:orgId/projects`         |
| 6  | ProjectDetailPage       | `/tf/org/:orgId/projects/:id`     |
| 7  | BoardPage               | `/tf/org/:orgId/projects/:id/board` |
| 8  | TaskDetailPage          | `/tf/org/:orgId/projects/:id/tasks/:id` |
| 9  | SearchPage              | `/tf/org/:orgId/search`           |
| 10 | NotFoundPage            | `/tf/*`                           |

---

## 7. Tests

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Total E2E Tests       | 40                                                                    |
| Test Suites           | 10                                                                    |
| Framework             | Playwright                                                            |
| Mocking               | API mocking via `page.route()`                                        |
| Full listing          | [J026_TEST_CERTIFICATION.md](J026_TEST_CERTIFICATION.md)            |

---

## 8. Generator

| Property              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Generator             | Tiannara Product Compiler v1                                          |
| Audit ID              | J-026                                                                 |
| Generation Timestamp  | 2026-09-03                                                            |
| Specification Version | 1.0.0                                                                 |

---

## 9. Artifact Cross-Reference

| Artifact                              | Location                                                |
|---------------------------------------|---------------------------------------------------------|
| Specification                         | `docs/audits/J026/product-specification.json`          |
| Product Selection                     | `docs/audits/J026/J026_PRODUCT_SELECTION.md`           |
| Requirements                          | `docs/audits/J026/J026_REQUIREMENTS.md`                |
| Domain Model                          | `docs/audits/J026/J026_DOMAIN_MODEL.md`                |
| Architecture                          | `docs/audits/J026/J026_ARCHITECTURE.md`                |
| API Contract                          | `docs/audits/J026/J026_API_CONTRACT.md`                |
| Generation Plan                       | `docs/audits/J026/J026_GENERATION_PLAN.md`             |
| Feature Traceability                  | `docs/audits/J026/J026_FEATURE_TRACEABILITY.md`        |
| Baseline Verification                 | `docs/audits/J026/J026_BASELINE.md`                    |
| Test Certification                    | `docs/audits/J026/J026_TEST_CERTIFICATION.md`          |
| Accessibility Certification           | `docs/audits/J026/J026_ACCESSIBILITY_CERTIFICATION.md` |
| Performance Certification             | `docs/audits/J026/J026_PERFORMANCE_CERTIFICATION.md`   |
| Security Baseline                     | `docs/audits/J026/J026_SECURITY_BASELINE.md`           |
| Deployment Certification              | `docs/audits/J026/J026_DEPLOYMENT_CERTIFICATION.md`    |
| Repair Log                            | `docs/audits/J026/J026_REPAIR_LOG.md`                  |
| Provenance                            | `docs/audits/J026/J026_PROVENANCE.md` (this file)     |
| Human Interventions                   | `docs/audits/J026/J026_HUMAN_INTERVENTIONS.md`         |
| Product Manifest                      | `products/taskflow/tiannara-product.json`              |

---

## 10. Status

**COMPLETE** — Full provenance chain documented from specification through generated artifacts.
