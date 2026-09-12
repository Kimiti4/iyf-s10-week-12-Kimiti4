# SECURITY REVIEW

> Security review of `Kimiti4/iyf-s10-week-12-Kimiti4` at `HEAD = 202898f`.
> No secrets are reproduced in this document.

## 1. Secret scan

### Current tree
- `#gunzNroz3z_6G1GWY#`: **0 hits**
- `Kimiti@2026!Founder#MFA`: **0 hits**
- Private-key blocks (`BEGIN (RSA|DSA|EC|OPENSSH|PRIVATE) KEY`): **0 hits** in code (the only hit was the detector regex itself in `scripts/j027/security-local.cjs:25`)
- AWS access keys (`AKIA[0-9A-Z]{16}`), Stripe keys (`sk_live_/sk_test_`), GitHub PATs (`ghp_`), Slack tokens: **0 hits**
- `JWT_SECRET=`: present only in `.env.example` with placeholder `your_secure_random_secret_here`; the actual `.env` is gitignored (verified by `git ls-files .env` → empty).
- `BEGIN PRIVATE` in `.env`/real `.env`: not present in tracked files.
- `daily-challenges.test.js` contains a literal `Bearer jamii-link-ke-2026` header value — **test-only** token, not a real auth path; flagged as TEST-ONLY/P2.

### Automated scan
- `node iyf-s10-week-09-Kimiti4/scripts/j027/security-local.cjs` → **PASS (16/16)**: helmet, CORS env, JWT env, bcrypt, no raw password comparisons, parameterized queries, no secrets in client bundle, no inline scripts with secrets, no inline styles with secrets, no secrets in frontend source, input validation middleware present, JWT auth middleware present, Supabase key from env, no unescaped HTML, token stored without httpOnly.

### History classification
- **Canonical refs** (`refs/heads/main`, `refs/remotes/origin/main`, `refs/remotes/origin/railway/*`): zero hits for either credential literal. Confirmed from fresh clones of `Kimiti4/iyf-s10-week-12-Kimiti4` (202 commits) and `Kimiti4/iyf-s10-week-10-Kimiti4` (18 commits).
- **Local-only** (workspace-internal, not pushed, not in certification scope):
  - `refs/cline/checkpoints/*` (8 IDE session snapshots)
  - `refs/heads/jazzy-break` (kilo worktree)
  - dangling unreachable objects (1 commit, 4 trees) from earlier accidental filter-repo runs
- **Separate repo**: `refs/remotes/week09/main` (1 hit) — `Kimiti4/iyf-s10-week-09-Kimiti4` is a separate project; not in the credential-purge scope. Recommend running the same sanitizer on it.

## 2. Authentication

| Property | Status |
|---|---|
| Registration | ✅ real (bcrypt, email regex, dup check) |
| Login | ✅ real (bcrypt compare, JWT 7d) |
| Password hashing | ✅ bcryptjs, 10 rounds |
| Password change | ✅ rehash with new password |
| Logout (server-side) | ❌ STUB — returns 200, no token invalidation |
| JWT signing | ✅ env-driven `JWT_SECRET` |
| JWT lifetime | ⚠️ 7 days, no refresh, no rotation |
| `aud`/`iss` validation | ❌ none |
| `jti` claim | ❌ none |
| Refresh token | ❌ none |
| Token revocation list | ❌ none |
| Failed-login counter | ❌ none (columns exist, not used) |
| Account lockout | ❌ none |
| MFA enrollment (TOTP) | ❌ SCAFFOLD — secret not server-persisted |
| MFA verify (TOTP) | ❌ **P0-5** — accepts secret from request body |
| OAuth | SCAFFOLD (Google only) |
| Email verification | MOCK (Ethereal always) |
| Phone verification | MOCK (console.log) |
| Verification state | `new Map()` (process-local) — **P0-6** |

## 3. MFA architecture

The current TOTP implementation is **not MFA**. The enrollment endpoint returns the secret in the HTTP response and the verification endpoint accepts that same secret from the request body — equivalent to a static shared password. The prompt's required architecture is:

```
Generate secret → persist securely server-side → bind to authenticated account
→ show enrollment QR → require initial verification → mark method verified
→ use stored secret for subsequent verification
```

The current code:
- `authControllerPG.js:239-248` generates an `otplib.authenticator.generateSecret()` and returns it in the response (`{ secret, qrCode: dataUrl }`). It is **not persisted**.
- `authControllerPG.js:302-309` calls `otplib.authenticator.check(code, secret)` with `secret` from `req.body`. The server has no authoritative copy of the secret.

This is functionally equivalent to a static password. Severity: **P0 architectural** (not actively exploited because no real production user has completed enrollment).

## 4. OAuth

`routes/auth.js` lines 19-26 contain two endpoints that return `res.json({ success: true, message: "Redirecting to Google OAuth (Mock)" })` and `res.json({ success: true, message: "Google OAuth callback successful" })`. No Passport, no `google-auth-library`, no env vars, no actual OAuth flow. Status: **NOT IMPLEMENTED — EXPLICITLY DEFERRED**.

## 5. Session / token security

| Property | Value |
|---|---|
| Token type | JWT (HS256, default) |
| Lifetime | 7 days, single token, no refresh |
| Storage (client) | `localStorage` (XSS-readable) |
| Cookie flags | not used (no `HttpOnly` / `Secure` / `SameSite`) |
| Logout (server) | cosmetic stub |
| Concurrent sessions | multiple allowed (no enforcement) |
| Device management | none |
| Token revocation | none |
| Failed-login handling | none |

Combined with the CSP analysis below, the threat model has a clear path: XSS → read `localStorage.getItem('token')` → exfiltrate → 7 days of account access.

