# JamiiLink — Current Architecture & Verification Boundary

**Status:** Current-state reference

This document is the authoritative high-level description of the current JamiiLink repository. Older audit/deployment documents may describe earlier stacks and must not be treated as current architecture unless explicitly marked current.

## 1. Current architecture

```text
React + Vite
    │
    │ HTTP / JSON
    ▼
Node.js + Express
    │
    ├── JWT authentication / authorization
    ├── validation / error handling
    ├── Helmet / CORS / rate limiting
    ├── REST API
    └── Socket.IO realtime channel
    │
    │ pg / parameterized SQL
    ▼
PostgreSQL
```

The backend uses PostgreSQL through the `pg` package and `DATABASE_URL`. Supabase-compatible PostgreSQL is supported. MongoDB/Mongoose is not the current persistence layer.

## 2. Verification layers

### Layer A — Frontend/UI certification

The Playwright suites exercise the built React application and intentionally intercept API calls at the browser boundary. This is valuable for UI behavior, navigation, accessibility, responsive flows, and deterministic user journeys.

It does **not** establish:

- database connectivity;
- backend route correctness;
- real authentication against the backend;
- authorization against real persisted users;
- production CORS correctness;
- persistence across backend restarts;
- production deployment health.

### Layer B — Backend integration certification

The backend CI gate runs against a real PostgreSQL service. It performs database migrations and runs the alert contract suite and rate-limiter verification. These tests exercise the Express application, repositories, validation, authorization, database constraints, and rate-limiting behavior.

The CI job also starts the backend and requires a successful `GET /api/health` response.

### Layer C — Production verification

Production certification remains environment-specific. A successful CI run does not prove that a particular hosting provider, production database, DNS configuration, CORS origin, email/SMS integration, Socket.IO connection, or third-party service is operational.

After deployment, verify at minimum:

1. frontend loads from the deployed origin;
2. frontend API base URL points to the intended backend;
3. backend health endpoint returns healthy status;
4. backend `CORS_ORIGIN` exactly matches the deployed frontend origin;
5. registration/login and authenticated API calls work against the production database;
6. ownership/authorization boundaries hold for real users;
7. critical create/read/update/delete workflows persist correctly;
8. uploads and external notification integrations work if enabled;
9. realtime functionality works if it is required by the release;
10. logs and error handling expose failures without leaking secrets.

## 3. Security baseline

The current backend includes security middleware and controls including Helmet, CORS, request-size limits, rate limiting, JWT authentication, bcrypt-based password handling, centralized error handling, and parameterized PostgreSQL queries.

The alert contract suite explicitly covers ownership/authorization behavior and PostgreSQL CHECK constraints. The rate-limiter suite verifies that production-style limits return HTTP 429 while test-mode bypass is available for contract testing.

This is a security baseline, not a claim of vulnerability-free operation. Production certification still requires environment and dependency review and, where appropriate, external security testing.

## 4. CI policy

A deployment gate must not depend only on mocked browser tests. The CI pipeline therefore requires both:

- frontend build + Playwright + Lighthouse verification; and
- PostgreSQL-backed backend integration + health verification.

The frontend mocked tests remain in place because removing them would discard useful deterministic UI coverage. They are simply no longer presented as proof of full-stack behavior.

## 5. Historical documentation policy

Earlier project stages used different deployment and persistence arrangements. References to MongoDB, MongoDB Atlas, Railway, Render, Fly, or earlier URLs may remain in historical audit records because those records preserve project provenance.

When current behavior conflicts with a historical record, this document and the actual source code take precedence for current-state claims.
