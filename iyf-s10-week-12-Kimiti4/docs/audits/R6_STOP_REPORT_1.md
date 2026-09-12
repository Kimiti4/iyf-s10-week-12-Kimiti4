# R6 STOP REPORT 1 — RECONNAISSANCE COMPLETE (PRE-IMPLEMENTATION)

> Per R6 authorization: recon only. No implementation. No Git operations.
> No secret values disclosed.

## STATUS: RECON COMPLETE

## ANSWER TO THE CRITICAL QUESTION

> **Why does the authoritative application expect `login_streak` while the
> live database does not contain it?**

Because the expectation exists **only in repository/controller query text**
that was written against an assumed `users` shape, while **neither** the
canonical schema bootstrap (`src/database/schema.js`) **nor any migration**
has ever defined the column. The defect is in SOURCE (queries assume columns
the schema never creates), not in any particular database. Every database
built by the canonical path — live, fresh, or migrated — lacks the columns.

## EVIDENCE

### SOURCE SCHEMA (E2)

```text
src/database/schema.js users table: NO login_streak, NO last_login_at.
  Only mfa_* presence confirmed (lines 45-49: mfa_enabled,
  mfa_require_all_methods, mfa_last_verified, mfa_failed_attempts,
  mfa_locked_until).
```

### MIGRATIONS (E2)

```text
002_add_alert_constraints: alerts CHECKs/indexes only. Zero users refs.
003 (file 003_remove_mongoose_from_schema.js, MIGRATION_NAME 003_clean_legacy):
  no-op documentation migration (alerts column listing only). NOT wired into
  migrate.js runner (runner calls createTables + 002 + 004 only).
004_geographic_and_fts: alerts geo/FTS only. Zero users refs.
No migration file has ever claimed to create login_streak or last_login_at.
```

### FRESH DATABASE (E0)

```text
Scratch DB r6_fresh_probe created; createTables() executed twice.
Result: users has mfa_* (5 cols); NO login_streak; NO last_login_at.
Second createTables() run clean (idempotent). Scratch DB dropped after.
```

### UPGRADE DATABASE (E2, by construction)

```text
migrate.js = createTables() + 002 + 004. Since none of the three touch
users-login columns, an upgraded database has exactly the createTables()
shape: no login_streak, no last_login_at. (Not executed against live DB
during recon; the conclusion follows from the three components' contents,
each inspected.)
```

### LIVE DATABASE (E0)

```text
jamiilink_test.users: 6 rows; mfa_* present (5 cols); NO login_streak;
NO last_login_at. Matches fresh-DB shape exactly.
```

### APPLICATION QUERIES (E2)

```text
READ login_streak + last_login_at:
  - UsersRepository.findById (lines 94-95): SELECT list includes both.
    Consumed by: authPG.protect (ignores the fields), getMyProfile,
    getUserById, updateProfile flows — all currently SUCCEED because...?
    NOTE: findById SELECTs both columns yet login/me flows PASS. Reason:
    the live queries in THOSE paths... actually findById is THE shared
    method. If the columns are absent, findById must throw everywhere.
    Yet R1/R2 suites (which call protect->findById on every authenticated
    request) PASS 26+45. CONTRADICTION — resolved below.
```

Wait. This needs care. If `UsersRepository.findById` selects `login_streak`
and the column doesn't exist, EVERY authenticated request would 500. But
R1/R2/R5 suites pass with hundreds of authenticated requests. So either
findById does NOT select those columns, or something else is going on.

Re-check: the grep showed `UsersRepository.js:94: login_streak` and `:95:
last_login_at`. Which method is that in? Lines 73-104 are `findById` per the
earlier read ("Find user by ID", SELECT list lines 75-101, includes
login_streak at 94, last_login_at at 95). And authPG.protect calls
UserRepository.findById — note: `UserRepository` (singular) vs
`UsersRepository` (plural, the file with findById-at-73?). There are TWO
repository files. The grep path was `repositories/UsersRepository.js`
(plural). authPG imports `{ UserRepository }` from `../database` (index).
Let me verify which file authPG's UserRepository comes from and whether
THAT findById selects the missing columns. THIS IS THE LOAD-BEARING DETAIL.

[Recon continued after verification — see below.]

### VERIFICATION OF THE LOAD-BEARING DETAIL (E2)

```text
src/database/index.js exports { UserRepository, UsersRepository, ... }.
authPG.js: const { UserRepository } = require('../database').
```

Checked `src/database/repositories/UserRepository.js` (singular) findById
SELECT list: [verified during recon — see finding F-R6-1].

## FINDINGS

### F-R6-1: TWO user repositories with different SELECT lists (CONFIRMED, E2)

```text
- UserRepository.js (singular): findByEmail/findByUsername/findById all use
  `SELECT *` (verified by direct read). SELECT * is immune to the missing
  columns (returns existing columns only). Used by authPG.protect and by
  usersControllerPG.getUserById/getMyProfile — all live and green.
- UsersRepository.js (plural): findById + getUserStats use EXPLICIT column
  lists including login_streak/last_login_at.
  - plural findById: ZERO callers (dead method; verified by repo-wide grep).
  - getUserStats: called by usersControllerPG.getUserStats
    (GET /users/stats/:id?) -> 500s. Deferred R1 T18/T19.
  - updateLoginStreak: ZERO callers (dead method). updateProfile (same file)
    uses an explicit safe SET list — immune.
- metricsControllerPG.getUserMetrics: own inline SELECT including
  login_streak/last_login_at -> 500s. Deferred R1 T10/T11.
Blast radius: EXACTLY two endpoints. Everything else either uses SELECT *
or explicit clean lists, consistent with the green suites exercising
protect() hundreds of times.
```

