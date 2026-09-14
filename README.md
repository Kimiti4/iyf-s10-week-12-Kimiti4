# JamiiLink

> Full-stack community platform for sharing information, trading goods, and building trusted local communities.

JamiiLink is a production-oriented full-stack application built around a React frontend, Express API, **PostgreSQL persistence**, and JWT-based authentication.

The repository represents the final Week 12 implementation of the project and is presented here as a **full-stack engineering project**, rather than only as a course exercise.

## Product scope

JamiiLink provides a community publishing workflow with authenticated users, posts, profiles, search, verification/credibility features, and responsive access across desktop and mobile layouts.

### Core capabilities

- User registration, login, and JWT authentication
- Protected frontend routes and authenticated API operations
- Create, read, update, and delete posts
- Search by post title, content, and category
- User profiles and post history
- Image upload support
- Post credibility / verification workflow
- Responsive UI
- Backend health endpoint
- Environment-based configuration for development and deployment

## Current architecture

```text
┌─────────────────────┐
│   React + Vite UI   │
│     Frontend        │
└──────────┬──────────┘
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│   Express.js API    │
│ Auth / CRUD / HTTP  │
└──────────┬──────────┘
           │ pg / SQL
           ▼
┌─────────────────────┐
│     PostgreSQL      │
│ application data   │
└─────────────────────┘
```

The backend uses the Node `pg` driver and a `DATABASE_URL` connection string. The documented deployment database is Supabase PostgreSQL-compatible infrastructure; the application is not currently a MongoDB/Mongoose application.

### Main stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, `pg` |
| Authentication | JWT, bcryptjs |
| API integration | REST / JSON |
| Security | Helmet, CORS, rate limiting, parameterized SQL |
| Realtime | Socket.IO (degraded operation is supported if realtime initialization fails) |
| Production hosting | Separate frontend/backend deployment; Vercel-compatible frontend and Node-compatible backend |
| Database hosting | Supabase PostgreSQL-compatible deployment |

## Repository structure

```text
iyf-s10-week-12-Kimiti4/
├── iyf-s10-week-09-Kimiti4/    # React frontend
├── iyf-s10-week-11-Kimiti4/    # Express/PostgreSQL backend
├── docs/                       # Project and audit documentation
├── .github/workflows/          # CI/CD
├── README.md
└── ...
```

## Running locally

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (local or hosted)

### Backend

```bash
cd iyf-s10-week-11-Kimiti4
npm install
cp .env.example .env
```

Set `DATABASE_URL`, a strong `JWT_SECRET`, and the frontend origin before starting the API.

```bash
npm run db:migrate:all
npm run dev
```

### Frontend

In a second terminal:

```bash
cd iyf-s10-week-09-Kimiti4
npm install
cp .env.example .env
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

## Configuration

### Backend

The authoritative backend variables are documented in `iyf-s10-week-11-Kimiti4/.env.example`:

```text
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
PORT=3001
NODE_ENV=development
```

Never commit real credentials, tokens, production database URLs, or `.env` files.

### Frontend

The frontend uses Vite environment configuration for the API base URL. See `iyf-s10-week-09-Kimiti4/.env.example`.

## API and health monitoring

The backend exposes:

```text
GET /api/health
```

Health verification is part of backend CI and should be checked after deployment. A deployment is not considered operational merely because the frontend builds successfully.

## Verification model

JamiiLink deliberately separates three verification layers:

1. **Frontend E2E:** Playwright verifies UI, navigation, accessibility, and user journeys with browser-level API interception. These tests do not prove that the deployed backend or database works.
2. **Backend integration/contract tests:** Node tests exercise the Express API, PostgreSQL repositories, validation, authorization, database constraints, and rate limiting against a real test database.
3. **Production verification:** deployment-specific checks must verify the actual frontend URL, backend URL, CORS configuration, database connectivity, authentication, and critical workflows.

This distinction prevents a green mocked browser suite from being misrepresented as full-stack certification.

## CI

GitHub Actions now treats frontend verification and backend verification as separate gates. Frontend build/E2E/Lighthouse checks remain in place, while the backend gate installs the backend, runs PostgreSQL-backed migrations and contract tests, verifies rate limiting, and performs a live health check against the started API.

See `.github/workflows/ci.yml` and `docs/CURRENT_ARCHITECTURE_AND_VERIFICATION.md` for the current verification boundary.

## Deployment

The intended production topology is:

```text
Frontend  → Vercel-compatible static/Vite hosting
Backend   → Node-compatible managed hosting
Database  → PostgreSQL (Supabase-compatible)
```

The exact backend provider is deployment configuration, not part of the application architecture. Before deploying, set the frontend API URL and backend `CORS_ORIGIN` to the actual deployed origins and verify `GET /api/health`.

Historical audit documents may mention Railway, Render, Fly, MongoDB, or other earlier arrangements. Those references describe historical work and are not the authoritative current architecture unless explicitly marked current.

## Engineering lessons

The project demonstrates practical full-stack concerns including:

- REST API integration between independent frontend/backend layers
- Authentication and authorization boundaries
- Protected client-side routes
- CORS configuration
- Environment-specific configuration
- PostgreSQL connectivity and migrations
- Parameterized SQL
- CRUD lifecycle design
- Loading/error states in the UI
- Health monitoring
- Rate limiting and HTTP security headers
- Accessibility and responsive UI considerations
- Explicit separation of mocked UI tests from real backend verification

## Project context

JamiiLink is one of the three public-facing flagship projects used to demonstrate the engineering progression around the broader Tiannara work.

It is deliberately presented separately from the **Main Tiannara** system and the **Tiannara Software Platform**, which have different scopes and architectural objectives.

## License

See the repository's license and project documentation for applicable terms.

---

**JamiiLink · Amos Kariuki · Nairobi, Kenya**