## 6. CSP / frontend security

`src/middleware/securityHeaders.js`:
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self' http://localhost:* ws: wss:;
media-src 'self';
```

- `script-src` allows `'unsafe-inline'` and `'unsafe-eval'`. Defeats the primary XSS-mitigation value of CSP.
- `style-src` allows `'unsafe-inline'`.
- `connect-src` allows `http://localhost:*` (dev-only) and `ws:/wss:`. In production, `http://localhost:*` should be removed; the deployed API is over HTTPS.
- `default-src 'self'` is reasonable.

`dangerouslySetInnerHTML`: 0 uses.

`element.innerHTML = ...` (non-React sink): 1 use in `ReputationSystem.jsx:99` — interpolates server-supplied `passport.*` fields into HTML for PDF export. Currently trust-bound (server-controlled) but if any passport field ever accepts user input, this is XSS.

`window.open` / `document.write` / `new Function` / `eval`: 0.

External scripts in `index.html`: only the bundled `/src/main.jsx` module. No third-party scripts.

CORS (`src/app.js:23-37`): env-driven allowlist (no wildcard). Includes `http://localhost:5173/5174/3000` (dev) and `https://jamii-link.vercel.app` + `https://jamii-link.ke.vercel.app` (prod). Allows `process.env.FRONTEND_URL` if set. `credentials: true`. ✅

## 7. Authorization (server-side)

| Route | Auth check | Issue |
|---|---|---|
| `GET /api/users` | **public** | **P0-1**: full user listing exposed |
| `GET /api/users/:id` | **public** | **P0-2**: full profile incl. email exposed |
| `GET /api/metrics/users/:userId/activity` | **public** | **P0-3**: user activity exposed |
| `POST /api/tiannara/moderate` | **public** | **P0-4**: unauthenticated moderation endpoint |
| `POST /api/alerts` | `protect` | ✅ |
| `PUT /api/alerts/:id` | `protect` + controller `authorId === user || admin||moderator` | ✅ |
| `PUT /api/alerts/:id/verify` | `protect + restrictTo('admin','moderator')` | ✅ |
| `PUT /api/users/role/:userId` | `protect + restrictTo('admin','founder')` | ✅ |
| `POST /api/users/ban/:userId` | `protect + restrictTo('admin','founder')` | ✅ |
| `PUT /api/organizations/:id` | `protect` + controller `isAdmin` | ✅ |
| `DELETE /api/organizations/:id` | `protect` + controller `owner.id === user.id` | ✅ |
| `POST /api/verification/users/:userId/verify` | `protect + restrictTo('admin')` (router-level) | ✅ |
| `DELETE /api/posts/:id/comments/:commentId` | `protect` + controller `author_id === user || role admin/founder` | OK (P3: moderator missing) |
| `GET /api/users/stats/:id?` | `protect` (route) but accepts any `:id` | **P2-8**: IDOR |
| `/api/auth/send-verification` | public | **P2-1**: no rate limit |
| `/api/auth/verify-code` | public | **P2-2**: no attempt counter |

## 8. CORS

- `origin` allowlist: `['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://jamii-link.ke.vercel.app', 'https://jamii-link.vercel.app', process.env.FRONTEND_URL]` (after `.filter(Boolean)`)
- `credentials: true`
- `methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS']`
- `allowedHeaders: ['Content-Type','Authorization']`
- No wildcard.
- ✅

## 9. Rate limiting

`src/middleware/rateLimiter.js` (audited; previously remediated):
- `generalLimiter` on `/api/`
- `authLimiter` on `/api/auth/register` and `/api/auth/login`
- `alertLimiter` on `/api/alerts`
- Production limits: 100/15min general, 5/15min auth, 10/hour alert creation.
- Bypassed when `NODE_ENV === 'test'` (covered by `tests/rateLimiter.test.js`).
- Not applied to `/api/auth/send-verification` (P2-1), `/api/auth/verify-code` (P2-2), or any other endpoint.

## 10. Verification (email/phone/MFA)

Already covered above. The `new Map()` issue (P0-6) is the headline finding.

## 11. Legacy / archive security

- `archive/` (Mongo-era files): zero imports in live code. Containment verified. ✅
- `archive/CREATE_FOUNDER_MONGO.js` (the file that previously held a credential literal) is **deleted** from current tree and **purged from history** (canonical refs only). ✅
- `middleware/requireAuth.js` is a **full auth-bypass** that accepts any Bearer token and attaches a fake user. Currently DEAD (no importers), but the file exists in `src/middleware/` and could be wired accidentally. **P1-11**.

## 12. Dependencies

- Backend deps are all real and used. Frontend deps are all real and used.
- Root `package.json` lists `mongoose` as a dep — **no code at the root uses it** (only the backend, which uses `pg`). **P2-12**.
- `bcryptjs` major-version drift: root `^3.0.3` vs backend `^2.4.3`. Cosmetic.

## 13. CSP / HSTS

- HSTS only sent when `NODE_ENV === 'production'`. ✅
- CSP applies to dev and prod identically (no conditional relaxation). The same `unsafe-inline`/`unsafe-eval` ship in production. **P1-10**.

## 14. Summary

The repository is clean of **active secrets in the canonical tree and history**, and the previously-exposed credentials are rotated. The **structural security** has multiple unresolved issues:

- P0: PII leakage (users listing, profile, activity), unauthenticated moderation, MFA architecture wrong, verification state in process-local Map, JWT in localStorage with permissive CSP.
- P1: synthetic data on multiple reachable endpoints, dead routers, CSP weakness, deprecated-but-present auth-bypass middleware.
- P2/P3: hygiene and consistency.

Certifying this platform as production-ready is **not** appropriate until the P0s are remediated.
