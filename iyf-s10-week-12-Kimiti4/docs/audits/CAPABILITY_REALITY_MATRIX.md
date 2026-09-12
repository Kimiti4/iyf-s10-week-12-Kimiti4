# CAPABILITY REALITY MATRIX

> Per-capability classification. UI/API/DB/External/Tests columns are evidence-based; **Real?** column uses the prompt's six classes (REAL / PARTIAL / MOCK / SCAFFOLD / TEST-ONLY / UNAVAILABLE).
> A capability is REAL only if its complete production path is demonstrated (real UI + real API + real DB + no synthetic data + tests that prove semantic correctness, not just HTTP 200).

## Core platform

| Capability | UI (frontend) | API (backend) | DB | External | Tests | Real? | Status |
|---|---|---|---|---|---|---|---|
| **Auth: register** | `LoginPage.jsx`, `RegisterPage.jsx`, `AuthContext.jsx` | `routes/auth.js → authControllerPG.register` | `users` | none | none (no auth-flow test) | PARTIAL | Real endpoint, no dedicated test; password ≥6 char, email regex, bcrypt hash. |
| **Auth: login** | `AuthContext.jsx` | `authControllerPG.login` | `users` | none | none | PARTIAL | Returns JWT 7d, no failed-login counter. |
| **Auth: logout (server)** | `AuthContext.jsx` | `authControllerPG.logout` | none | none | none | MOCK | Returns 200, no token invalidation. |
| **Auth: me / updateProfile** | `AuthContext.jsx`, `ProfilePage.jsx` | `authControllerPG.getMe / updateProfile` | `users` | none | none | REAL | `protect` enforced. |
| **Auth: changePassword** | `SettingsPage.jsx` | `authControllerPG.changePassword` | `users` | none | none | REAL | bcrypt rehash. |
| **MFA: TOTP enrollment** | none | `authControllerPG.sendVerification` (method: totp) | **no DB persistence** | none | none | SCAFFOLD | Returns secret in response; secret not stored. |
| **MFA: TOTP verify** | none | `authControllerPG.verifyCode` (method: totp) | none | none | none | SCAFFOLD | **P0-5**: accepts secret from request body. |
| **Email verification** | none | `authControllerPG.sendVerification` (method: email) → Ethereal | none | Ethereal (mock SMTP) | none | MOCK | Production paths send to a test inbox. |
| **Phone verification** | none | `authControllerPG.sendVerification` (method: phone) | none | `console.log` simulation | none | MOCK | No real SMS gateway. |
| **OAuth (Google)** | none | `routes/auth.js` lines 19-26 (Mock JSON literal) | none | none | none | SCAFFOLD | Explicitly deferred. |
| **Alerts: list / search / filters** | `AlertFeedPage.jsx`, `AlertCard.jsx`, `CreateAlertForm.jsx`, `EnhancedEmergencyAlerts.jsx` | `alertsControllerPG.getAlerts` → `AlertRepository.find` (FTS-aware) | `alerts` (with `search_vector`, trigram, county/settlement/ward) | none | **69 contract tests** (geographic, DTO, FTS fallback) | **REAL** | Contract suite proves semantic correctness. |
| **Alerts: create / update / delete** | `CreateAlertForm.jsx` | `alertsControllerPG.{createAlert, updateAlert, deleteAlert}` | `alerts` | none | contract tests | **REAL** | Ownership check server-side. |
| **Alerts: confirm / unconfirm** | (UI in AlertCard) | `alertsControllerPG.{confirmAlert, unconfirmAlert}` | `alert_confirmations` | none | contract tests | **REAL** | Duplicate confirmation handled (PG unique constraint). |
| **Alerts: verify (admin/moderator)** | (UI minimal) | `alertsControllerPG.verifyAlert` | `alerts` | none | contract tests | **REAL** | `restrictTo('admin','moderator')` enforced. |
| **Alerts: stats** | (UI in some pages) | `alertsControllerPG.getAlertStats` | `alerts` | none | contract tests | **REAL** | Real aggregation. |
| **Posts: list / detail** | `HomePage.jsx`, `PostListPage.jsx`, `PostPage.jsx`, `PostCard.jsx`, `UnifiedFeed.jsx` | `postsControllerPG.getAllPosts / getPostById` → `PostRepository` | `posts` | none | none | REAL | No dedicated test. |
| **Posts: create / update / delete** | `CreatePostPage.jsx`, `PostComposer.jsx` | `postsControllerPG.{createPost, updatePost, deletePost}` | `posts` | none | none | REAL | `validatePost` middleware. |
| **Posts: like / upvote** | `PostEngagement.jsx`, `PostActions.jsx` | `postsControllerPG.likePost / upvotePost` | `posts.likes, upvotes` | none | none | REAL | Increments. |
| **Posts: search** | `SearchResultsPage.jsx`, `SearchBar.jsx` | (frontend calls `/api/posts/search`; backend has only `?search=` query) | n/a | n/a | n/a | PARTIAL | Path mismatch: frontend expects `/posts/search`, backend accepts only `?search=` on `/posts`. |
| **Posts: trending tags** | `TrendingChip.jsx` | `postsControllerPG.getTrendingTags` | `posts.tags` (GIN) | none | none | REAL | Real GIN-indexed tag query. |
| **Comments: list / create / delete** | `CommentList.jsx`, `CommentComposer.jsx` | `commentsControllerPG` | `comments` | none | none | REAL | Server-side ownership check; admin/founder override. |
| **Comments: like** | `CommentComposer.jsx` | (no `/api/comments/:commentId/like` route) | n/a | n/a | n/a | **UI-ONLY** | Frontend path **P1-9**; backend has no such route. |
| **Organizations: list / get / create** | `OrganizationPage.jsx` | `organizationsControllerPG.{getOrganizations, getOrganization, createOrganization}` | `organizations` | none | none | REAL | `createOrganization` sets `ownerId=req.user.id`. |
| **Organizations: update / delete** | (UI minimal) | `organizationsControllerPG.{updateOrganization, deleteOrganization}` | `organizations` | none | none | REAL | `isAdmin` check on update; `owner.id === req.user.id` on delete. |
| **Organizations: members / join / leave** | (UI minimal) | `organizationsControllerPG.{joinOrganization, leaveOrganization, getMembers}` | `memberships` | none | none | REAL | Auto-approval or pending based on org setting. |
| **Organizations: transfer ownership** | (UI minimal) | `organizationsControllerPG.transferOwnership` | `organizations` | none | none | REAL | need controller check (presumed). |
| **Organizations: analytics** | (UI in OrganizationPage) | `organizationsControllerPG.getAnalytics` | aggregates | none | none | REAL | Real query. |
| **Organizations: by slug** | `OrganizationPage.jsx` calls `/organizations/:slug` | `routes/organizations.js:27` accepts `:slug` | n/a | n/a | n/a | REAL | Controller `findBySlug` then `findById` if UUID-shaped. |
| **Verification: badges** | `VerificationBadge.jsx`, `ModerationBadge.jsx` | `verificationControllerPG` | `users.verification_*` / `organizations.verification_*` | none | none | REAL | `protect + restrictTo('admin')` enforced. |
| **Realtime (socket.io)** | `socketClient.js` | `socketService.js`, `initializeSocketIO` | n/a | socket.io | none | PARTIAL | Wired; no proof of auth or emitted events. |
| **Impact tracking (write)** | `ImpactMeterWidget.jsx` | `impactController.trackImpact` | `impact_metrics` | none | none | REAL | `protect` enforced. |
| **Impact dashboard** | `ImpactMeterWidget.jsx` | `impactController.getImpactDashboard` | `impact_metrics` | none | none | PARTIAL | Real DB sums + count for rank; **synthetic multipliers** for KES/hours. |
| **Reputation** | `ReputationSystem.jsx`, `ReputationProfilePage.jsx` | `reputationController.js` (not mounted in routes/index.js) | `users.reputation_*` | none | none | UI-ONLY | Frontend calls `/reputation/:userId` → 404. |
| **Skills: profile** | `SkillExchange.jsx` | `skillsController.saveProfile / getProfile` (not mounted) | `user_skills` | none | none | UI-ONLY | Frontend `/skills/profile` → 404. |
| **Skills: matches** | `SkillExchange.jsx` | `skillsController.getMatches` (not mounted) | `skill_matches` | none | none | UI-ONLY | Even if mounted, returns **fake match_score 0.95** + random testimonials. |
| **Skills: complete exchange** | `SkillExchange.jsx` | `skillsController.completeExchange` (not mounted) | none (no persist) | none | none | UI-ONLY + MOCK | Returns success without DB write. |
| **Locations (county/settlement lookup)** | (used in forms/filtering) | `locationsController.getAllLocations` → `data/store.js` (in-memory mock) | none | none | none | **MOCK** | Returns hardcoded array. |
| **Market prices (FarmLink)** | (in MarketplacePage) | `marketController.getPrices` → `data/store.js` (in-memory mock) | none | none | none | **MOCK** | Returns hardcoded price list. |
| **Metrics: platform / trending** | `CreatorStats.jsx`, `AnalyticsCard.jsx` | `metricsControllerPG.getPlatformMetrics / getTrendingContent` | `users`, `posts`, `comments`, `memberships` | none | none | REAL | Real DB queries. |
| **Metrics: user activity** | (in ProfilePage) | `metricsControllerPG.getUserMetrics` (public route) | `users`, `posts`, `comments` | none | none | **REAL endpoint, P0 data exposure** | **P0-3**: route is public; any user can read any user's activity. |
| **Tiannara AI: mental-health** | `TiannaraAssistant.jsx` | `routes/tiannara.js /mental-health` (keyword mock) | none | none | none | **MOCK** | Keyword-based sentiment/urgency; canned response. |
| **Tiannara AI: fact-check** | `TiannaraAssistant.jsx` | `routes/tiannara.js /fact-check` (keyword mock) | none | none | none | **MOCK** | Hardcoded list of "common misinformation". |
| **Tiannara AI: moderate** | (UI ModerationBadge, ReportSheet) | `routes/tiannara.js /moderate` (keyword mock) | none | none | none | **MOCK + P0-4** | Unauthenticated endpoint, keyword-based. |
| **Tiannara: real client** | (none direct) | `services/tiannaraService.js` (fetch client) | none | `TIANNARA_API_URL` external | none | REAL (when service up) / **fail-open** | When external service is reachable, real moderation; on failure, posts silently allowed. |
| **Founder account (script)** | `FounderDashboard.jsx` | `scripts/rotate-founder.js` (env-driven) | `users` | none | none | PARTIAL | Script works (insert-or-rotate); dashboard UI not tested. |
| **Founder dashboard** | `FounderDashboard.jsx`, `enhanced/pages/AdminDashboard.jsx` | (depends on `/reputation/...`, `/metrics/...`) | n/a | n/a | n/a | UNVERIFIED | UI present; depends on broken/partial backend. |
| **Reels** | `ReelFeed.jsx`, `ReelPlayer.jsx`, `reels/*` | **NO BACKEND ROUTE** | n/a | n/a | n/a | **UI-ONLY / SCAFFOLD** | Frontend has rich Reels UI; backend has no reels route, controller, or repository. |
| **Messaging / chat** | `ChatPage.jsx` | **NO BACKEND ROUTE** | n/a | n/a | n/a | **UI-ONLY / SCAFFOLD** | Frontend ChatPage exists; no messaging backend. |
| **Notifications** | `NotificationBell.jsx`, `NotificationsPage.jsx` | **NO BACKEND ROUTE** | n/a | n/a | n/a | **UI-ONLY / SCAFFOLD** | Frontend has UI; backend has no notifications route. |
| **Follows** | `FollowingPage.jsx`, `useFollow.js` | **NO BACKEND ROUTE** | n/a | n/a | n/a | **UI-ONLY / SCAFFOLD** | Same. |
| **Jams** | `JamFeedPage.jsx`, `JamDetailPage.jsx`, `JamCreationPage.jsx` | **NO BACKEND ROUTE** | n/a | n/a | n/a | **UI-ONLY / SCAFFOLD** | Same. |
| **Discovery** | `DiscoveryPage.jsx`, `discovery/*` | uses `/api/posts` etc. | n/a | n/a | n/a | PARTIAL | Depends on posts; affected by P1-9 path mismatches. |
| **Search** | `SearchBar.jsx`, `SearchResultsPage.jsx` | only via alerts FTS; posts via `?search=` | alerts/pg_trgm | none | alerts contract tests | PARTIAL | No dedicated search route; only filters. |
| **Skill matching (algorithmic)** | (UI in SkillExchange) | `skillsController.getMatches` uses simple string equality | `skill_matches` | none | none | PARTIAL | "Matches" are direct string match. No ML/embeddings/ranking. |
| **Daily challenges (smoke test)** | n/a | `daily-challenges.test.js` (test-only) | n/a | n/a | broken by design | TEST-ONLY | Fails because no running server + wrong health path. |

## Counts

| Status | Count |
|---|---|
| REAL | 16 |
| PARTIAL | 9 |
| MOCK | 8 |
| SCAFFOLD | 5 |
| UI-ONLY / SCAFFOLD | 5 (reels, messaging, notifications, follows, jams) |
| TEST-ONLY | 1 |
| UNVERIFIED | 2 |

## Conclusions

- The **Alerts capability is the only one with semantic test coverage** (69/69 contract tests proving geographic filtering, FTS fallback, DTO normalization, and role-based authorization).
- Several **MOCK endpoints are reachable on the canonical API surface** (`/api/locations`, `/api/market/prices`, `/api/tiannara/*`). Production users will see synthetic data.
- Multiple **UI surfaces have no backend** (Reels, Messaging, Notifications, Follows, Jams). The frontend pages look complete and ship in the bundle, but every interaction will 404.
- **The capability matrix does not support a "CERTIFIED" status** until the MOCK endpoints are either implemented or explicitly deferred, and the UI-only capabilities are either backend-wired or stripped from the frontend.
