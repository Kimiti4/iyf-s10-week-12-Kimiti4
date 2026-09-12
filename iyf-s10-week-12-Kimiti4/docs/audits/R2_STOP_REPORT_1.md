# R2 — P0 MFA / VERIFICATION REMEDIATION — STOP REPORT 1 (PRE-IMPLEMENTATION)

> Per Master Prompt §28. Read-only design phase.

## PHASE: R2 — P0 MFA / Verification Remediation
## STATUS: BLOCKED (awaiting user authorization to proceed to implementation)

## FINDINGS ADDRESSED (planned)

| ID | Description | File:line | Severity |
|---|---|---|---|
| P0-5 | TOTP secret is supplied by the client and not server-persisted; verify reads `req.body.secret` | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:239-248, 302-309` | P0 |
| P0-6 | Verification state is `new Map()` keyed on `contact`; lost on restart; not multi-instance safe; not bound to user | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:222` | P0 |
| P1-12 | Email verification uses `nodemailer.createTestAccount()` (Ethereal) in production paths; no provider abstraction | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:256-279` | P1 |
| P1-13 | No failed-login counter / lockout. `mfa_failed_attempts` / `mfa_locked_until` columns exist but no code writes to them | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:99-153` (login) | P1 |
| P2-1 | `/api/auth/send-verification` has no rate limit (authLimiter only covers register/login) | `iyf-s10-week-11-Kimiti4/src/app.js:55-58` | P2 |
| P2-2 | `/api/auth/verify-code` has no rate limit / attempt counter | same | P2 |
| (Math.random) | OTP generated with `Math.random()` | `iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js:225` | — |

## REUSE-CONFIRMED FACTS (RECON)

```text
schema live (jamiilink_test):
  mfa_methods table      : present (id, user_id, type, verified,
                            primary_method, secret TEXT, backup_codes TEXT[],
                            phone_number, email, added_at)
  users.mfa_enabled      : present
  users.mfa_require_all_methods : present
  users.mfa_last_verified : present
  users.mfa_failed_attempts : present  (NO code writes to it)
  users.mfa_locked_until : present   (NO code writes to it)
  verification_codes     : NOT present (must be created in R2)
  login_streak           : NOT present  (R6 carry, NOT in R2 scope)

canonical middleware:
  src/middleware/authPG.js  : protect / optionalAuth / restrictTo
  src/middleware/requireAuth.js : DELETED in R1
  src/middleware/auth.js (non-PG) : imported only by unmounted
                                     routes/reputation.js (R3 carry)

existing limiter:
  src/middleware/rateLimiter.js : generalLimiter, authLimiter, alertLimiter
  app.js mount: /api/ (general), /api/auth/register, /api/auth/login
  /api/auth/send-verification, /api/auth/verify-code: UNCOVERED

nodemailer usage:
  Only in authControllerPG.js, with createTestAccount() — no abstraction.
```

## FILES TO BE CHANGED (planned)

```text
M src/middleware/rateLimiter.js
    + verificationLimiter (5 / 15min, NODE_ENV=test bypass)
A src/services/emailService.js
    + new email provider abstraction (SMTP env-driven, fails closed
      in production, Ethereal only in development, NOOP in test)
M src/app.js
    + mount verificationLimiter on /api/auth/send-verification
      and /api/auth/verify-code
M src/database/schema.js
    + verification_codes table inline (id, user_id nullable, purpose,
      contact, code_hash, expires_at, attempt_count, used_at, created_at)
A src/database/repositories/VerificationCodeRepository.js
    + create / findActive / incrementAttempts / consume
A src/controllers/mfaControllerPG.js
    + enrollTotp (auth-required, server-generates + persists secret,
      returns { qrCode, otpauth_url } — no raw secret)
    + verifyTotp (auth-required, reads server-stored secret,
      NEVER reads client-supplied secret)
M src/controllers/authControllerPG.js
    - delete verificationCodes Map + generateCode
    - delete nodemailer createTestAccount block
    - switch OTP generator to crypto.randomInt
    - replace /send-verification email branch with emailService.send;
      return deliveryStatus (delivered | noop | failed)
    - replace /verify-code: persist + lookup via VerificationCodeRepository
    - login: lockout check, increment-on-failure with bounded backoff,
      reset-on-success
M src/routes/auth.js
    + POST /mfa/totp/enroll   (auth required)
    + POST /mfa/totp/verify   (auth required)
A tests/authorization.r2.test.js
    + T20..T35 executable suite
```

## TEST PLAN (DESIGN)

