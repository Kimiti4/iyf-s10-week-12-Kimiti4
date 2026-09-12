# R2 — P0 MFA / VERIFICATION REMEDIATION — STOP REPORT 2 (POST-IMPLEMENTATION)

> Per Master Prompt §28. Implementation + verification complete.
> No commit performed (§0.2, §30).

## STATUS: PASS

## FINDINGS CLOSED

| ID | Title | Status | Evidence |
|---|---|---|---|
| P0-5 | TOTP secret not server-persisted; client-supplied | **CLOSED** | T20 (anon 401), T21 (enroll 200, no raw secret in response), T22 (server ignores client `secret`, verifies against stored secret → 200), T23 (mfa_enabled=true); adversarial grep: zero `req.body.*secret` reads in mfa path, zero v12 API remnants |
| P0-6 | verification state in `new Map()` | **CLOSED** | T29 (row in DB, bcrypt hash, expiry), T30 (attempt_count), T31 (forced-consume), T34 (DB-backed), T35 (atomic single-use), XPROC cross-process PASS; adversarial grep: zero `new Map(`, zero `verificationCodes` remnants |
| P1-12 | Ethereal email in production paths | **CLOSED** | T28 (deliveryStatus present; `noop` in test); emailService fails closed in production, Ethereal dev-only, NOOP in test; grep: zero `createTestAccount` outside emailService |
| P1-13 | No failed-login counter / lockout | **CLOSED** | T32 (5x wrong → 423 + lockedUntil), T33 (success after window → 200 + counters reset); server-side persistent (`users.mfa_failed_attempts`, `users.mfa_locked_until`) |
| P2-1 | `/send-verification` no rate limit | **CLOSED** | T27 (6th hit → 429 via live probe app with verificationLimiter active) |
| P2-2 | `/verify-code` no attempt limit | **CLOSED** | T30 (attempt_count→3), T31 (forced-consume at 5, subsequent 400) |
| Math.random→crypto.randomInt | OTP generation | **CLOSED** | generateNumericCode uses crypto.randomInt; grep: zero Math.random in auth/verification paths (only comment mentions) |

**P0-7 explicitly NOT marked closed** (per user correction; R5 owns JWT/session).

## FILES CHANGED

```text
M iyf-s10-week-11-Kimiti4/src/middleware/rateLimiter.js
    + verificationLimiter (5/15min, test-env bypass like the others)
M iyf-s10-week-11-Kimiti4/src/app.js
    + mount verificationLimiter on /api/auth/send-verification + /verify-code
    + import verificationLimiter
M iyf-s10-week-11-Kimiti4/src/database/schema.js
    + verification_codes table + 2 indexes (idempotent, IF NOT EXISTS)
M iyf-s10-week-11-Kimiti4/src/controllers/authControllerPG.js
    - deleted verificationCodes Map, generateCode (Math.random),
      inline nodemailer.createTestAccount block
    + sendVerification: crypto.randomInt code → VerificationCodeRepository
      → emailService.send → structured deliveryStatus
    + verifyCode: findActive → bcrypt compare → incrementAttempts /
      forceConsume / atomic consume
    + login: lockout check (423 + Retry-After + lockedUntil),
      increment-on-failure with bounded backoff, reset-on-success
M iyf-s10-week-11-Kimiti4/src/routes/auth.js
    + POST /mfa/totp/enroll, POST /mfa/totp/verify (protect)
M iyf-s10-week-11-Kimiti4/package.json
    + "test:r2": "node tests/authorization.r2.test.js"
M iyf-s10-week-11-Kimiti4/.gitignore
    + !src/services/*.js (allowlist was missing the file-level exception;
      emailService.js would otherwise be silently ignored)
```

## FILES ADDED

```text
A iyf-s10-week-11-Kimiti4/src/services/emailService.js
    provider abstraction: production fail-closed, dev Ethereal fallback,
    test NOOP; never throws; returns { status, reason, messageId?, previewUrl? }
A iyf-s10-week-11-Kimiti4/src/controllers/mfaControllerPG.js
    enrollTotp (server-generates + persists secret, returns qrCode +
    otpauth_url, never raw secret) + verifyTotp (server-stored secret only,
    lockout-aware, first-success activates, subsequent updates last_verified)
A iyf-s10-week-11-Kimiti4/src/database/repositories/VerificationCodeRepository.js
    create / findActive / incrementAttempts / consume (atomic UPDATE ...
    WHERE used_at IS NULL) / forceConsume / findById; code_hash never returned
A iyf-s10-week-11-Kimiti4/tests/authorization.r2.test.js
    T20..T35 executable suite (45 assertions)
```

