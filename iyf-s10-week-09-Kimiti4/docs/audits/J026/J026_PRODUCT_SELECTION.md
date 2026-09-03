# J-026 Product Selection

## Selected Exemplar: TaskFlow

**Product Name:** TaskFlow
**Category:** Team Task & Project Management
**Version:** 1.0.0

## Rationale

TaskFlow is a team task and project management SaaS application. It was selected because:

1. **Genuine SaaS product** — not a toy or demo; resembles real products like Linear, Asana, Trello
2. **Complex enough** — auth, organizations, projects, tasks, boards, labels, members, activity, search, dashboards
3. **Bounded enough** — single domain (project management), clear entity boundaries, certifiable scope
4. **Distinct from JamiiLink** — zero feature overlap; different domain, different users, different workflows
5. **Demonstrates all target capabilities** — auth/authz, CRUD, relational data, multiple entities, user workflows, forms, validation, search/filtering, responsive UI, loading/empty/error states, persistence, API integration, dashboard, deployment, E2E tests

## Architecture

- **Frontend:** React 18 + Vite + React Router v6 (within existing JamiiLink repo as a separate route subtree)
- **Backend:** Express.js + Supabase Postgres (separate deployment)
- **Auth:** JWT (email/password)
- **Deployment:** Frontend → Vercel, Backend → Railway, Database → Supabase Postgres

## Scope Boundaries

### IN SCOPE
- Authentication (register, login, logout, session)
- Organization creation and membership
- Project CRUD with status/priority
- Task CRUD with assignee, labels, due dates, status
- Board view (Kanban-style columns)
- Activity log per project
- Search and filtering
- Dashboard with project stats
- Responsive mobile layout
- Accessibility (WCAG 2.1 AA baseline)
- Performance governance

### OUT OF SCOPE
- Real-time collaboration (WebSocket)
- File attachments
- Time tracking
- Billing/payments
- Email notifications
- Mobile native apps
- Multi-language support
- Advanced analytics
