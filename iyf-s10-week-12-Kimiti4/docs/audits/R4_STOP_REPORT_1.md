# R4 STOP REPORT 1 — RECONNAISSANCE COMPLETE (PRE-IMPLEMENTATION)

> Per R4 spec §21/§22. Read-only recon. No implementation.
> R4 reconnaissance does NOT authorize implementation.

## STATUS: RECON COMPLETE

## REGRESSION BASELINE (R4 spec §3)

```text
Alerts:    69 passed / 0 failed   PASS (re-verified in R4-A)
Ratelimit:  6 passed / 0 failed   PASS (re-verified in R4-A)
R1:        26 passed / 4 deferred (known login_streak drift, unchanged) PASS
R2:        45 passed / 0 failed   PASS (re-verified in R4-A)
R3:        53 passed / 0 failed   PASS (re-verified in R4-A)
```

## BACKEND ROUTE INVENTORY (R4 spec §4)

16 router files, 15 mounted (test.js staging-only). Full table
(method/path/router/middleware/handler/auth):

```text
GET    /api/health                              index.js      -              query(SELECT 1)      public
GET    /api/market                              market.js     -              501 MARKET_*         public (R3)
GET    /api/market/prices                       market.js     -              501 MARKET_*         public (R3)
GET    /api/locations                           locations.js  -              501 LOCATIONS_*      public (R3)
GET    /api/organizations                       organizations public         getOrganizations     public
GET    /api/organizations/:slug                 organizations public         getOrganization      public
GET    /api/organizations/my                    organizations protect        getMyOrganizations   auth
POST   /api/organizations                       organizations protect        createOrganization   auth
PUT    /api/organizations/:id                   organizations protect        updateOrganization   auth+isAdmin
DELETE /api/organizations/:id                   organizations protect        deleteOrganization   auth+owner
POST   /api/organizations/:id/join              organizations protect        joinOrganization     auth
POST   /api/organizations/:id/leave             organizations protect        leaveOrganization    auth
GET    /api/organizations/:id/members           organizations protect        getMembers           auth
PUT    /api/organizations/:id/members/:userId   organizations protect        updateMemberRole     auth+isAdmin
POST   /api/organizations/:id/members/:userId/approve organizations protect  approveMember        auth+isAdmin
DELETE /api/organizations/:id/members/:userId   organizations protect        removeMember         auth+isAdmin
POST   /api/organizations/:id/transfer          organizations protect        transferOwnership    auth+owner
GET    /api/organizations/:id/analytics         organizations protect        getAnalytics         auth+isAdmin
GET    /api/verification/badges/config          verification  -              getBadgeConfigs      public
GET    /api/verification/users/:userId/badge    verification  -              getUserBadge         public
GET    /api/verification/organizations/:orgId/badge verification -           getOrganizationBadge public
POST   /api/verification/users/:userId/verify   verification  protect+admin  verifyUser           admin
DELETE /api/verification/users/:userId/verify   verification  protect+admin  unverifyUser        admin
POST   /api/verification/organizations/:orgId/verify verification protect+admin verifyOrganization admin
DELETE /api/verification/organizations/:orgId/verify verification protect+admin unverifyOrg      admin
GET    /api/metrics/platform                    metrics       -              getPlatformMetrics   public
GET    /api/metrics/trending                    metrics       -              getTrendingContent   public
GET    /api/metrics/organizations/:orgId/health metrics       -              getOrgMetrics        public
GET    /api/metrics/users/:userId/activity      metrics       protect        getUserMetrics       self/admin/mod (R1)
GET    /api/metrics/users/:userId/avatar-icon   metrics       protect        getUserAvatarIcon    auth (R1)
POST   /api/tiannara/mental-health              tiannara      protect+role   501 (R3)             admin/mod/founder
POST   /api/tiannara/fact-check                 tiannara      protect+role   501 (R3)             admin/mod/founder
POST   /api/tiannara/moderate                   tiannara      protect+role   501 (R3)             admin/mod/founder
GET    /api/alerts                              alerts        -              getAlerts            public
GET    /api/alerts/stats                        alerts        -              getAlertStats        public
GET    /api/alerts/:id                          alerts        -              getAlertById         public
POST   /api/alerts                              alerts        protect(requireAuth alias) createAlert auth
PUT    /api/alerts/:id                          alerts        protect        updateAlert          auth+owner/admin/mod
DELETE /api/alerts/:id                          alerts        protect        deleteAlert          auth+owner/admin/mod
POST   /api/alerts/:id/confirm                  alerts        protect        confirmAlert         auth
DELETE /api/alerts/:id/unconfirm                alerts        protect        unconfirmAlert       auth
PUT    /api/alerts/:id/verify                   alerts        protect+role   verifyAlert          admin/moderator
POST   /api/auth/register                       auth          -              register             public
POST   /api/auth/login                          auth          -              login                public
POST   /api/auth/logout                         auth          -              logout               public (stub)
POST   /api/auth/send-verification              auth          verificationLimiter sendVerification public+limited (R2)
POST   /api/auth/verify-code                    auth          verificationLimiter verifyCode      public+limited (R2)
POST   /api/auth/mfa/totp/enroll                auth          protect        enrollTotp           auth (R2)
POST   /api/auth/mfa/totp/verify                auth          protect        verifyTotp           auth (R2)
GET    /api/auth/google                         auth          -              scaffold JSON        public (deferred)
GET    /api/auth/google/callback                auth          -              scaffold JSON        public (deferred)
GET    /api/auth/me                             auth          protect        getMe                auth
PUT    /api/auth/me                             auth          protect        updateProfile        auth
PUT    /api/auth/change-password                auth          protect        changePassword       auth
GET    /api/posts                               posts         optionalAuth   getAllPosts          public
GET    /api/posts/trending                      posts         -              getTrendingTags      public
GET    /api/posts/saved                         posts         protect        501 (R3)             auth
GET    /api/posts/:id                           posts         -              getPostById          public
GET    /api/posts/:id/comments                  posts         -              getComments          public
POST   /api/posts/:id/comments                  posts         protect+validate createComment      auth
DELETE /api/posts/:id/comments/:commentId       posts         protect        deleteComment        auth+owner/admin
PATCH  /api/posts/:id/comments/:commentId/like  posts         protect        likeComment          auth (R3)
POST   /api/posts                               posts         protect+validate createPost         auth
PUT    /api/posts/:id                           posts         protect+validate updatePost         auth+owner/admin
DELETE /api/posts/:id                           posts         protect        deletePost           auth+owner/admin
PATCH  /api/posts/:id/like                      posts         protect        likePost             auth
PATCH  /api/posts/:id/upvote                    posts         protect        upvotePost           auth
PATCH  /api/posts/:id/engage                    posts         protect        engagePost           auth (R3)
POST   /api/posts/:id/save                      posts         protect        501 (R3)             auth
DELETE /api/posts/:id/save                      posts         protect        501 (R3)             auth
GET    /api/users                               users         protect+admin  getAllUsers          admin/founder (R1)
PUT    /api/users/role/:userId                  users         protect+admin  updateUserRole       admin/founder
POST   /api/users/ban/:userId                   users         protect+admin  banUser              admin/founder
POST   /api/users/unban/:userId                 users         protect+admin  unbanUser            admin/founder
GET    /api/users/me                            users         protect        getMyProfile         auth
PUT    /api/users/profile                       users         protect        updateProfile        auth
GET    /api/users/stats/:id?                    users         protect        getUserStats         self/admin (R1)
GET    /api/users/:id                           users         protect        getUserById          auth+projection (R1)
GET    /api/impact/:id/dashboard                impact        protect        getImpactDashboard   auth (R3)
POST   /api/impact/track                        impact        protect        trackImpact          auth
GET    /api/skills/profile                      skills        protect        getProfile           auth
POST   /api/skills/profile                      skills        protect        saveProfile          auth
GET    /api/skills/matches                      skills        protect        getMatches           auth
POST   /api/skills/complete/:match_id           skills        protect        501 (R3)             auth
GET    /api/reputation/leaderboard/all          reputation    -              getLeaderboard       public
GET    /api/reputation/leaderboard/:tier        reputation    -              getLeaderboard       public
GET    /api/reputation/export                   reputation    protect        exportPassport       auth
GET    /api/reputation/:userId                  reputation    protect        getUserReputation    auth
GET    /api/reputation/:userId/badges           reputation    protect        501 (R3)             auth
GET    /api/reputation/:userId/feedback         reputation    protect        501 (R3)             auth
GET    /api/reputation/:userId/ledger           reputation    protect        501 (R3)             auth
POST   /api/reputation/feedback/submit          reputation    protect        501 (R3)             auth
POST   /api/reputation/contribution/log         reputation    protect        logContribution      auth
POST   /api/distribution/share                  distribution  protect        501 (R3)             auth
POST   /api/distribution/repost                 distribution  protect        501 (R3)             auth
DELETE /api/distribution/repost                 distribution  protect        501 (R3)             auth
POST   /api/distribution/remix                  distribution  protect        501 (R3)             auth
POST   /api/test/seed                           test          -              hardcoded test user  staging-only
DELETE /api/test/cleanup                        test          -              deletes test posts   staging-only
```

