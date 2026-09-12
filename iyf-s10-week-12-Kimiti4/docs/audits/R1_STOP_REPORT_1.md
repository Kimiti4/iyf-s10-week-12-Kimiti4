# R1 — P0 AUTHORIZATION REMEDIATION — STOP REPORT 1 (PRE-IMPLEMENTATION)

> Per Master Prompt §28. Read-only design phase.

## PHASE: R1 — P0 Authorization Remediation
## STATUS: BLOCKED (awaiting user authorization to proceed to implementation)

## FINDINGS ADDRESSED (planned)

| ID | Description | File:line | Severity |
|---|---|---|---|
| P0-1 | `GET /api/users` is public (no `protect`) | `iyf-s10-week-11-Kimiti4/src/routes/users.js:10` | P0 |
| P0-2 | `GET /api/users/:id` is public; full profile (incl. `email`, MFA status) is returned to anyone | `iyf-s10-week-11-Kimiti4/src/routes/users.js:11` + `usersControllerPG.js:29-38` | P0 |
| P0-3 | `GET /api/metrics/users/:userId/activity` is public | `iyf-s10-week-11-Kimiti4/src/routes/metrics.js:20` + `metricsControllerPG.js:59-91` | P0 |
| P0-4 | `POST /api/tiannara/moderate` is public; privileged moderation endpoint accepts arbitrary text from any caller | `iyf-s10-week-11-Kimiti4/src/routes/tiannara.js:75-99` | P0 |
| P1-11 | `src/middleware/requireAuth.js` is a full auth-bypass (any Bearer token → fake user); zero importers — DEAD but dangerous | `iyf-s10-week-11-Kimiti4/src/middleware/requireAuth.js` | P1 |
| P2-8 | IDOR on `GET /api/users/stats/:id?` (protected, but `:id` is arbitrary) | `iyf-s10-week-11-Kimiti4/src/routes/users.js:16` | P2 |

## REUSE-CONFIRMED FACTS (RECON)

```text
canonical auth middleware : src/middleware/authPG.js (used by 9 route files)
legacy middleware/auth.js  : imported ONLY by src/routes/reputation.js
                              (which is itself a dead router per P1-8)
middleware/requireAuth.js  : zero importers anywhere
canonical UserRepository  : src/database/repositories/UserRepository.js
                              -> formatUser() strips password + mfa_recovery_codes
                              -> but still returns email + mfa.enabled etc.
UsersRepository.findById  : returns raw row including mfa_recovery_codes
                              (NOT used by authPG; only by admin controllers)
```

## FILES TO BE CHANGED (planned)

```text
M src/routes/users.js
    - add protect + restrictTo to GET /api/users
    - add protect to GET /api/users/:id
    - guard GET /api/users/stats/:id? with owner/admin/founder check

M src/controllers/usersControllerPG.js
    - getUserById: project a safe shape when requester is not owner/admin/founder
      (strip email, mfa, currentOrganization, internal timestamps)

M src/routes/metrics.js
    - add protect to GET /api/metrics/users/:userId/activity
    - controller-side enforcement that requester is self/admin/founder/moderator

M src/controllers/metricsControllerPG.js
    - getUserMetrics: enforce requester policy

M src/routes/tiannara.js
    - require protect + restrictTo('admin','moderator','founder') at module load
    - all three endpoints (mental-health, fact-check, moderate) get the same gate
    - response body: add a clear "mock/scaffold" disclaimer in development only

D src/middleware/requireAuth.js
    - delete (zero importers; no safer alternative in scope)

A tests/authorization.r1.test.js
    - executable evidence for T1..T19 (see DESIGN)
```

## TEST PLAN (DESIGN)

