# J-026 System Architecture

## Audit Reference

| Field        | Value                                                                 |
|--------------|-----------------------------------------------------------------------|
| Audit ID     | J-026                                                                 |
| Product      | TaskFlow – Team Task & Project Management SaaS                        |
| See Also     | [J026_DOMAIN_MODEL.md](J026_DOMAIN_MODEL.md), [J026_API_CONTRACT.md](J026_API_CONTRACT.md) |

---

## 1. Architecture Overview

TaskFlow follows a **three-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          React 18 + Vite SPA                       │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐    │    │
│  │  │  Pages   │  │Components│  │  Auth Context  │    │    │
│  │  │ /tf/*    │  │          │  │  (JWT mgmt)    │    │    │
│  │  └──────────┘  └──────────┘  └───────────────┘    │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐    │    │
│  │  │  Hooks   │  │ Services │  │  Axios Client  │    │    │
│  │  │          │  │ (API)    │  │  (interceptor) │    │    │
│  │  └──────────┘  └──────────┘  └───────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                    HTTP/REST (JSON)                          │
│                    Authorization: Bearer <JWT>               │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                     SERVER                                   │
│                          │                                   │
│  ┌───────────────────────┼───────────────────────────────┐   │
│  │           Express.js API Server                       │   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │   │
│  │  │  Routes  │  │Middleware│  │   Controllers      │   │   │
│  │  │ /api/tf/*│  │(auth,    │  │                    │   │   │
│  │  │          │  │ validate)│  │                    │   │   │
│  │  └──────────┘  └──────────┘  └─────────┬─────────┘   │   │
│  │                                         │              │   │
│  │                                ┌────────┴────────┐    │   │
│  │                                │   Services /     │    │   │
│  │                                │   Models         │    │   │
│  │                                └────────┬────────┘    │   │
│  └─────────────────────────────────────────┼─────────────┘   │
│                                            │                  │
│                                     Supabase Client           │
│                                     (pg / @supabase/          │
│                                      supabase-js)             │
│                                            │                  │
└────────────────────────────────────────────┼──────────────────┘
                                             │
┌────────────────────────────────────────────┼──────────────────┐
│               DATABASE                     │                   │
│                                            │                   │
│  ┌─────────────────────────────────────────┼───────────────┐  │
│  │           Supabase Postgres             │               │  │
│  │                                         │               │  │
│  │  ┌────────┐ ┌────────────┐ ┌────────┐  │  ┌──────────┐ │  │
│  │  │ users  │ │organizations│ │projects│  │  │  tasks   │ │  │
│  │  └────────┘ └────────────┘ └────────┘  │  └──────────┘ │  │
│  │                                         │               │  │
│  │  ┌────────────┐ ┌────────┐ ┌──────────┐ │ ┌──────────┐ │  │
│  │  │memberships │ │ labels │ │task_labels│ │ │activities│ │  │
│  │  └────────────┘ └────────┘ └──────────┘ │ └──────────┘ │  │
│  │                                         │               │  │
│  │  ┌────────────┐                         │               │  │
│  │  │invitations │                         │               │  │
│  │  └────────────┘                         │               │  │
│  └─────────────────────────────────────────┴───────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Tech Stack

| Technology    | Version | Purpose                              |
|---------------|---------|--------------------------------------|
| React         | 18.x    | UI component library                 |
| Vite          | 5.x     | Build tool & dev server              |
| React Router  | 6.x     | Client-side routing (`/tf/*`)        |
| Axios         | 1.x     | HTTP client with interceptors        |
| Context API   | -       | State management (auth, theme)       |
| CSS Modules   | -       | Scoped styling (or Tailwind CSS)     |

### 2.2 Directory Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx                    # App entry point
│   ├── App.jsx                     # Router & layout shell
│   ├── index.css                   # Global styles / CSS variables
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx          # Auth state, login, logout, token
│   │   └── ThemeContext.jsx         # Light/dark mode toggle
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── Sidebar.jsx         # Org/project sidebar
│   │   │   ├── Layout.jsx          # Main layout wrapper
│   │   │   └── MobileNav.jsx       # Hamburger menu for mobile
│   │   ├── board/
│   │   │   ├── KanbanBoard.jsx     # Board container
│   │   │   ├── StatusColumn.jsx    # Single status column
│   │   │   └── TaskCard.jsx        # Draggable task card
│   │   ├── tasks/
│   │   │   ├── TaskForm.jsx        # Create/edit task form
│   │   │   ├── TaskDetail.jsx      # Task detail modal/page
│   │   │   └── TaskFilters.jsx     # Filter controls
│   │   ├── projects/
│   │   │   ├── ProjectForm.jsx     # Create/edit project form
│   │   │   └── ProjectCard.jsx     # Project summary card
│   │   ├── orgs/
│   │   │   ├── OrgForm.jsx         # Create org form
│   │   │   └── MemberList.jsx      # Org member management
│   │   ├── labels/
│   │   │   ├── LabelManager.jsx    # Label CRUD
│   │   │   └── LabelBadge.jsx      # Colored label badge
│   │   └── common/
│   │       ├── SearchBar.jsx       # Global search input
│   │       ├── ActivityFeed.jsx    # Activity list component
│   │       ├── StatsCard.jsx       # Dashboard stat card
│   │       └── ConfirmDialog.jsx   # Reusable confirmation modal
│   │
│   ├── pages/
│   │   ├── Login.jsx               # /tf/login
│   │   ├── Register.jsx            # /tf/register
│   │   ├── Dashboard.jsx           # /tf/dashboard
│   │   ├── OrgSettings.jsx         # /tf/organizations/:orgId/settings
│   │   ├── ProjectList.jsx         # /tf/organizations/:orgId/projects
│   │   ├── ProjectSettings.jsx     # /tf/organizations/:orgId/projects/:id/settings
│   │   ├── Board.jsx               # /tf/organizations/:orgId/projects/:id/board
│   │   ├── TaskDetail.jsx          # /tf/organizations/:orgId/projects/:id/tasks/:taskId
│   │   └── Search.jsx              # /tf/search
│   │
│   ├── services/
│   │   └── api.js                  # Axios instance + all API functions
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # Auth context hook
│   │   ├── useTheme.js             # Theme context hook
│   │   └── useDebounce.js          # Debounced search input
│   │
│   └── utils/
│       ├── constants.js            # Status/priority enums
│       └── helpers.js              # Date formatting, etc.
│
├── package.json
├── vite.config.js
└── tailwind.config.js              # If using Tailwind
```

### 2.3 Frontend Routing

| Route Pattern                                              | Component       | Auth Required |
|------------------------------------------------------------|-----------------|---------------|
| `/tf/login`                                                | Login           | No            |
| `/tf/register`                                             | Register        | No            |
| `/tf/dashboard`                                            | Dashboard       | Yes           |
| `/tf/organizations/:orgId/settings`                        | OrgSettings     | Yes           |
| `/tf/organizations/:orgId/projects`                        | ProjectList     | Yes           |
| `/tf/organizations/:orgId/projects/:projectId/board`       | Board           | Yes           |
| `/tf/organizations/:orgId/projects/:projectId/settings`    | ProjectSettings | Yes           |
| `/tf/organizations/:orgId/projects/:projectId/tasks/:taskId` | TaskDetail   | Yes           |
| `/tf/search`                                               | Search          | Yes           |

### 2.4 Auth Flow (Frontend)

```
App Load
  │
  ├─ AuthContext reads localStorage (tf_token, tf_user)
  │   ├─ Token valid → User authenticated, render protected routes
  │   └─ Token expired → Clear localStorage, redirect to /tf/login
  │
  ├─ Login form submits → POST /api/tf/auth/login
  │   ├─ Success → Store token + user in localStorage, update AuthContext
  │   └─ Failure → Display error message
  │
  ├─ API interceptor attaches Authorization: Bearer <token>
  │   ├─ 200/201 → Return response
  │   └─ 401 → Clear localStorage, redirect to /tf/login
  │
  └─ Logout → Clear localStorage, reset AuthContext, redirect to /tf/login
```

---

## 3. Backend Architecture

### 3.1 Tech Stack

| Technology         | Version | Purpose                              |
|--------------------|---------|--------------------------------------|
| Node.js            | 20.x    | Runtime                              |
| Express.js         | 4.x     | HTTP framework                       |
| Supabase JS Client | 2.x     | Database queries                     |
| bcryptjs           | 2.x     | Password hashing                     |
| jsonwebtoken       | 9.x     | JWT creation and verification        |
| cors               | 2.x     | Cross-origin resource sharing        |
| dotenv             | 16.x    | Environment variable loading         |
| express-validator  | 7.x     | Request validation                   |

### 3.2 Directory Structure

```
backend/
├── src/
│   ├── server.js                    # Express app setup & listen
│   ├── app.js                       # Express app configuration
│   │
│   ├── routes/
│   │   ├── index.js                 # Route aggregator
│   │   ├── auth.routes.js           # POST /api/tf/auth/*
│   │   ├── org.routes.js            # /api/tf/organizations/*
│   │   ├── project.routes.js        # /api/tf/organizations/:orgId/projects/*
│   │   ├── task.routes.js           # /api/tf/.../tasks/*
│   │   ├── label.routes.js          # /api/tf/.../labels/*
│   │   ├── board.routes.js          # /api/tf/.../board (if separate)
│   │   ├── activity.routes.js       # /api/tf/.../activity
│   │   ├── search.routes.js         # /api/tf/organizations/:orgId/search
│   │   └── dashboard.routes.js      # /api/tf/dashboard/*
│   │
│   ├── controllers/
│   │   ├── auth.controller.js       # Registration, login logic
│   │   ├── org.controller.js        # Org CRUD, membership management
│   │   ├── project.controller.js    # Project CRUD
│   │   ├── task.controller.js       # Task CRUD, status changes
│   │   ├── label.controller.js      # Label CRUD, task-label assignment
│   │   ├── activity.controller.js   # Activity listing
│   │   ├── search.controller.js     # Search & filter logic
│   │   └── dashboard.controller.js  # Dashboard aggregation
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification, attach req.user
│   │   ├── orgAccess.middleware.js  # Verify user is org member
│   │   ├── projectAccess.middleware.js # Verify user is project member
│   │   ├── roleCheck.middleware.js  # Verify user has required role
│   │   └── validate.middleware.js   # express-validator error handler
│   │
│   ├── models/
│   │   ├── user.model.js           # User DB queries
│   │   ├── org.model.js            # Organization DB queries
│   │   ├── membership.model.js     # Membership DB queries
│   │   ├── project.model.js        # Project DB queries
│   │   ├── task.model.js           # Task DB queries
│   │   ├── label.model.js          # Label DB queries
│   │   ├── taskLabel.model.js      # TaskLabel junction queries
│   │   ├── activity.model.js       # Activity DB queries
│   │   └── invitation.model.js     # Invitation DB queries
│   │
│   └── utils/
│       ├── supabase.js             # Supabase client initialization
│       ├── jwt.js                   # Token sign/verify helpers
│       └── constants.js             # Status/priority enums
│
├── .env                             # Environment variables (gitignored)
├── package.json
└── jest.config.js                   # Test configuration
```

### 3.3 Middleware Chain

```
Request
  │
  ├─ CORS                          # Allow frontend origin
  ├─ express.json()                # Parse JSON body
  ├─ Route handler
  │   │
  │   ├─ auth.middleware            # Verify JWT, attach req.user
  │   │   └─ 401 if invalid/missing token
  │   │
  │   ├─ orgAccess.middleware       # Verify req.user is org member
  │   │   └─ 403 if not a member
  │   │
  │   ├─ roleCheck.middleware       # Verify required role (owner/admin)
  │   │   └─ 403 if insufficient role
  │   │
  │   ├─ Validation rules          # express-validator checks
  │   │   └─ 400 if validation fails
  │   │
  │   └─ Controller handler        # Business logic + DB queries
  │
  └─ Response (JSON)
```

---

## 4. Database Connection

### 4.1 Supabase Configuration

| Config          | Value / Env Var                  | Description                    |
|-----------------|----------------------------------|--------------------------------|
| Project URL     | `SUPABASE_URL`                   | Supabase project endpoint      |
| Anon Key       | `SUPABASE_ANON_KEY`              | Client-side public key         |
| Service Role Key | `SUPABASE_SERVICE_ROLE_KEY`     | Server-side admin key (backend only) |
| DB Password     | `SUPABASE_DB_PASSWORD`           | Direct Postgres connection      |

### 4.2 Connection Strategy

```
Backend (Express)
  │
  ├─ @supabase/supabase-js client (preferred)
  │   ├─ Uses service role key for full access
  │   └─ Handles connection pooling via Supabase
  │
  └─ Alternative: pg (node-postgres) pool
      ├─ Direct connection string
      └─ Manual connection pooling
```

---

## 5. Authentication & Authorization

### 5.1 JWT Token Structure

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1693000000,
  "exp": 1693086400
}
```

| Field   | Description                              |
|---------|------------------------------------------|
| userId  | UUID of the authenticated user           |
| email   | User's email address                     |
| iat     | Issued-at timestamp                      |
| exp     | Expiration timestamp (24 hours from iat) |

### 5.2 Authorization Levels

| Level        | Description                                      |
|--------------|--------------------------------------------------|
| Public       | No auth required (register, login)               |
| Authenticated| Any valid JWT (all /api/tf/* except auth)        |
| Org Member   | User has membership in the target organization   |
| Org Admin    | User has role `owner` or `admin` in the org      |
| Org Owner    | User has role `owner` in the organization        |
| Project Member| User belongs to the project's organization      |
| Task Owner   | User created the task or is assigned to it       |

### 5.3 Role Hierarchy

```
owner  >  admin  >  member  >  viewer
  │         │         │          │
  │         │         │          └─ Read-only access
  │         │         └─ Create/edit own tasks
  │         └─ Manage members, edit projects
  └─ Full control, delete org, transfer ownership
```

---

## 6. Error Handling

### 6.1 HTTP Status Codes

| Code | Meaning              | When Used                                    |
|------|----------------------|----------------------------------------------|
| 200  | OK                   | Successful GET/PATCH                         |
| 201  | Created              | Successful POST (resource created)           |
| 204  | No Content           | Successful DELETE                            |
| 400  | Bad Request          | Validation error, invalid input              |
| 401  | Unauthorized         | Missing or invalid JWT                       |
| 403  | Forbidden            | Valid JWT but insufficient permissions       |
| 404  | Not Found            | Resource does not exist                      |
| 409  | Conflict             | Duplicate email, duplicate membership        |
| 500  | Internal Server Error| Unexpected server error                      |

### 6.2 Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

---

## 7. Environment Variables

| Variable                    | Required | Description                              |
|-----------------------------|----------|------------------------------------------|
| `PORT`                      | No       | Server port (default: 3000)              |
| `SUPABASE_URL`              | Yes      | Supabase project URL                     |
| `SUPABASE_ANON_KEY`         | Yes      | Supabase anon/public key                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | Supabase service role key (server only)  |
| `JWT_SECRET`                | Yes      | Secret for signing JWTs                  |
| `JWT_EXPIRES_IN`            | No       | Token expiry (default: `24h`)            |
| `CORS_ORIGIN`               | No       | Allowed origin (default: `http://localhost:5173`) |
| `NODE_ENV`                  | No       | `development` or `production`            |

---

## 8. Deployment Considerations

| Concern             | Approach                                           |
|---------------------|----------------------------------------------------|
| Frontend hosting    | Vercel / Netlify (static SPA)                      |
| Backend hosting     | Railway / Render / Docker container                |
| Database            | Supabase (managed Postgres)                        |
| Environment secrets | Platform env vars (never committed)                |
| CORS                | Allow frontend domain in backend CORS config       |
| HTTPS               | Enforced by hosting platform                       |
| Rate limiting       | Consider express-rate-limit for auth endpoints     |
| Logging             | Structured JSON logs (pino / winston)              |