Note: `src/routes/distribution.js` is untracked (new R3 file) so it does not
appear in `git grep`; its 4 routes are listed above from direct read.

## FRONTEND API INVENTORY (R4 spec §5)

Live service modules and their backend targets:

```text
postApi.js (LIVE — imported by 8 hooks/pages):
  GET /posts, /posts/:id, POST/PUT/DELETE /posts, PATCH engage,
  POST|DELETE /posts/:id/save, GET /posts/saved, GET /posts/trending,
  GET /posts?author=, nested comments CRUD + comment-like
distributionApi.js (LIVE — useDistribution):
  POST|DELETE /distribution/*, PATCH engage (posts branch)
api.js legacy (PARTIAL — AuthContext, OrganizationContext, AlertFeedPage,
  EnhancedRegisterPage, ImpactMeterWidget, SkillMatchCard, ReputationSystem,
  SkillExchange import it):
  auth/organizations/alerts/impact/skills/reputation/users subsets
analyticsApi/creatorApi/discoveryApi/jamApi/moderationApi/notificationApi/
reelApi/safetyApi/socialApi/feedApi (LIVE importers — hooks/pages):
  /analytics/*, /creator/*, /discover/*, /jams/*, /contributions/*,
  /moderation/*, /notifications/*, /reels/*, /safety/*, /social/*
  — NO backend router exists for any of these 10 prefixes
TiannaraAssistant.jsx: POST /api/tiannara/* with NO auth header
socketClient.js: socket.io realtime (AlertFeedPage)
```

