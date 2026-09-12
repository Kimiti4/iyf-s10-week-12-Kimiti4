# MASTER REMEDIATION & CERTIFICATION REPORT

> Scope: JAMIILINK platform — authoritative repo `Kimiti4/iyf-s10-week-12-Kimiti4` (umbrella containing `iyf-s10-week-11-Kimiti4` backend, `iyf-s10-week-09-Kimiti4` frontend, and `iyf-s10-week-12-Kimiti4/docs`).
> Audit window: post-credential-purge (`HEAD = 202898f`), no code modifications during audit.
> Author: master remediation / certification pass (Phases 0–19).

## Executive Status

- **Repository**: `Kimiti4/iyf-s10-week-12-Kimiti4`
- **HEAD**: `202898f` ("fix(secrets): make rotate-founder.js work with live flat-schema users table")
- **Working tree**: clean
- **Overall certification status**: **NOT CERTIFIED**

The previously-rotated credential P0 has been remediated in canonical project history. The previously-passed Alerts functional remediation is structurally intact (69/69 contract tests). However, this audit has surfaced multiple new P0s (PII leak, authentication-bypass-class issues), several P1s (synthetic data served as real, MFA architecture wrong, JWT in localStorage with permissive CSP, dead router files causing 404s for several advertised features), and a number of P2s/P3s. The platform is **not** ready for production certification.

---

## P0 FINDINGS

| # | Finding | File:line | Status |
|---|---|---|---|
| P0-1 | `GET /api/users` is **public**; returns list of all users. Route comment says "admin/founder only" but the route file does not apply `restrictTo('admin','founder')`. | `iyf-s10-week-11-Kimiti4/src/routes/users.js:10` | OPEN |
| P0-2 | `GET /api/users/:id` is **public**; returns any user's full profile (email, PII). | `iyf-s10-week-11-Kimiti4/src/routes/users.js:11` | OPEN |
| P0-3 | `GET /api/metrics/users/:userId/activity` is **public**; returns any user's activity statistics. | `iyf-s10-week-11-Kimiti4/src/routes/metrics.js:17` | OPEN |
| P0-4 | `POST /api/tiannara/moderate` is **public and unauthenticated**; the moderation endpoint accepts arbitrary text from any caller with no rate limit, no audit identity, and no operational gating. Abuse vector: spam moderation requests, log poisoning, denial of service against downstream Tiannara service. | `iyf-s10-week-11-Kimiti4/src/routes/tiannara.js:75` | OPEN |
| P0-5 | TOTP MFA secret is **not server-persisted**; `verifyCode` accepts the secret from the request body, which means the "MFA" check is a shared secret and equivalent in security to a static password. (Architectural violation per prompt spec.) | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:239-248,302-309` | OPEN |
| P0-6 | Verification codes are kept in a `new Map()` (process-local). Violates prompt's "Do not rely on `new Map()`" rule. Multi-instance deployment loses codes on restart. Codes not bound to a user; keyed on client-supplied `contact` only. | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:222` | OPEN |
| P0-7 | JWT access token has 7-day lifetime with **no refresh / no revocation / no `aud` validation / stored in `localStorage`** under a CSP that allows `unsafe-inline` + `unsafe-eval` for scripts. Combined: any XSS = persistent account takeover. | `app.js:securityHeaders.js`, `authControllerPG.js:12-18`, `authPG.js:29`, `AuthContext.jsx:88,118` | OPEN |