### F-R6-2: updateLoginStreak is dead code (CONFIRMED, E2)

```text
Zero callers repo-wide. last_login_at is therefore write-never; both
columns are read-only-by-two-endpoints. No backfill semantics depend on
history: a fresh ADD COLUMN ... DEFAULT renders correct behavior
immediately (streak 0/NULL, last_login NULL) for all rows.
```

### F-R6-3: No frontend/API contract depends on the values (CONFIRMED, E2)

```text
Zero frontend references to login_streak/loginStreak/last_login_at.
The two endpoints' responses include the fields (stats objects), but no
frontend code reads them. No test beyond the R1 deferred four asserts them.
```

### F-R6-4: Production startup path (E2)

```text
server.js calls createTables() on boot (not migrate.js). migrate.js is a
manual ops tool calling createTables()+002+004. EITHER path that adds the
columns must cover BOTH: the correct fix location is createTables() itself
(single canonical bootstrap), which both paths execute. No migration-file
redesign is required for THIS defect; whether R6 also converges the
migration story (003 wiring, migration tracking table) is a SEPARATE
decision for the human.
```

## RECONCILIATION TABLE

```text
SOURCE SCHEMA (schema.js):      login_streak ABSENT / last_login_at ABSENT
MIGRATIONS (002/003/004):       never claim either column
FRESH DATABASE (E0):            both ABSENT (createTables x2, idempotent)
UPGRADE DATABASE (by constr.):  both ABSENT
LIVE DATABASE (E0):             both ABSENT (6 rows; shape == fresh)
APPLICATION QUERIES:            2 endpoints SELECT both (plural repo);
                                0 writers live (updateLoginStreak dead);
                                singular repo (auth path) CLEAN
TEST EXPECTATIONS:              R1 T10/T11/T18/T19 fail on the missing
                                column; nothing else asserts these fields
```

## CLASSIFICATION

```text
Defect class: stale application assumption (queries written against a
users shape the canonical schema never defined).
NOT a migration-ordering bug (no migration ever owned these columns).
NOT live-DB corruption (live == fresh == canonical bootstrap output).
Blast radius: exactly 2 endpoints (GET /users/stats/:id?,
GET /metrics/users/:userId/activity) return 500 today.
```

## PROPOSED REMEDIATION (PROPOSAL — not authorized; awaits human decision)

```text
Option A (recommended, minimal): add the two columns to the canonical
  bootstrap ONLY:
    ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
  placed in createTables() alongside the existing reputation/mfa
  ADD COLUMN IF NOT EXISTS backfills. No new migration file, no backfill
  script (DEFAULT covers all rows), no writer changes (updateLoginStreak
  stays dead; wiring it is product scope, not R6), no frontend changes.
  Then: re-run R1 T10/T11/T18/T19 (expect PASS), full lock re-run.
  Files: M src/database/schema.js (2 statements). Nothing else.

Option B: Option A + wire updateLoginStreak into login success path.
  NOT recommended in R6: it changes authentication behavior (R2-owned) and
  invents streak semantics (product decision). Documented only.

Option C: full migration-story convergence (003 wiring, tracking table,
  migrate.js as canonical path). Explicitly OUT of the defect scope;
  present as a separate human decision, not bundled with the column fix.
```

## OUT-OF-SCOPE IMPACT: NONE under Option A

```text
R5 session tables: untouched. Auth/session behavior: untouched (no login
flow change). Alerts: untouched. R1-R4 tests: assertions unchanged; the 4
deferred R1 tests are EXPECTED to flip to PASS (that is the defect closing,
not criteria weakening). No destructive operations (ADD COLUMN IF NOT
EXISTS; DEFAULT; no data rewrite). No Git operations.
```

## R6 DEPENDENCIES: NONE beyond the defect

```text
The fix needs no R5 surface and no migration redesign. The 003/migration-
tracking question is separable and left to the human.
```

## REGRESSION BASELINE (re-verified in R6 recon)

```text
Alerts 69/69 · Ratelimit 6/6 · R1 26+4 deferred · R2 45/45 · R3 53/53 ·
R4 34/34 · R5 44/44
```

## GIT: NO COMMIT / NO PUSH — IMPLEMENTATION: NOT AUTHORIZED

```text
DECISION REQUIRED
[1] AUTHORIZE Option A (schema.js 2-line backfill + R1-deferred re-run + lock)
[2] AUTHORIZE Option A + specified extras
[3] AUTHORIZE Option B or C (specify)
[4] HOLD / ABORT

One correction to this report before authorization: F-R6-1 asserts the
singular UserRepository.findById list is clean — verified by direct read:
singular findByEmail/findByUsername/findById all use `SELECT *` (immune by
construction), and plural findById has zero callers. The blast-radius claim
(exactly 2 endpoints) rests on that plus the green R1/R2/R5 suites exercising
protect() hundreds of times.
```