| Test ID | Endpoint | Method | Auth | Expected |
|---|---|---|---|---|
| T1 | `GET /api/users` | anonymous | none | 401 |
| T2 | `GET /api/users` | ordinary user | Bearer | 403 |
| T3 | `GET /api/users` | admin | Bearer | 200; payload does NOT include `password` or `mfa_recovery_codes` |
| T4 | `GET /api/users/:id` | anonymous | none | 401 |
| T5 | `GET /api/users/:otherUserId` | ordinary user A | Bearer | 200; payload does NOT include `email`, `mfa.*`, `currentOrganization` |
| T6 | `GET /api/users/<ownId>` | ordinary user A | Bearer | 200; payload includes `email`, `mfa.*` (owner view) |
| T7 | `GET /api/users/<otherUserId>` | admin | Bearer | 200; full profile |
| T8 | `GET /api/metrics/users/:userId/activity` | anonymous | none | 401 |
| T9 | `GET /api/metrics/users/<otherUserId>/activity` | ordinary user A | Bearer | 403 |
| T10 | `GET /api/metrics/users/<ownId>/activity` | ordinary user A | Bearer | 200 |
| T11 | `GET /api/metrics/users/<anyUserId>/activity` | admin | Bearer | 200 |
| T12 | `POST /api/tiannara/moderate` | anonymous | none | 401 |
| T13 | `POST /api/tiannara/moderate` | ordinary user | Bearer | 403 |
| T14 | `POST /api/tiannara/moderate` | moderator | Bearer | 200; body contains `moderation.*`; status reflects R1 gate (mock is still R3's concern) |
| T15 | `POST /api/tiannara/moderate` | admin | Bearer | 200 |
| T16 | `git grep` for `middleware/requireAuth` in canonical tree | n/a | n/a | 0 hits after deletion |
| T17 | `GET /api/users/stats/<otherUserId>` | ordinary user A | Bearer | 403 |
| T18 | `GET /api/users/stats/<ownId>` | ordinary user A | Bearer | 200 |
| T19 | `GET /api/users/stats/<anyUserId>` | admin | Bearer | 200 |

## TESTS (currently green; to be re-run after implementation)

```text
npm run test:alerts    : 69/69 PASS (R0 baseline)
npm run test:ratelimit : 6/6 PASS  (R0 baseline)
```

Both MUST remain green after R1.

## SECURITY IMPACT (planned)

After R1:
- P0-1..P0-4 closed
- P1-11 closed (file deleted)
- P2-8 closed
- Net: zero public PII surface on the canonical app
- No change to alerts behavior, no change to alerts test contract

## RESIDUAL RISKS (carried into later phases, NOT R1)

```text
- Tiannara keyword-mock body (P1-3, P1-4) -> R3 capability reality
- CSP unsafe-inline (P1-10)                 -> R5
- JWT 7-day in localStorage (P0-7)           -> R5
- TOTP not server-persisted (P0-5)           -> R2
- verification state in new Map() (P0-6)     -> R2
- dead routers (P1-8)                        -> R3/R4
- 6 unmatched frontend paths (P1-9)          -> R3/R4
- impact/skills synthetic metrics (P1-5/6/7) -> R3
- no failed-login counter (P1-13)            -> R2
- email verification uses Ethereal (P1-12)   -> R2
```

## NEXT PHASE (after user authorization)

R1 IMPLEMENT -> VERIFY (alerts 69/69, ratelimit 6/6, new T1..T19) -> ADVERSARIAL VERIFY -> STOP REPORT 2.

## GIT

```text
HEAD           : 202898f (frozen from R0)
working tree   : (R1 changes not yet applied)
untracked      : docs/audits/P0_P1_REMEDIATION_BASELINE.md (R0)
                 docs/audits/MASTER_REMEDIATION_REPORT.md
                 docs/audits/CAPABILITY_REALITY_MATRIX.md
                 docs/audits/SECURITY_REVIEW.md
                 docs/audits/FINAL_CERTIFICATION_MATRIX.md
                 docs/audits/R1_STOP_REPORT_1.md (this file)
commit/push    : NO
```

## AWAITING USER CONFIRMATION

The plan above is read-only. Implementation requires explicit per-file approval
per Master Prompt §0.2. Confirm to proceed.
