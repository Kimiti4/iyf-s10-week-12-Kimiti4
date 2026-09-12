# R3 STOP REPORT 1 — RECONNAISSANCE COMPLETE (PRE-IMPLEMENTATION)

> Per R3 spec §13 / §13A. Read-only recon. No implementation.
> R3 reconnaissance does NOT authorize implementation.

## STATUS: RECON COMPLETE

## REGRESSION BASELINE (R3 spec §1)

```text
Alerts:    69 passed / 0 failed   PASS
Ratelimit:  6 passed / 0 failed   PASS
R1:        26 passed / 4 deferred (known login_streak drift, unchanged) PASS
R2:        45 passed / 0 failed   PASS (one transient 44/1 in 3 runs, see note)
```

Note: one R2 run in three showed 44/1 then passed twice consecutively with zero
code changes. Most probable cause is a TOTP 30-second time-step boundary
(code generated at end of window, verified in next; v13 verify defaults to
zero tolerance). Characterized as test-timing flake, NOT a code regression.
Recommended hardening (test-only, needs authorization): retry-once or
window-tolerant verify in the R2 test. NOT implemented in R3-A.

## P1-1: LOCATIONS

- classification: **MOCK**
- evidence:
  - `iyf-s10-week-11-Kimiti4/src/controllers/locationsController.js:4,11`
    requires `../data/store` and returns `{ ...store.locations }`
  - `store.locations` = 3 hardcoded settlements (Kibera, Mathare, Mukuru) +
    5 hardcoded counties (Nairobi, Kiambu, Machakos, Kajiado, Murang'a)
  - route `GET /api/locations` mounted (`routes/index.js:37`), public, no auth
  - **zero frontend callers** of `/api/locations` in `iyf-s10-week-09-Kimiti4/src`
  - **zero tests** reference `/locations`
  - frontend `CreateAlertForm.jsx` uses free-text county/settlement inputs
- proposed disposition: **UNAVAILABLE** — return explicit `501` with truthful
  body; do NOT serve the hardcoded list. (Alternative: DELETE route + controller.
  UNAVAILABLE is preferred because the path is a plausible future capability
  and 501 preserves the contract surface truthfully.)
- files expected to change: `src/controllers/locationsController.js`
- files to add/delete: none (no deletion proposed)
- tests to add: R3 suite asserting `/api/locations` returns 501 + no
  `settlements`/`counties` payload; asserting `store.locations` has zero
  production importers after the change
- regression risks: LOW (no callers, no tests)
- R5/R6 dependency: NONE
- ambiguity: none

## P1-2: MARKET

- classification: **MOCK**
- evidence:
  - `iyf-s10-week-11-Kimiti4/src/controllers/marketController.js:4,11`
    requires `../data/store` and returns `[...store.marketPrices]`
  - `store.marketPrices` = 4 hardcoded rows (Tomatoes/Kale × Nairobi/Kiambu,
    static `updatedAt: 2026-04-21`)
  - route `GET /api/market/prices` mounted (`routes/index.js:34`), public
  - **zero frontend callers** of `/api/market` in frontend src
  - **zero tests** reference `/market`
- proposed disposition: **UNAVAILABLE** — explicit `501`, same rationale as P1-1
- files expected to change: `src/controllers/marketController.js`
- files to add/delete: none
- tests to add: R3 suite asserting 501 + no price payload; zero production
  importers of `store.marketPrices` after the change
- regression risks: LOW
- R5/R6 dependency: NONE
- ambiguity: none

## P1-3: TIANNARA MOCK

- classification: **MOCK** (route bodies) + PARTIAL (service client exists)
- evidence:
  - `src/routes/tiannara.js:17-108` — 3 endpoints (mental-health, fact-check,
    moderate) with keyword-list bodies (`analyzeSentiment`, `performFactCheck`,
    `analyzeContent`); comments say "Simulate"/"Placeholder"
  - R1 gate intact: `router.use(protect, restrictTo('admin','moderator','founder'))`
    (line 11) — must remain intact
  - `src/services/tiannaraService.js` — real fetch client to TIANNARA_API_URL
  - frontend `TiannaraAssistant.jsx` calls all 3 endpoints with NO auth header
    (post-R1 these 401; UI shows "AI Powered" badge with no unavailable state)
- proposed disposition: **UNAVAILABLE** for all 3 route bodies — return explicit
  `501` with truthful body (`{ success:false, error, code:'TIANNARA_UNAVAILABLE' }`);
  REMOVE the keyword-mock functions from the route file. Keep the R1 auth gate.
  Do NOT wire the route to tiannaraService (that would make the route depend on
  an external service with no contract; P1-4 covers the service path separately).
- files expected to change: `src/routes/tiannara.js` (replace 3 mock bodies
  with 501s; keep R1 gate + comments updated)
- files to add/delete: none
- tests to add: R3 suite asserting admin caller gets 501 (not 200+mock),
  anonymous gets 401, ordinary user gets 403 (R1 preserved)
- regression risks: LOW (R1 T12-T15 must stay green; they assert status only,
  and 501 would BREAK T14/T15 which expect 200 — see scope note below)
- R5/R6 dependency: NONE
- ambiguity / scope note: **R1 T14/T15 assert moderator/admin get 200 from
  /moderate. Changing the body to 501 changes those statuses. The R3 suite
  must update T14/T15 expectations OR the R1 suite must be amended with
  authorization. Per R3 spec §21 ("Do not delete or weaken tests"), amending
  R1 T14/T15 needs explicit human authorization. REQUESTED as part of
  implementation scope.**

## P1-4: TIANNARA FAIL-OPEN

- classification: **FAIL-OPEN** (two layers)
- evidence:
  - Layer 1: `tiannaraService.moderateContent` catch returns `{ safe:true, ... }`
    (`tiannaraService.js:42-56`); `moderateBatch` catch marks all safe (105-113)
  - Layer 2: `postsControllerPG.createPost` catch wraps the call AGAIN and
    substitutes its own `{ safe:true, ... }` (`postsControllerPG.js:~78-88`)
  - On failure the post is then stored with `moderationChecked: true` and
    zeroed scores (`postsControllerPG.js:~115-123`) — the DB falsely records
    the post as moderated-and-clean; response says `moderation.checked: true`
  - `tiannaraService` imported ONLY by `postsControllerPG.js:9`
- proposed disposition: **FAIL-CLOSED** —
  - `tiannaraService.moderateContent`/`moderateBatch`: on transport/HTTP/parse
    failure, THROW a typed error (do not return safe:true)
  - `postsControllerPG.createPost`: on moderation error, return `503` with
    truthful body (`{ success:false, error, code:'MODERATION_UNAVAILABLE' }`);
    do NOT create the post; do NOT write `moderationChecked:true`
  - keep the success path byte-identical (real service up → same behavior)
- files expected to change:
  - `src/services/tiannaraService.js` (throw instead of safe-fallback)
  - `src/controllers/postsControllerPG.js` (503 instead of fallback-create)
- files to add/delete: none
- tests to add: R3 suite with TIANNARA_API_URL pointed at an unreachable port:
  `POST /api/posts` → 503 (not 201); no post row created; no
  `moderationChecked:true` row. Success path (service up) → 201 preserved
  (test with a stub HTTP server).
- regression risks: MEDIUM (touches post creation; alerts suite does not cover
  posts, but the change is additive-fail-closed — success path untouched)
- R5/R6 dependency: NONE
- ambiguity: none

## P1-5: IMPACT METRICS

- classification: **PARTIAL** (real sums + fabricated conversions in one response)
- evidence:
  - `trackImpact`: real INSERT into `impact_metrics` (lines 8-22)
  - `getImpactDashboard` (`impactController.js:27-79`):
    - REAL: `SUM(impact_value)` per event_type from DB; rank COUNT query from DB
    - MOCK: `exchange_value: ${exchange_value*500} KES` (line 73, fabricated
      500× multiplier, comment says "Mock value conversion");
      `time_saved: ${time_saved*2} hours` (line 74, fabricated 2×);
      badges `Bronze Helper/Silver Catalyst/Gold Pillar` on hardcoded
      thresholds (lines 60-63); `people_helped: help_provided` relabel (line 75)
  - route `GET /impact/:id/dashboard` + `POST /impact/track` exist in
    `routes/impact.js` but the router is UNMOUNTED (P1-8); live callers
    (`ImpactMeterWidget` via `api.impact.getDashboard`) 404 today
- proposed disposition: **PARTIAL-REAL** —
  - keep `trackImpact` + real sums + real rank COUNT as-is
  - REMOVE `exchange_value` KES conversion, `time_saved` hours conversion,
    hardcoded badge thresholds, `people_helped` relabel from the response;
    return only DB-derived values (`help_provided`, `exchange_value_raw`,
    `time_saved_raw`, `total_impact`, `impact_rank`) with explicit unitless
    semantics
  - do NOT invent replacement conversions
- files expected to change: `src/controllers/impactController.js`
  (getImpactDashboard response only; trackImpact untouched)
- files to add/delete: none
- tests to add: R3 suite seeding impact_metrics rows directly, asserting the
  dashboard returns raw sums and contains NO `KES`/`hours` strings and NO
  `badges` array
- regression risks: LOW (router currently unmounted; mounting is P1-8 scope)
- R5/R6 dependency: NONE
- ambiguity: none

## P1-6: SKILLS METRICS

- classification: **PARTIAL** (real profile/match SQL + fabricated score fields)
- evidence:
  - `saveProfile`/`getProfile`: real `user_skills` CRUD (lines 8-54)
  - `getMatches`: real reciprocal-match SQL (lines 59-81) BUT response adds
    `match_score: 0.95` hardcoded (line 88) + `testimonials:
    Math.floor(Math.random()*5)` (line 89, synthetic random per request)
  - `completeExchange`: returns success with NO persist (lines 98-105,
    comment "For now we just mock success"); `match_id: temp_<userId>`
    (line 84) is not a real id
- proposed disposition: **PARTIAL-REAL** —
  - keep profile CRUD + reciprocal-match SQL as-is
  - REMOVE `match_score` and `testimonials` from getMatches response (do not
    replace with another fabricated score)
  - `completeExchange`: return explicit `501` (`{ success:false,
    code:'EXCHANGE_NOT_IMPLEMENTED' }`) instead of fake success; do NOT
    invent a persistence model in R3
  - keep `match_id: temp_<userId>` ONLY as an opaque echo (or remove it;
    decision: remove — it implies a real id; the response will carry the
    matched `user` object which is real)
- files expected to change: `src/controllers/skillsController.js`
  (getMatches response, completeExchange body)
- files to add/delete: none
- tests to add: R3 suite seeding user_skills rows, asserting matches contain
  NO `match_score`/`testimonials` keys; asserting completeExchange → 501
- regression risks: LOW (router currently unmounted; mounting is P1-8 scope)
- R5/R6 dependency: NONE
- ambiguity: none

## P1-7: REPUTATION / RELATED METRICS

- classification: **PARTIAL** (real score/rank/activity + mock endpoints/fields)
- evidence:
  - REAL: `getUserReputation` (score/level/rank from DB + post/comment counts),
    `getLeaderboard` (ORDER BY reputation_score), `exportPassport`
    (same real inputs), `logContribution` (+10 UPDATE)
  - MOCK: `getUserBadges` → `[]` (line 102-104, comment "(Mock)");
    `getReputationLedger` → `[]` (109-111); `getUserFeedback` → `[]` (117);
    `submitFeedback` → success with NO persist (123-125);
    `exportPassport.signature = JAMII-VERIFIED-<id>-<Date.now()>`
    (line 174, comment "Mock signature for now")
  - `reputationController.getUserReputation` has NO try/catch issue; fine
- proposed disposition: **PARTIAL-REAL** —
  - keep getUserReputation/getLeaderboard/exportPassport/logContribution as-is
    EXCEPT remove the mock `signature` field from exportPassport (do not
    replace with another fabricated signature)
  - `getUserBadges`/`getReputationLedger`/`getUserFeedback`: return explicit
    `501` (`{ success:false, code:'NOT_IMPLEMENTED' }`) instead of `[]`
    (empty array implies "no badges", which is a fabricated fact)
  - `submitFeedback`: return explicit `501` instead of fake success
- files expected to change: `src/controllers/reputationController.js`
- files to add/delete: none
- tests to add: R3 suite asserting badges/ledger/feedback/submit → 501;
  asserting exportPassport has NO `signature` key; asserting
  getUserReputation/leaderboard still 200 with real shapes
- regression risks: LOW (router currently unmounted; mounting is P1-8 scope)
- R5/R6 dependency: NONE
- ambiguity: none

## P1-8: DEAD ROUTERS

- classification: **PARTIALLY LIVE** (code real, registration missing) — NOT dead
- evidence:
  - `routes/reputation.js`, `routes/impact.js`, `routes/skills.js`,
    `routes/comments.js`: 0 importers, 0 mounts in `routes/index.js`
    (mounts present: market, locations, organizations, verification, metrics,
    tiannara, alerts, auth, posts, users)
  - BUT live frontend callers exist via default `api` export + postApi hooks:
    ReputationSystem → /reputation/*; SkillExchange/SkillMatchCard → /skills/*;
    ImpactMeterWidget → /impact/*; useComments(PostPage) → commentsAPI.like
  - `routes/reputation.js:9` imports `{ auth, checkAuth }` from non-PG
    `middleware/auth`, which exports NO such names → mounting as-is would
    CRASH (`router.get('/export', undefined, ...)` throws at mount time)
  - `routes/impact.js:10` `GET /:id/dashboard` is PUBLIC (no protect)
  - `routes/comments.js` duplicates the nested posts comments routes with a
    DIFFERENT shape (`GET /` without postId context, `DELETE /:commentId`
    without postId) and adds NOTHING over `routes/posts.js:17-19`
- proposed disposition:
  - MOUNT `impact.js` + `skills.js` in `routes/index.js` (`/impact`, `/skills`)
    after fixing `impact.js:10` to require `protect` (consistent with every
    other user-data route; the dashboard reads per-user data)
  - MOUNT `reputation.js` ONLY after rewriting its auth import to
    `authPG.{protect}` and adding `protect` to its public GETs that return
    per-user data (`/:userId`, `/:userId/badges`, `/:userId/ledger`,
    `/export`); `/leaderboard/*` stays public (aggregate, like
    /metrics/platform)
  - DO NOT mount `comments.js` (pure duplicate of the nested posts routes
    with a weaker shape); instead ADD the missing
    `PATCH /comments/:commentId/like` to the nested posts router OR create
    it under posts as `PATCH /:postId/comments/:commentId/like`.
    Decision: add `PATCH /posts/:postId/comments/:commentId/like` to
    `routes/posts.js` + `likeComment` in `commentsControllerPG` (real
    `comments.likes` column exists per schema recon in R1). DELETE the
    `routes/comments.js` file (0 importers, 0 mounts, weaker duplicate).
    Deletion meets spec §11 (0/0/0/0 proven above).
- files expected to change:
  - `src/routes/index.js` (+3 mounts)
  - `src/routes/reputation.js` (auth import + protect on per-user GETs)
  - `src/routes/impact.js` (protect on dashboard)
  - `src/routes/posts.js` (+ like-comment route)
  - `src/controllers/commentsControllerPG.js` (+ likeComment)
- files to delete: `src/routes/comments.js` (proven 0/0/0/0)
- files to add: none (R3 tests cover)
- tests to add: R3 suite asserting mounted routers respond (auth-gated 401
  anon where applicable); asserting `routes/comments.js` has zero references;
  asserting like-comment increments `comments.likes`
- regression risks: MEDIUM (mounting changes the live route table; alerts
  suite does not cover these paths, but R1/R2 suites do not either — the
  risk is additive surface, not modified behavior)
- R5/R6 dependency: NONE
- ambiguity: `routes/reputation.js` rewrite touches auth wiring — this is
  WITHIN P1-8 (mounting requires working auth), not an R2 redesign. No
  R2 behavior changes.

## P1-9: UNMATCHED FRONTEND PATHS (corrected live list)

Recon corrects the Phase-11 audit (which audited legacy `api.js` instead of
the live `postApi.js`/`distributionApi.js`). Live mismatches:

| # | Frontend call (live caller) | Backend | Disposition |
|---|---|---|---|
| U1 | `PATCH /posts/:id/engage?type=like\|unlike\|repost\|unrepost` (useEngagement, usePostActions, useDistribution) | only `/like`+`/upvote` | **REAL**: add unified `PATCH /posts/:id/engage` handling like/unlike/repost/unrepost/save/unsave semantics on real columns; keep existing /like+/upvote untouched |
| U2 | `POST\|DELETE /posts/:id/save`, `GET /posts/saved` (useEngagement, usePostActions) | none | **UNAVAILABLE**: explicit 501s (no saved-posts table exists; inventing one is R6-scope schema work — STOP per H6/H11; do NOT create tables in R3) |
| U3 | `PATCH /comments/:commentId/like` (useComments via PostPage) | none | **REAL**: add as nested `PATCH /posts/:postId/comments/:commentId/like` (same change as P1-8 comments decision); frontend `postApi.js` path stays as-is and 404s — REQUIRED frontend fix: update `postApi.js commentsAPI.like` to the nested path (one-line, same PR) |
| U4 | `POST\|DELETE /distribution/*` (useDistribution) | none (no router) | **UNAVAILABLE**: explicit 501 router (`/distribution/share|repost|remix`) OR frontend-gated unavailable. Decision: backend 501 router (truthful, preserves surface for future REAL). Repost-via-engage for posts already works through U1. |
| U5 | `GET /users/:id/posts`, `/users/:id/follow`, `/users/verified`, `/posts/search` (legacy api.js definitions) | none | **NO-OP**: zero consumers (verified repo-wide). Dead client definitions; out of R3 implementation scope (frontend cleanup, not production behavior). Document only. |

- files expected to change:
  - `src/routes/posts.js` (+ engage + save/saved-501s + nested comment-like)
  - `src/controllers/postsControllerPG.js` (+ engage handler; like/unlike/
    repost/unrepost/save/unsave semantics — like/unlike map to existing
    `likes` column; repost/unrepost/save/unsave have NO backing columns →
    per H6/H11 (no destructive/new schema in R3), these return 501, NOT fake
    counters)
  - `src/routes/distribution.js` (NEW 501 router) + mount in index.js
  - `src/controllers/commentsControllerPG.js` (+ likeComment)
  - `iyf-s10-week-09-Kimiti4/src/services/postApi.js` (commentsAPI.like path
    → nested path; one line)
- files to add: `src/routes/distribution.js`
- files to delete: none (except comments.js under P1-8)
- tests to add: R3 suite asserting engage-like/unlike round-trip real counts;
  engage-repost/save → 501; distribution/* → 501; nested comment-like
  increments; legacy dead definitions untouched
- regression risks: MEDIUM (posts routes touched; alerts suite unaffected;
  R1/R2 suites unaffected — they don't cover posts)
- R5/R6 dependency: NONE (explicitly avoids new tables/columns per H6/H11;
  repost/save counts stay 501 until R6 provides storage)
- ambiguity: U1-repost/U1-save returning 501 while U1-like works is
  intentional PARTIAL-REAL per MOCK DATA RULE (real where backed, explicit
  where not)

## MOCK INVENTORY (production-reachable today)

```text
1. store.locations -> GET /api/locations (0 callers, 0 tests)
2. store.marketPrices -> GET /api/market/prices (0 callers, 0 tests)
3. tiannara keyword bodies x3 -> POST /api/tiannara/* (1 caller component,
   currently 401s post-R1 for non-privileged)
4. impact KES/hours/badges -> GET /impact/:id/dashboard (1 caller, 404s today)
5. skills match_score/testimonials/completeExchange -> /skills/* (2 callers, 404s)
6. reputation []/fake-success/signature -> /reputation/* (1 caller, 404s)
7. tiannaraService+postsController double fail-open -> POST /api/posts (LIVE)
```

## DEAD CODE INVENTORY (proven 0 production importers/mounts/callers/tests)

```text
1. src/routes/comments.js (duplicate; P1-8 proposes DELETE)
2. src/middleware/auth.js non-PG (imported only by unmounted reputation.js;
   R3 does NOT propose deletion — reputation.js will import authPG after
   the P1-8 rewrite, leaving auth.js with zero importers; deletion deferred
   to R4 hygiene to keep R3 diff minimal)
3. legacy api.js usersAPI/commentsAPI follow/verified/search definitions
   (0 consumers; frontend cleanup, out of R3 scope)
```

## UNMATCHED ROUTE INVENTORY (live)

```text
U1 engage (like/unlike/repost/unrepost) -> REAL (like/unlike) + 501 (repost/save)
U2 save/saved -> 501 (no storage; R6 owns tables)
U3 comment-like -> REAL nested route + 1-line frontend path fix
U4 distribution/* -> 501 router
U5 legacy dead definitions -> NO-OP (document only)
```

## FAIL-OPEN PATHS (all to be closed in R3)

```text
F1 tiannaraService.moderateContent catch -> safe:true (P1-4)
F2 tiannaraService.moderateBatch catch -> all-safe (P1-4)
F3 postsControllerPG.createPost catch -> fallback-create + moderationChecked:true (P1-4)
```

## PRODUCTION EXPOSURE (today)

```text
/api/locations, /api/market/prices        : LIVE 200 + mock (0 callers)
/api/tiannara/*                            : LIVE 401/403/200-mock (R1-gated; 1 caller)
/api/posts (create)                        : LIVE 201 with fail-open moderation (LIVE callers)
/impact/*, /skills/*, /reputation/*        : 404 (unmounted; live callers exist)
/posts/:id/engage, /posts/:id/save,        : 404 (no route; live callers exist)
/posts/saved, /comments/:id/like,
/distribution/*                            : 404 (no route; live callers exist)
```

## TEST COVERAGE (today)

```text
locations/market/tiannara/impact/skills/reputation/distribution/engage/save:
  zero tests. R3 adds tests/r3-capability.test.js covering all dispositions.
```

## PROPOSED FILE CHANGES (backend unless noted)

```text
M src/controllers/locationsController.js   (501 UNAVAILABLE)
M src/controllers/marketController.js      (501 UNAVAILABLE)
M src/routes/tiannara.js                   (501 bodies; R1 gate intact)
M src/services/tiannaraService.js          (throw on failure; no safe-fallback)
M src/controllers/postsControllerPG.js     (503 on moderation failure; engage handler)
M src/controllers/impactController.js      (raw-only dashboard response)
M src/controllers/skillsController.js      (drop score/testimonials; 501 completeExchange)
M src/controllers/reputationController.js  (drop signature; 501 badges/ledger/feedback/submit)
M src/controllers/commentsControllerPG.js  (+ likeComment)
M src/routes/index.js                      (+ impact/skills/reputation mounts; + distribution mount; - nothing)
M src/routes/reputation.js                 (authPG import; protect on per-user GETs)
M src/routes/impact.js                     (protect on dashboard)
M src/routes/posts.js                      (+ engage, + save/saved 501s, + nested comment-like)
A src/routes/distribution.js               (501 router)
D src/routes/comments.js                   (proven duplicate; 0/0/0/0)
M iyf-s10-week-09-Kimiti4/src/services/postApi.js (commentsAPI.like path, 1 line)
A tests/r3-capability.test.js              (all dispositions + regression pins)
```

## OUT-OF-SCOPE DEPENDENCIES

```text
R5 (P0-7 JWT/session/CSP): NONE. No session, cookie, token-lifetime, or CSP changes.
R6 (login_streak/migrations): NONE. No new tables, no new columns, no migration
  edits, no login_streak touch. U1-repost/save and U2 return 501 precisely
  because storage does not exist; creating it is R6.
DESTRUCTIVE OPERATIONS: one file deletion (routes/comments.js, proven 0/0/0/0).
  No DROP TABLE, no data migration, no column change.
SECURITY CONTROL CHANGES: additive-only (mount existing routers with protect;
  no control weakened; R1/R2 gates untouched).
```

## REGRESSION BASELINE

```text
Alerts:    69/69 PASS (re-verified in R3-A)
Ratelimit:  6/6 PASS (re-verified in R3-A)
R1:        26 PASS + 4 deferred (re-verified in R3-A; characterization unchanged)
R2:        45/45 PASS (re-verified in R3-A; one transient 44/1 in 3 runs,
           documented as TOTP-boundary flake, zero code changes between runs)
```

## IMPLEMENTATION SCOPE REQUESTED

```text
P1-1: UNAVAILABLE (501) — locationsController only
P1-2: UNAVAILABLE (501) — marketController only
P1-3: UNAVAILABLE (501 bodies, R1 gate intact) — routes/tiannara.js only
P1-4: FAIL-CLOSED (throw + 503, no post created) — tiannaraService +
      postsControllerPG.createPost only
P1-5: PARTIAL-REAL (raw-only dashboard) — impactController only
P1-6: PARTIAL-REAL (drop score/testimonials; 501 completeExchange) —
      skillsController only
P1-7: PARTIAL-REAL (drop signature; 501 badges/ledger/feedback/submit) —
      reputationController only
P1-8: MOUNT impact+skills+reputation (with auth fixes), DELETE comments.js,
      ADD nested comment-like — index.js, reputation.js, impact.js, posts.js,
      commentsControllerPG.js; delete routes/comments.js
P1-9: REAL engage-like/unlike + 501 repost/save/saved (posts.js,
      postsControllerPG.js); 501 distribution router (new file + mount);
      1-line postApi.js path fix; U5 dead definitions NO-OP
```

## OUT-OF-SCOPE IMPACT

```text
Frontend: 1-line path fix in postApi.js (commentsAPI.like). No redesign, no
  new components, no mock disclosure UI (the 501 bodies are self-describing;
  existing frontend error paths surface `error` strings).
R1 suite: T14/T15 assert moderator/admin get 200 from /moderate. P1-3 changes
  that to 501. AMENDMENT TO R1 T14/T15 EXPECTATIONS REQUESTED (status 200→501;
  R1 auth assertions — 401 anon / 403 user — unchanged and re-verified).
```

## R5 DEPENDENCY: NONE
## R6 DEPENDENCY: NONE

## DESTRUCTIVE OPERATIONS REQUIRED

```text
YES — one file deletion: src/routes/comments.js.
Proof of 0/0/0/0: 0 production importers (grep), 0 mounts (index.js),
0 frontend callers (all comment calls go through nested posts paths or the
unmatched /comments/:id/like which is being re-homed), 0 tests.
Deletion is revivable from git history if ever needed.
NO database destructive operations.
```

## SECURITY CONTROL CHANGES

```text
Additive-only: protect added to impact dashboard + reputation per-user GETs.
No control weakened. R1/R2 gates untouched. Tiannara R1 gate untouched.
```

## REGRESSION RISK: MEDIUM

```text
Rationale: posts routes/controllers touched (engage, moderation-fail-closed);
mounts change the live route table. Mitigations: alerts suite covers none of
these paths (no shared code with alerts flow); R1/R2 suites cover none of
these paths; R3 suite pins old+new behavior; full regression lock re-run
before STOP REPORT 2. Rollback = git checkout of the listed files.
```

## AUTHORIZATION REQUIRED: YES

```text
DECISION REQUIRED

[1] AUTHORIZE IMPLEMENTATION (including the R1 T14/T15 200→501 amendment
    and the routes/comments.js deletion)
[2] HOLD
[3] REQUEST SCOPE CHANGE
[4] ABORT PHASE
```