## TEST RESULTS

### R2 suite (`npm run test:r2`)

```text
T20 enroll anonymous -> 401                                            PASS
T21 enroll userA -> 200, qrCode + otpauth_url, no raw secret           PASS (x4 asserts)
T22 server ignores client secret, verifies stored -> 200               PASS
T23 users.mfa_enabled = true                                           PASS
T-enrollB userB enrolled                                               PASS
T24 4x wrong TOTP -> 401                                               PASS (x4)
T25 5th wrong -> 423 locked                                            PASS
T26 valid code while locked -> 423                                     PASS
T27 6th verification hit -> 429                                        PASS
T28 send-verification 200 + deliveryStatus=noop                        PASS (x3)
T29 row durable, bcrypt hash, future expiry                            PASS (x5)
T30 3x wrong -> 400, attempt_count=3                                   PASS (x4)
T31 forced-consume at 5, subsequent 400                                PASS (x2)
T32 5x wrong login -> 423 + lockedUntil                                PASS (x7)
T33 success after window -> 200, counters reset                        PASS (x3)
T34a/b/c DB-backed, consumed via controller                            PASS (x3)
T35 parallel verify: exactly one 200, one 400, row consumed once       PASS (x3)

RESULTS: 45 passed, 0 failed
```

### Cross-process durability (T34-hard, two OS processes)

```text
Process A: VerificationCodeRepository.create() -> ROW_ID printed -> exit
Process B: fresh server (no shared memory) -> /verify-code -> 200,
           replay -> 400, used_at set
XPROC RESULT: PASS
```

### Regression lock

```text
test:alerts      69 passed, 0 failed   PASS (no regression)
test:ratelimit    6 passed, 0 failed   PASS (no regression)
test:r1          26 passed, 4 failed   PASS (preserved; the 4 are the
                                       pre-existing login_streak drift,
                                       unchanged from R1)
```

## ADVERSARIAL RESULTS

```text
- anonymous -> protected (T20, T27-probe n/a, R1 T1/T4/T8/T12 preserved)  PASS
- user A -> user B resource (R1 T5/T9/T17 preserved)                      PASS
- ordinary user -> moderation (R1 T13 preserved)                          PASS
- malformed/absent auth (T20, R1 T1/T4/T8)                                PASS
- privileged role (T14/T15 R1, T23/T26 R2)                                PASS
- sensitive-field inspection (R1 T3/T5/T6/T7 preserved)                   PASS
- replay (T29-replay via T31, T35 parallel, XPROC replay)                 PASS
- wrong-secret substitution (T22: client secret ignored)                  PASS
- restart (XPROC: process A exits, process B consumes)                    PASS
- source sweep: zero Math.random / new Map( / createTestAccount /
  verificationCodes / generateCode / otplib.authenticator in R2 paths   PASS
  (only comment mentions of the change itself)
```

## SENSITIVE-FIELD CHECK (R2 scope)

```text
- enroll response: qrCode + otpauth_url only; raw secret absent (T21)     PASS
- verifyCode responses: never include code, hash, or secret              PASS
- sendVerification responses: deliveryStatus only; raw code absent        PASS
- mfa_methods.secret: never selected into any response DTO               PASS
- verification_codes.code_hash: repository never returns it               PASS
```

## ALERTS REGRESSION

```text
69/69 PASS (no regression)
```

## RATE-LIMIT REGRESSION

```text
6/6 PASS (no regression)
```

## IMPLEMENTATION NOTES (deviations discovered during R2)

1. **otplib v13 API**: the installed otplib (^13.4.1) removed
   `otplib.authenticator.*`. R2 uses the v13 API throughout:
   `otplib.generateSecret()`, `otplib.generate({ secret })`,
   `otplib.verify({ token, secret }) -> { valid, ... }`,
   `otplib.generateURI({ issuer, label, secret })`.
   The old `authControllerPG.js` TOTP branch used the v12 API and could
   never have worked against the installed dependency. Purged repo-wide.