(P0-1..P0-4 are **new** findings discovered during this audit; the prior auditor's "Backend certification: NOT CERTIFIED" reflected P0 credential exposure, now remediated in history, but did not surface these authorization / data-leakage issues.)

---

## P1 FINDINGS

| # | Finding | File:line | Status |
|---|---|---|---|
| P1-1 | `GET /api/locations` returns hardcoded in-memory data from `data/store.js`. Users see fake county/settlement lists. | `iyf-s10-week-11-Kimiti4/src/controllers/locationsController.js` | OPEN |
| P1-2 | `GET /api/market/prices` returns hardcoded in-memory data from `data/store.js`. Users see fake market prices. | `iyf-s10-week-11-Kimiti4/src/controllers/marketController.js` | OPEN |
| P1-3 | `POST /api/tiannara/{mental-health,fact-check,moderate}` is implemented as **keyword-list mocks** (not real AI). Files explicitly say "Simulate", "Placeholder - integrate with actual fact-checking API". | `iyf-s10-week-11-Kimiti4/src/routes/tiannara.js:103-249` | OPEN |
| P1-4 | `tiannaraService.js` is a real fetch client that **silently fail-opens** ("Moderation service unavailable, using fallback") when the external Tiannara service is down. Posts are then published unmoderated. | `iyf-s10-week-11-Kimiti4/src/services/tiannaraService.js:42-55` | OPEN |
| P1-5 | `impactController` returns `exchange_value: ${x*500} KES` and `time_saved: ${x*2} hours` — fabricated multipliers with no real basis. **Synthetic metrics served to users.** | `iyf-s10-week-11-Kimiti4/src/controllers/impactController.js:75-76` | OPEN |
| P1-6 | `skillsController.getMatches` returns `match_score: 0.95` (hardcoded) and `testimonials: Math.floor(Math.random() * 5)` (synthetic) for every match. **Fake match quality and testimonial counts.** | `iyf-s10-week-11-Kimiti4/src/controllers/skillsController.js:88-89` | OPEN |
| P1-7 | `skillsController.completeExchange` returns success **without persisting any state**. "Exchange completed and reviewed!" but no DB row. | `iyf-s10-week-11-Kimiti4/src/controllers/skillsController.js:96-105` | OPEN |
| P1-8 | 4 router files exist but are **not mounted in `routes/index.js`** — `reputation.js`, `impact.js`, `skills.js`, plus a misplaced `comments.js` (nested under posts but unimported): frontend calls them and 404s. | `iyf-s10-week-11-Kimiti4/src/routes/index.js` (missing mounts) | OPEN |
| P1-9 | 6 frontend API calls have no matching backend route: `POST /api/posts/:id/engage?type=...` (vs `/like`/`/upvote` separately), `GET /api/posts/search` (vs `?search=` query), `PATCH /api/comments/:commentId/like`, `GET /api/users/:userId/posts`, `POST/DELETE /api/users/:userId/follow`, `GET /api/users/verified`. | `iyf-s10-week-09-Kimiti4/src/services/api.js` (various) | OPEN |
| P1-10 | CSP allows `unsafe-inline` and `unsafe-eval` for `script-src` AND `unsafe-inline` for `style-src`. Combined with `localStorage` JWT, the XSS surface is large. | `iyf-s10-week-11-Kimiti4/src/middleware/securityHeaders.js:14-22` | OPEN |
| P1-11 | `requireAuth.js` middleware accepts **any** `Bearer <token>` and attaches a fake user — full auth bypass. Currently DEAD (not imported), but the file is in the repo and would be catastrophic if wired accidentally. | `iyf-s10-week-11-Kimiti4/src/middleware/requireAuth.js` | OPEN (DEAD but dangerous) |
| P1-12 | Email verification uses `nodemailer.createTestAccount()` (Ethereal) in production paths. In production this returns 500 or sends to a transient test inbox. | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:256-279` | OPEN |
| P1-13 | No failed-login counter / account lockout. `users.mfa_failed_attempts` and `mfa_locked_until` columns exist but are never read or written by auth code. | `schema.js:48-49`; auth controllers don't use them | OPEN |

---

## P2 FINDINGS

| # | Finding | File:line | Status |
|---|---|---|---|
| P2-1 | `/api/auth/send-verification` has no rate limit (authLimiter only covers `/register` and `/login`). Brute-forceable 6-digit OTP. | `routes/auth.js` | OPEN |
| P2-2 | `/api/auth/verify-code` has no attempt counter — failed attempts do not lock the verification flow. | `authControllerPG.js:295-331` | OPEN |
| P2-3 | Phone verification is `console.log('[BOT SIMULATION] Sending WhatsApp/Telegram...')` — no real SMS gateway. Should be explicitly `NOT IMPLEMENTED`. | `authControllerPG.js:281` | OPEN |
| P2-4 | `logout` is a server-side stub; token remains valid until natural JWT expiry (7d). | `authControllerPG.js:158-163` | OPEN |
| P2-5 | No JWT refresh token / rotation architecture. | absent | OPEN |
| P2-6 | No JWT `aud`/`iss` validation. | `authPG.js:29` | OPEN |
| P2-7 | `commentsControllerPG.deleteComment` allows author/admin/founder but **not moderator** (alerts controller does allow moderator). Inconsistency. | `commentsControllerPG.js:48-53` | OPEN |
| P2-8 | `routes/users.js` `GET /stats/:id?` is `protect` but accepts arbitrary `:id` (IDOR — user A can fetch user B's stats). | `routes/users.js:16` | OPEN |
| P2-9 | `daily-challenges.test.js` is broken by design (assumes running server, hardcoded token `Bearer jamii-link-ke-2026`, hits `/api/health` which is `/health`). | `iyf-s10-week-11-Kimiti4/daily-challenges.test.js` | OPEN |
| P2-10 | Two parallel schema-creation paths: `src/database/schema.js` (server.js startup) and `scripts/migrations/00X` (manual). Production startup only invokes `createTables()`; migrations 002/004 are not auto-applied. | `server.js:30-32`; `scripts/migrate.js` | OPEN |
| P2-11 | Migration 003 is misnamed and skipped. Filename: `003_remove_mongoose_from_schema.js`; MIGRATION_NAME constant: `003_clean_legacy`; not in runner. | `scripts/migrations/003_*` | OPEN |
| P2-12 | Root `package.json` lists `mongoose` as a dep, but no code at the root uses it (only the backend, which uses `pg`). | `package.json` | OPEN |
| P2-13 | `iyf-s10-week-12-Kimiti4/docs/` exists but the parent folder `iyf-s10-week-12-Kimiti4/` has no `package.json` and no code. | repo tree | OPEN |
| P2-14 | Backend `.gitignore` uses blanket `*.js` deny + explicit allowlist. Any new `.js` file in `src/` not under a whitelisted subdir is silently ignored. New `rotate-founder.js` required allowlist update. | `iyf-s10-week-11-Kimiti4/.gitignore:35-72` | OPEN |
| P2-15 | Misleading file naming: `controllers/*Controller.js` (without `PG`) are NOT legacy — they are active PG implementations. Naming risk for future audits. | `impactController.js`, `locationsController.js`, `marketController.js`, `reputationController.js`, `skillsController.js` | OPEN |
| P2-16 | Two parallel `User` repositories (`UserRepository.js`, `UsersRepository.js`) with overlapping re-exports. | `database/repositories/` | OPEN |
| P2-17 | DEAD source files: `controllers/authController.js`, `controllers/usersController.js`, `middleware/auth.js`, `middleware/requireAuth.js`, `seeds/seed-founder-postgres.js`, `seeds/setup-database.js`. | repo tree | OPEN |
| P2-18 | `data/store.js` is in `src/data/` not `archive/`, despite being a hardcoded mock data store used only by mock-data controllers. | `src/data/store.js` | OPEN |
| P2-19 | `SocketService` / socket.io wiring is present but no proof of authentication or which events are emitted. | `services/socketService.js` | OPEN |
| P2-20 | No structured logging; no request correlation ID; Sentry DSN env present but not used; no graceful-shutdown handler in `server.js`. | `middleware/logger.js`, `server.js` | OPEN |
| P2-21 | `reputationController.js` line 75: `exchange_value: ${exchange_value * 500} KES` and `time_saved: ${time_saved * 2} hours` are **invented** units — same as P1-5 but worth calling out separately. | `reputationController.js` | OPEN |
| P2-22 | Frontend e2e + a11y + Lighthouse + lint not executed during this audit (no running server). Test infrastructure exists. | Phase 14/18 | UNVERIFIED |
| P2-23 | `users/verified` endpoint missing (frontend calls it). | `routes/users.js` | OPEN |
| P2-24 | `posts/:slug` style slug lookups not supported; only `/:id`. Frontend uses `:slug` for organizations. | `routes/organizations.js:27` | OPEN |
| P2-25 | `reputation.js`, `impact.js`, `skills.js` route files reference `middleware/auth` (non-PG) which is DEAD. The controllers in those files may be active PG but the route wiring is broken. | `routes/reputation.js:8` | OPEN |

---

## P3 FINDINGS

| # | Finding | Status |
|---|---|---|
| P3-1 | `bcryptjs` major-version drift between root (`^3.0.3`) and backend (`^2.4.3`). Cosmetic. | OPEN |
| P3-2 | `iyf-s10-week-12-Kimiti4/` folder exists with no `package.json`. | OPEN |
| P3-3 | Misleading "mock" comments in `impactController.js` (lines 30, 51) — the underlying query is real; only the badge logic and value conversion are mock. | OPEN |
| P3-4 | No `jti` claim, no token revocation list. | OPEN |
| P3-5 | `Math.random()` for OTP generation is acceptable but not cryptographically secure; `crypto.randomInt(100000, 1000000)` is preferred. | OPEN |

---

## REMEDIATIONS COMPLETED (prior to this audit)

- **History scrub** (commits `d9dcfb7→159a9ad→42d1cb6→202898f` on umbrella `main`; `fb519bf→07bb0ba→ff98087→feb3e29→f4a47c2` on nested `main`): zero hits for either leaked credential literal in any commit, all branches.
- **Live-tree removal**: `archive/CREATE_FOUNDER_MONGO.js` deleted.
- **Seed hardening**: `src/seeds/founder-postgres.js` now reads password from `process.env.FOUNDER_PASSWORD` (fail-fast guard); printed password literal removed.
- **Founder rotation script**: `scripts/rotate-founder.js` — env-driven, idempotent (INSERT-or-rotate), works with the live flat-schema `users` table.
- **Migration drift fix**: `package.json` `db:migrate:all` → `node scripts/migrate.js` (no longer `migrate-all.js`).
- **Nested repo sync**: nested backend repo received the same `db:migrate:all` fix (`ff98087`) and the rotation script (`feb3e29`).
- **Alerts functional remediation** (commit `628ec1c`): rate-limit bypass in test env, settlement/ward filters wired into repository, contract suite hardened with `Content-Length` checks, geographic-filter semantic assertions. 69/69 tests.

---

## CAPABILITY REALITY (summary; full matrix in `CAPABILITY_REALITY_MATRIX.md`)

| Capability | Status |
|---|---|
| Alerts | REAL (69 contract tests prove semantics) |
| Posts | REAL (no dedicated test, but routes+controller+repository all real PG) |
| Comments | REAL (no dedicated test) |
| Organizations | REAL |
| Verification (badges) | REAL (admin-gated) |
| Auth (register/login/me/change-pwd) | PARTIAL (no failed-login counter, no lockout, MFA wrong, logout stub) |
| Impact tracking | PARTIAL (real DB write; fabricated value conversions) |
| Reputation | PARTIAL (real DB; hardcoded badge eligibility) |
| Skills (offer/seek) | REAL (DB-backed) |
| Skills (matches) | PARTIAL (DB query, but `match_score: 0.95` + random `testimonials`) |
| Locations | MOCK (returns hardcoded `data/store.js`) |
| Market prices | MOCK (returns hardcoded `data/store.js`) |
| Metrics (platform/trending) | REAL (real DB queries) |
| Tiannara AI | MOCK (keyword-based routes) + real client (silent fail-open) |
| OAuth (Google) | SCAFFOLD (explicitly deferred) |
| Founder/Admin dashboards | PARTIAL (UI present, untested backend path) |
| MFA | SCAFFOLD (architecture wrong) |
| Reels | UI-ONLY (no backend route/controller/repository) |
| Messaging | UI-ONLY |
| Notifications | UI-ONLY |
| Follows | UI-ONLY |
| Jams | UI-ONLY |
| Search (posts) | PARTIAL (only via `?search=` query param) |
| Socket.IO realtime | PARTIAL (wired; no proof of auth or events) |

---

## TEST RESULTS

- `npm run test:alerts` → **69 passed, 0 failed** ✅
- `npm run test:ratelimit` → **6 passed, 0 failed** ✅
- `npm test` (daily-challenges) → **FAIL (pre-existing; not run by this audit as fix)**
- `test:e2e`, `test:a11y`, `lhci`, `lint`, `vite build` → not executed (no running server); UNVERIFIED.

---

## MIGRATION STATUS

- **Fresh DB**: `scripts/migrate.js` runs `createTables()` → migration 002 → migration 004. Idempotent. ✅
- **Existing DB upgrade**: `createTables()` is mostly no-op (uses `IF NOT EXISTS`); 002 adds CHECK constraints and `radius_km`; 004 converts `radius_km` to `NUMERIC(6,2)` and adds FTS/trigram. Forward-compatible, with NULLIF fallback for non-numeric casts. ✅
- **Production startup path**: `server.js` calls `createTables()` only; **migrations 002/004 are not auto-applied**. This works today only because `createTables()` already inlines the relevant columns/indexes. ⚠

---

## SECURITY STATUS

| Area | Status |
|---|---|
| Secret scan (current tree) | clean (zero credential literals) |
| Secret scan (canonical history) | clean (zero hits across all refs) |
| Authentication (register/login) | bcrypt, OK |
| MFA | architecturally wrong (P0-5) |
| Verification | `new Map()` (P0-6), Ethereal email (P1-12) |
| OAuth | SCAFFOLD |
| Sessions / tokens | 7d JWT in localStorage, no refresh, no revoke, no `aud` |
| Authorization (server-side) | multiple P0 leaks (P0-1..P0-4) |
| CSP | `unsafe-inline` + `unsafe-eval` enabled (P1-10) |
| CORS | env-driven allowlist, no wildcard (OK) |
| Rate limiting | per-IP on auth+alerts; bypassed in test env (OK) |
| Verification | see above |

---

## FRONTEND STATUS (audit only)

| Area | Status |
|---|---|
| Build | not run (UNVERIFIED) |
| Lint | not run (UNVERIFIED) |
| E2E | exists, not run (UNVERIFIED) |
| A11y | exists, not run (UNVERIFIED) |
| Lighthouse | exists, not run (UNVERIFIED) |
| ErrorBoundary / EmptyState / Skeleton / Toast | primitives present |
| Performance budgets | scripts present |
| Feature parity (UI vs backend) | **gap** (Reels, Messaging, Notifications, Follows, Jams have UI but no backend) |

---

## DEPLOYMENT STATUS

- Railway (`iyf-s10-week-11-Kimiti4` build path, `bash start.sh`, `/api/health`) ✅
- Vercel (frontend) ✅
- Migrations auto-run on prod boot: **NO** (relies on `createTables()` inlining) ⚠
- Env validation: **NO** ⚠
- Graceful shutdown: **NO** ⚠
- Sentry / structured logging: **NO** (env var exists, not used) ⚠
- Health endpoint: `/health` and `/api/health` both exist; Railway uses `/api/health` (OK) ✅

---

## RESIDUAL RISKS

1. **Active P0s** (P0-1..P0-7) expose PII and enable account takeover. These are real production-impact bugs and must be fixed before any user traffic.
2. **Synthetic data served to users** (P1-1..P1-3, P1-5..P1-7) means dashboards, location dropdowns, market prices, and skill match scores are all fake. Users will see and trust them.
3. **Dead routers** (P1-8) — clicking "Reputation", "Impact", "Skills" in the UI produces 404s. Frontend pages exist for these and look complete.
4. **6 unmatched frontend paths** (P1-9) — follow/like/search flows are broken.
5. **Workspace-local residual exposure** — Cline IDE checkpoint refs and `jazzy-break` worktree branch still contain the credential literal locally. Not pushed, not in certification scope, but should be GC'd.
6. **Week-09 separate repo** — `refs/remotes/week09/main` contains the literal once. The week-09 frontend repo is a separate project and was not in the credential-purge scope. Recommend running the same sanitizer on it.
7. **GitHub cache** — even though the canonical history is scrubbed, GitHub may still serve cached views of old commit objects. Recommend GitHub Support purge.
8. **Force-push on `railway/code-change-5NlDGD`** — Railway's deployment may be affected. Re-pull / re-deploy if running.

---

## FINAL GATE MATRIX

| Gate | Requirement | Evidence | Status |
|---|---|---|---|
| G01 | Security (secrets, authn, authz, MFA, OAuth, sessions, CSP, CORS, rate limiting) | Phase 1, 2, 5, 6, 12 | **FAIL** (P0-1..P0-4 active leaks; P0-5/6/7 architectural; P1-10 CSP) |
| G02 | Authentication | Phase 2, 3 | **FAIL** (MFA wrong, verification Map, Ethereal, no lockout) |
| G03 | Authorization | Phase 12 | **FAIL** (P0-1..P0-4 PII leaks) |
| G04 | Database | Phase 7 | **CONDITIONAL** (idempotent; two parallel systems) |
| G05 | Migrations | Phase 7, 17 | **CONDITIONAL** (works because `schema.js` inlines, but no auto-migrate on prod) |
| G06 | API contracts | Phase 11 | **FAIL** (4 dead routers, 6+ unmatched paths) |
| G07 | Capability reality | Phase 9 | **FAIL** (multiple MOCK endpoints in production paths; UI-only capabilities) |
| G08 | Frontend | Phase 14 | **UNVERIFIED** (build/lint/e2e/a11y/Lighthouse not executed) |
| G09 | E2E | Phase 15, 18 | **UNVERIFIED** (not run; alerts contract green) |
| G10 | Deployment | Phase 17 | **CONDITIONAL** (deploy configs OK; migration auto-run, env validation, graceful shutdown missing) |

---

## RECOMMENDATION

**NOT READY — REMEDIATION REQUIRED.**

This audit revealed significantly more issues than the prior certification suggested. The previously-rotated credential P0 is correctly remediated, and the previously-passed Alerts functional remediation is intact, but the platform's user-facing surface is much smaller and more brittle than the public commit history implies. Several P0s (PII leakage) and P1s (synthetic data, dead routers) need to be addressed before any production traffic is allowed.

A subsequent "Remediation Pass" should be authorized by the human operator, with explicit per-change approval, in the order:

1. **P0-1..P0-4**: Add `protect` + `restrictTo('admin','founder')` to `users.js` and `metrics.js`; gate `tiannara/moderate` behind auth + rate limit + audit identity.
2. **P0-5/6/7**: Server-persist TOTP secrets; replace `new Map()` with DB-backed verification records; move JWT to short-lived + refresh + HttpOnly cookie.
3. **P1-1/2/3**: Implement real Locations/Market/Tiannara or explicitly mark `NOT IMPLEMENTED — EXPLICITLY DEFERRED`.
4. **P1-5/6/7**: Remove fabricated value conversions and fake match scores; persist exchange completions.
5. **P1-8/9**: Mount `reputation/impact/skills/comments` routers (or remove the frontend's expectations); fix `posts/:id/engage` and the other unmatched paths.
6. **P1-10**: Tighten CSP (production); remove `unsafe-inline`/`unsafe-eval` from `script-src`.
7. **P1-11**: Delete `middleware/requireAuth.js` (or rename + add a clear "DO NOT IMPORT" guard).
8. **P2 / P3**: Hygiene cleanup.

This document is itself a certification artifact. Do not move to "READY FOR CERTIFICATION" until the items above are addressed and re-audited.