| Test | Endpoint / behavior | Expected |
|---|---|---|
| T20 | `/api/auth/mfa/totp/enroll` anonymous | 401 |
| T21 | `/api/auth/mfa/totp/enroll` userA | 200; returns qrCode + otpauth_url; raw secret NOT in response |
| T22 | `/api/auth/mfa/totp/verify` with `secret` in body | server uses server-stored secret; ignores client secret (proves P0-5 closure) |
| T23 | `/api/auth/mfa/totp/verify` with valid TOTP | 200; users.mfa_enabled=true; mfa_methods.verified=true |
| T24 | 3 wrong codes | 401; users.mfa_failed_attempts == 3 |
| T25 | 5 wrong codes | 401; users.mfa_locked_until > NOW() |
| T26 | verify after lockout | 423 with retryAfter |
| T27 | `/api/auth/send-verification` 6 rapid hits | 429 (rate limit) |
| T28 | `/api/auth/send-verification` response body | contains deliveryStatus; in NODE_ENV=test -> noop |
| T29 | `/api/auth/verify-code` with issued code | 200; used_at set; replay -> 401 |
| T30 | 3 wrong codes on /verify-code | 401; attempt_count increases; row forced-consumed at 5 |
| T31 | /verify-code after forced-consume | 401 |
| T32 | `/api/auth/login` 5x wrong password | account temporarily locked; mfa_locked_until set; subsequent login 423 |
| T33 | `/api/auth/login` after lockout window expires | 200; counters reset |
| T34 | restart-safety: create code, query DB, verify in same test process | 200; DB row state asserted directly |
| T35 | multi-instance: two parallel verify with same code | first 200, second 401 (replay protection) |

## TESTS (currently green; to be re-run after implementation)

```text
npm run test:alerts    : 69/69 PASS  (R0/R1 baseline; R2 must preserve)
npm run test:ratelimit : 6/6 PASS   (R0/R1 baseline; R2 must preserve)
npm run test:r1       : 26 PASS, 4 DEFERRED (R1 baseline; R2 must preserve)
```

All three must remain green after R2.

## SECURITY IMPACT (planned)

After R2:
- P0-5 closed (server-persisted TOTP secrets)
- P0-6 closed (DB-backed verification_codes)
- P1-12 closed (provider abstraction; fail-closed in production)
- P1-13 closed (bounded backoff; reset on success)
- P2-1/2 closed (rate-limited verification endpoints)
- Math.random -> crypto.randomInt (no security-relevant change elsewhere)
- Net: the entire verification path is durable, restart-safe, multi-instance safe

## RESIDUAL RISKS (carried into later phases, NOT in R2)

```text
- P0-7 JWT/session redesign                       -> R5
- login_streak DB schema drift (R1 deferred)      -> R6
- Tiannara mock body (P1-3)                       -> R3
- dead routers / unmatched paths (P1-8/9)        -> R3/R4
- impact/skills synthetic metrics (P1-5/6/7)      -> R3
- daily-challenges.test.js (P2-9)                -> R2 cleanup or R3
- Cline workspace checkpoint credential          -> workspace-internal
```

## SCHEMA-DRIFT POLICY FOR R2

```text
- I will NOT add the login_streak column.
- I will NOT alter users.* columns beyond what the new verification_codes
  table requires (it is a NEW table, not a column change).
- I will NOT touch archive/*.
- The R1 deferred tests (T10/T11/T18/T19) will remain deferred.
- If a planned R2 test genuinely needs login_streak, I will document the
  dependency and STOP rather than silently fixing.
```

## GIT (planned)

```text
HEAD           : 202898f (frozen; R1 changes also frozen in working tree)
working tree   : R1 changes (5 files) + R2 changes (planned ~7 files)
                + new tests/authorization.r2.test.js
                + untracked docs/audits/* docs
untracked      : docs/audits/MASTER_REMEDIATION_REPORT.md
                 docs/audits/CAPABILITY_REALITY_MATRIX.md
                 docs/audits/SECURITY_REVIEW.md
                 docs/audits/FINAL_CERTIFICATION_MATRIX.md
                 docs/audits/P0_P1_REMEDIATION_BASELINE.md
                 docs/audits/R1_STOP_REPORT_1.md
                 docs/audits/R1_STOP_REPORT_2.md
                 docs/audits/R2_STOP_REPORT_1.md (this file, after
                                                  authorization)
commit/push    : NO
```

## NEXT PHASE (after user authorization)

R2 IMPLEMENT -> VERIFY (T20..T35 + R1 baseline preserved + alerts 69/69 +
ratelimit 6/6) -> ADVERSARIAL VERIFY -> STOP REPORT 2.

## AWAITING USER CONFIRMATION

The plan above is read-only. Implementation requires explicit per-file approval
per Master Prompt §0.2. Confirm to proceed.