## ROUTE CONTRACT MATRIX (R4 spec §6)

| Frontend Call | Backend Route | Method | Auth | Status | Contract |
|---|---|---|---|---|---|
| postApi.getAll `GET /posts` | `GET /api/posts` | MATCH | MATCH (optionalAuth) | 200 | **RESPONSE MISMATCH** (M1) |
| postApi.getById/trending/create/update/delete | matching posts routes | MATCH | MATCH | 200/201 | MATCH (shape drift, see M7) |
| postApi like/unlike `PATCH engage` | `PATCH /:id/engage` | MATCH | MATCH | 200 | MATCH (R3) |
| postApi repost/unrepost `PATCH engage` | `PATCH /:id/engage` | MATCH | MATCH | 501 | MATCH (R3 explicit) |
| postApi save/unsave/getSaved | save/saved 501s | MATCH | MATCH | 501 | MATCH (R3 explicit) |
| commentsAPI nested CRUD + like | nested posts routes | MATCH | MATCH | 200/201/204/200 | MATCH (R3) |
| distributionAPI repost(post) | `PATCH engage` | MATCH | MATCH | 200/501 | MATCH (R3 explicit) |
| distributionAPI share/repost/remix | distribution 501s | MATCH | MATCH | 501 | MATCH (R3 explicit) |
| ImpactMeterWidget `api.impact.*` | mounted impact routes | MATCH | MATCH | 200 | MATCH (R3) |
| SkillExchange `api.skills.*` | mounted skills routes | MATCH | MATCH | 200/501 | MATCH (R3) |
| ReputationSystem `api.reputation.*` | mounted reputation routes | MATCH | MATCH | 200/501 | MATCH (R3) |
| AuthContext `authAPI.*` | auth routes | MATCH | MATCH | 200 | MATCH |
| organizationsAPI.* | organizations routes | MATCH | MATCH | 200 | MATCH |
| alertsAPI.* | alerts routes | MATCH | MATCH | 200 | MATCH |
| analyticsApi `/analytics/*` | NONE | — | — | 404 | **DEAD ROUTE (backend missing)** (M2) |
| creatorApi `/creator/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| discoveryApi `/discover/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| jamApi `/jams/*`, `/contributions/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| moderationApi `/moderation/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| notificationApi `/notifications/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| reelApi `/reels/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| safetyApi `/safety/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| socialApi `/social/*` | NONE | — | — | 404 | **DEAD ROUTE** (M2) |
| legacy api.js usersAPI.* | no dedicated routes | — | — | 404 via `/:id` | **DEAD CALLER** (0 consumers; M3) |
| legacy api.js `/posts/search`, `/comments/:id/like`, `/posts/:id/engage`(api.js variant) | none/existing | — | — | 404 or covered | **DEAD CALLER** (0 consumers; M3) |
| TiannaraAssistant `/api/tiannara/*` | tiannara 501s | MATCH | **AUTH MISMATCH** (M4) | 401 | no auth header sent |
| `POST /posts/:id/comments` (postApi) | backend +validateComment | MATCH | MATCH | **400** | **PARAMETER MISMATCH** (M5) |

## PATH MISMATCHES

```text
M1 (RESPONSE, live): GET /api/posts returns
  {success,count,total,pages,currentPage,data:[...]} but postApi.getAll reads
  data.posts (undefined) -> falls back to body object -> .map throws.
  Empirically verified live (probe script): status 200, keys
  [success,count,total,pages,currentPage,data], body.posts undefined,
  hasMore absent, page absent (currentPage instead). THE MAIN FEED IS BROKEN.
M2 (DEAD ROUTE, live callers): 10 frontend service modules (analytics,
  creator, discovery, jams, moderation, notifications, reels, safety,
  social + contributions) target backend prefixes with no router. Every call
  404s. feedApi.fetchForYouFeed degrades gracefully (allSettled); the rest
  surface apiClient 404 errors.
M3 (DEAD CALLER, no action): legacy api.js usersAPI/search/engage-variants
  have zero consumers. Document only.
M4 (AUTH, live): TiannaraAssistant sends no Authorization header; post-R1 all
  calls 401. Frontend needs the auth header (one-line class fix in the
  component) OR the component needs an unavailable state.
M5 (PARAMETER, live): validateComment requires `author` in body; postApi
  commentsAPI.create sends {content, parentComment} only -> every comment
  creation 400s. Either the validator must stop requiring author (server
  derives it from JWT) or the frontend must send it.
```

## METHOD MISMATCHES

```text
None beyond M1-M5. All live frontend methods match their backend routes
(GET/POST/PUT/PATCH/DELETE verified per route in the inventory).
```

## PARAMETER MISMATCHES

```text
M5 above (comment author). Additionally:
- postApi.create sends {title, content, category, location, metadata, tags,
  organization, image?}; validatePost requires title/content/author/category
  and REJECTS missing author -> post creation 400s unless the caller sends
  author. postApi.create does NOT send author. LIVE mismatch (same class as
  M5). Backend derives authorId from JWT; requiring `author` in body is
  stale (the non-PG-era `author` string field). Recommend: drop the `author`
  requirement from validatePost (server uses req.user.id).
- getAllPosts accepts author/category/search/county/etc. as query — matches
  postApi.getAll/getByAuthor. OK.
- organizations :slug vs :id — backend getOrganization tries slug then UUID.
  OK.
```

## AUTHORIZATION MISMATCHES

```text
None new. R1/R2 boundaries verified intact on every touched route:
- /users, /users/:id, /users/stats, /metrics/.../activity, /tiannara/*,
  /auth/mfa/*, /auth/send-verification, /auth/verify-code — all as closed.
- New R3 mounts (impact/skills/reputation/distribution) all carry protect
  (except reputation leaderboard aggregates, intentionally public like
  /metrics/platform).
- Organizations member mutations all check isAdmin/owner server-side.
- Posts update/delete check author/admin; comments delete checks
  author/admin/founder; alerts check author/admin/moderator.
- staging test.js seed/cleanup have NO auth but are mounted ONLY when
  NODE_ENV=staging (app.js:66-69). Test credential TestPass123! is a
  hardcoded literal in source (TEST-ONLY; recommend env-gating or removal
  in a later hygiene pass — NOT R4 scope unless authorized).
```

## STATUS-CODE MISMATCHES

```text
- R3 501s verified intact on all 14 endpoints (re-verified live in R4-A where
  covered by the R3 suite; full list in R3 STOP REPORT 2).
- validatePost/validateComment return 400 with {success:false,error,errors} —
  contract-correct.
- apiClient.request throws on 401/403/404 with Error(message) and returns
  parsed JSON otherwise — including for 204 (see below).
- DELETE /posts/:id/comments/:commentId returns 204 with EMPTY body;
  apiClient.request calls response.json() unconditionally -> SyntaxError on
  success. LIVE BUG (M6): successful comment deletion throws client-side.
```

## RESPONSE-CONTRACT MISMATCHES

```text
M1 (above): posts list shape.
M6 (above): 204-empty vs unconditional .json().
M7 (shape drift, non-breaking): postApi.getById/create/update read
  `data.post || data` but backend returns {success, data: post} (no `post`
  key) -> falls back to body object -> normalizePost(body) likely yields a
  degraded/empty normalized post rather than throwing. Same pattern in
  commentsAPI (data.comment), distributionAPI (data.repost), reelApi
  (data.reblogs), socialApi. Recommend normalizing on `data.data` with
  fallbacks (frontend-only fix, no backend change).
```

## DEAD/LEGACY ROUTES

```text
- src/middleware/auth.js (non-PG): imported only by nothing now
  (reputation.js rewired in R3). 0 importers. Candidate for deletion (R4
  hygiene; needs authorization — it is a file deletion).
- src/middleware/requireAuth.js: already deleted (R1).
- src/controllers/authController.js + usersController.js (non-PG): 0
  importers (R-audit). Candidates for deletion (needs authorization).
- src/controllers/usersController.js imports data/store (dead file).
- legacy api.js usersAPI/follow/verified/search/engage-variants: 0 consumers.
  Frontend cleanup (needs authorization; frontend files).
- routes/test.js: staging-only seed/cleanup. NOT dead (mounts in staging);
  hardcoded TEST credential noted above.
- getUserPosts/getOrganizationPosts (postsControllerPG exports): exported but
  no route references them. Dead handlers (not dead routes). Leave or wire
  only if authorized.
```

## DUPLICATE/SHADOWED ROUTES

```text
- /api/users/verified -> swallowed by /:id (protected; 404 user-not-found).
  Truthful 404. No action (U5 NO-OP).
- /api/posts/search (legacy) -> swallowed by /:id -> 404. Truthful. No action.
- /api/posts/saved correctly ordered before /:id (R3). Verified live (501).
- /api/users/me, /stats/:id?, /role/:userId correctly ordered before /:id
  (R1). Verified live.
- /api/reputation/export + /leaderboard/* correctly ordered before /:userId
  (R3 rewrite). Verified live.
- No double mounts. No duplicate handlers for the same method+path.
```

## R3 501 CONTRACT VERIFICATION (R4 spec §13)

```text
Re-verified via the R3 suite (53/53 in R4-A lock run):
locations, market, tiannara x3, skills completeExchange, reputation x4
stubs, engage-repost, save/saved x2, distribution x1 (probe) — all 501.
Full 14-endpoint list per R3 STOP REPORT 2. PASS.
```

## FRONTEND ROUTE STATUS (R4 spec §19, summary)

```text
Routed pages with working API: /, /login, /register, /alerts,
  /emergency-alerts, /posts/:id, /mtaani, /skills, /farm, /gigs, /org/:slug,
  /profile/:userId, /following, /activity, /discover (partial), /tiannara
  (gated 401/501), /events (no backend — UI-ONLY), /chat (no backend —
  UI-ONLY), /drafts (local-only), /create/jam + /jams + /jams/:id (no
  backend — UI-ONLY), /reels + /reels/:id (no backend — UI-ONLY),
  /notifications (no backend — UI-ONLY), /creator/studio (no backend —
  UI-ONLY).
Direct-URL/deep-link behavior: React Router SPA; backend serves index.html
fallback for non-API routes (app.js catchall). No E2E executed in R4-A
(requires running servers; noted for implementation-phase verification).
```

## IDOR/BOLA FINDINGS (R4 spec §10)

```text
No NEW IDOR/BOLA beyond R1/R2 closures. Specifically probed:
- organizations member routes: isAdmin/owner checks present on every
  mutation + analytics. PASS.
- posts update/delete: author/admin checks present. PASS.
- comments delete: author/admin/founder checks present. PASS.
- alerts update/delete/verify: author/admin/moderator checks present. PASS.
- users/stats + metrics/activity: R1-closed, re-verified. PASS.
- reputation per-user GETs: protect added in R3. No owner check — any
  authenticated user can read any user's reputation. Reputation data is
  low-sensitivity (score/rank/counts) and the pre-R3 behavior was fully
  public; R3 strictly improved it. Documented as accepted residual, NOT
  a new finding.
```

## PROPOSED FILE CHANGES (implementation scope requested)

```text
F1 postApi.js getAll: read data.data with fallbacks; compute hasMore from
   total/page (frontend-only; no backend change).
F2 postApi.js getById/create/update + commentsAPI.getByPost/create +
   distributionApi repost shapes: read data.data with fallbacks (frontend-only).
F3 apiClient.js: guard response.json() for 204/empty bodies (frontend-only).
F4 validatePost: drop the stale `author` body requirement (server derives
   authorId from JWT). Backend one-line-class fix.
F5 validateComment: drop the stale `author` body requirement (same rationale).
F6 TiannaraAssistant.jsx: send Authorization header via authStorage (one-line
   class fix) so privileged users get 501-truthful instead of 401; non-
   privileged still 403 (R1 intact).
F7 M2 dead-backend surface (/analytics,/creator,/discover,/jams,
   /contributions,/moderation,/notifications,/reels,/safety,/social):
   NO backend implementation (out of scope per §1/R3 rule). Options for
   authorization: (a) document as UI-ONLY/UNAVAILABLE and leave 404s;
   (b) add explicit 501 routers mirroring R3-distribution. RECOMMEND (b)
   for the 10 prefixes (mechanical, truthful, preserves surface) ONLY if
   authorized; otherwise (a).
F8 Dead-file deletions (each needs explicit authorization; all proven 0/0/0/0
   or 0-consumers): middleware/auth.js, controllers/authController.js,
   controllers/usersController.js, legacy api.js dead definitions (frontend).
```

## PROPOSED DELETIONS

```text
NONE without separate explicit authorization. F8 lists candidates only.
```

## TEST PLAN

```text
New tests/r4-contracts.test.js:
- posts list shape: GET /api/posts -> body has data[]; frontend-equivalent
  projection (data.data ?? data.posts ?? []) yields an array (pins F1)
- comment create without author -> 201 (pins F5)
- post create without author -> 201 (pins F4)
- comment delete -> 204 with empty body; client guard handles it (pins F3)
- tiannara with auth header as admin -> 501 (pins F6 backend side;
  frontend header change verified by code inspection + existing R1/R3 tests)
- M2 prefixes (if (b) authorized): each -> 501 with code; else: document 404
- R3 501s re-pinned (subset): locations/market/tiannara/distribution
- getById/create/update shape fallbacks (pins F2/M7)
```

## R5 DEPENDENCY: NONE
## R6 DEPENDENCY: NONE

## DESTRUCTIVE OPERATIONS: NO

```text
No file deletions proposed without separate authorization. No DB operations.
```

## SECURITY CONTROL CHANGES: NO

```text
No control weakened. F4/F5 remove stale body-field requirements that the
server never used for authorization (authorId always came from JWT).
```

## REGRESSION RISK: LOW

```text
F1/F2/F3/F6 are frontend-only (no backend behavior change; backend suites
unaffected). F4/F5 touch validation middleware used by posts/comments
creation — the R3 suite creates posts/comments in setup paths; risk is
additive-permissive (fewer 400s), mitigated by the full lock re-run.
```

## IMPLEMENTATION SCOPE REQUESTED

```text
F1 postApi.js list-shape fallbacks
F2 postApi/distribution shape fallbacks
F3 apiClient 204 guard
F4 validatePost drop author requirement
F5 validateComment drop author requirement
F6 TiannaraAssistant auth header
F7 M2 501 routers OR document-only (AUTHORIZATION DECIDES)
F8 dead-file deletions (SEPARATE authorization required; default NO)
+ tests/r4-contracts.test.js
```

## AUTHORIZATION REQUIRED: YES

```text
DECISION REQUIRED:
[1] AUTHORIZE IMPLEMENTATION (specify: F1-F6 + tests; F7 (a) or (b); F8 yes/no)
[2] HOLD
[3] REQUEST SCOPE CHANGE
[4] ABORT PHASE
```