2. **Test-user emails must be lowercase**: production `register()` lowercases
   email before insert and `findByEmail()` lowercases the lookup, so test
   fixtures inserted via raw SQL must also be lowercase or logins 401 without
   incrementing. Fixed in `tests/authorization.r2.test.js` setup.
3. **Test-user passwords must be bcrypt hashes**: plaintext fixtures make
   `bcrypt.compare` always false. Fixed in setup (single shared hash).
4. **`verification_codes` table**: added inline to `schema.js` (the canonical
   bootstrap path; idempotent). The R2 test calls `createTables()` in setup,
   mirroring `server.js` startup. No migration-00X file created (R6 owns the
   migration-path convergence; this table will be picked up by it).

## RESIDUAL RISKS

1. **P0-7 OPEN** (JWT/session/localStorage/CSP) -> R5. R2 did not touch it.
2. **login_streak drift** (R1 deferred T10/T11/T18/T19) -> R6. R2 did not touch it.
3. **Tiannara mock body** (P1-3/P1-4) -> R3. R2 gated the endpoint (R1); the
   body remains keyword-mock.
4. **Dead routers / unmatched paths** (P1-8/P1-9) -> R3/R4.
5. **Synthetic impact/skills metrics** (P1-5/6/7) -> R3.
6. **`src/services/smsService.js` is on disk but untracked** (pre-existing,
   never committed, gitignored by the `*.js` blanket). R2 did not touch it;
   R3/R4 should decide whether it is live, dead, or mock.
7. **Phone verification** returns `deliveryStatus: 'failed'` with an explicit
   R3-carry reason (no silent success). Real SMS provider is R3.
8. **Email in production is fail-closed**: if `SMTP_*` is absent, sends return
   `deliveryStatus: 'failed'`. Operators must configure SMTP or verification
   emails will not deliver (by design, not silently).
9. **TOTP secrets at rest are plaintext TEXT** in `mfa_methods.secret`.
   Documented in R2_STOP_REPORT_1 §5.2 as acceptable-for-R2 with residual
   risk noted; R5 may add column-level encryption.
10. **Local Cline checkpoints / jazzy-break worktree** still carry the old
    credential locally (workspace-internal, out of cert scope). No credential
    printed or copied in any R2 artifact.

## NEXT PHASE

R3 — Capability reality (P1-1/2/3 locations+market+tiannara mocks,
P1-4 fail-open, P1-5/6/7 synthetic metrics, P1-8 dead routers, P1-9 unmatched
paths). Per the MOCK DATA RULE: implement REAL, or mark PARTIAL /
UNAVAILABLE / TEST-ONLY / UI_ONLY — never a more sophisticated mock.

## GIT

```text
HEAD           : 202898f (frozen at R0; not moved)
working tree   :
  R1 (frozen):
    M src/routes/users.js
    M src/controllers/usersControllerPG.js
    M src/routes/metrics.js
    M src/controllers/metricsControllerPG.js
    M src/routes/tiannara.js
    D src/middleware/requireAuth.js
  R2 (new):
    M src/middleware/rateLimiter.js
    M src/app.js
    M src/database/schema.js
    M src/controllers/authControllerPG.js
    M src/routes/auth.js
    M package.json          (+ test:r2 script; R1 added test:r1)
    M .gitignore            (+ !src/services/*.js)
    A src/services/emailService.js
    A src/controllers/mfaControllerPG.js
    A src/database/repositories/VerificationCodeRepository.js
    A tests/authorization.r2.test.js
  Pre-existing (not R1/R2):
    M iyf-s10-week-09-Kimiti4/docs/audits/J027/evidence/security.json
      (tooling artifact from the prior audit run)
  Untracked:
    A tests/authorization.r1.test.js (R1)
    ?? docs/audits/ (R-audit x4 + R0 baseline + R1 x2 + R2 x2 inc. this file)

commit/push    : NO (per Master Prompt §0.2 and §30)
```

## READY FOR USER GIT AUTHORIZATION

Per spec §30, the working tree contains the verified R1+R2 changes and the
evidence package is complete. **Awaiting your authorization** on whether to
commit/push, hold, or proceed to R3.
