# J-023 Baseline Snapshot

**Captured:** 2026-09-02
**Commit:** 636a7ef
**Branch:** main
**Working tree:** clean (0 uncommitted changes)

---

## Repository

| Item | Value |
|---|---|
| Commit SHA | `636a7ef` |
| Branch | `main` |
| Package manager | npm |
| Framework | React 18.2 + Vite 7.0 |
| Router | react-router-dom 6.20 |
| Animation | framer-motion |
| PWA | vite-plugin-pwa 1.3.0 |

## Dependency Versions

| Package | Version |
|---|---|
| react | ^18.2.0 |
| react-dom | ^18.2.0 |
| react-router-dom | ^6.20.0 |
| vite | ^7.0.0 |
| framer-motion | ^10.0.0 |

## File Counts

| Category | Count |
|---|---|
| Pages | 41 |
| Components | 111 |
| CSS files | 66 |
| Custom hooks | 20 |
| Contexts | 3 |
| Services | 15 |
| **Total source files** | **~256** |

## Routes

| # | Route | Page Component |
|---|---|---|
| 1 | `/` | UnifiedFeed / EnhancedFeedPage |
| 2 | `/login` | EnhancedLoginPage |
| 3 | `/register` | EnhancedRegisterPage |
| 4 | `/reels` | ReelsPage |
| 5 | `/notifications` | NotificationsPage |
| 6 | `/creator/studio` | CreatorStudioPage |
| 7 | `/discover` | DiscoveryPage |
| 8 | `/mtaani` | MtaaniPage |
| 9 | `/skills` | SkillsPage |
| 10 | `/farm` | FarmPage |
| 11 | `/gigs` | GigsPage |
| 12 | `/org/:slug` | OrganizationPage |
| 13 | `/tiannara` | TiannaraAssistant |
| 14 | `/events` | CommunityEvents |
| 15 | `/alerts` | AlertFeedPage |
| 16 | `/emergency-alerts` | EnhancedEmergencyAlerts |
| 17 | `/profile/:userId?` | UserProfilePage / ProfilePage |
| 18 | `/chat` | ChatPage |
| 19 | `/drafts` | DraftsPage |
| 20 | `/create/jam` | JamCreationPage |
| 21 | `/jams` | JamFeedPage |
| 22 | `/jams/:id` | JamDetailPage |
| 23 | `/posts/:id` | PostDetailPage / PostPage |
| 24 | `/following` | FollowingPage |
| 25 | `/reels/:id` | ReelDetailPage |
| 26 | `/activity` | ActivityHistory |
| 27 | `/reputation` | ReputationSystem |
| 28 | `/governance` | CommunityGovernance |
| 29 | `/quests` | CollaborativeQuests |
| 30 | `/marketplace` | MarketplacePage |
| 31 | `/settings` | SettingsPage |
| 32 | `/admin` | AdminDashboard |
| 33 | `/admin/founder` | FounderDashboard |

**Total routes: 33**

## Quality Gates

| Gate | Status |
|---|---|
| Lint | ✅ 0 errors |
| Build | ✅ 695 modules, clean |
| PWA | ✅ 90 precache entries, 2419.98 KB |

## Bundle Sizes (Top 15)

| Chunk | Size | Gzip |
|---|---|---|
| html2pdf | 952.9 KB | — |
| react-vendor | 158.3 KB | — |
| framer-motion | 123.5 KB | — |
| index (app) | 109.2 KB | — |
| index.css | 48.7 KB | — |
| socket-io | 40.5 KB | — |
| sw.js | 23 KB | — |
| EnhancedRegisterPage | 17.5 KB | — |
| PostCard | 16.3 KB | — |
| jam.css | 15.7 KB | — |
| JamDetailPage | 15.3 KB | — |
| AlertFeedPage | 15.1 KB | — |
| CommunityEvents | 13.3 KB | — |
| AlertFeedPage.css | 12.9 KB | — |
| UnifiedFeed | 12.6 KB | — |

## User Journeys (J-021 Certified)

| # | Journey | Status |
|---|---|---|
| 1 | Register → Feed → Discover → Profile → Alerts | ✅ PASS |
| 2 | Login → Create → Publish → Analytics | ✅ PASS |
| 3 | Login → Discover Jam → Join → Contribute → Activity | ✅ PASS |
| 4 | Create → Share → Repost → Remix | ✅ PASS |
| 5 | Login → Trust & Safety → Moderation | ✅ PASS |
| 6 | Login → Marketplace → Store → Product | ✅ PASS |
| 7 | Login → Reputation → Skills → Skill Exchange | ✅ PASS |
| 8 | Founder → Dashboard → Governance → Settings | ✅ PASS |

**8/8 PASS**

## Previous Mission Certifications

| Mission | Verdict | P1 | P2 | P3 |
|---|---|---|---|---|
| J-020 | CLOSED | 0 | 0 | 0 |
| J-021 | CERTIFIED_WITH_WARNINGS | 0 | 11 | 7 |
| J-022 | CLOSED | 0 | ~10 | ~12 |

## CSS Token Adoption

| Metric | Value |
|---|---|
| Hardcoded hex remaining (CSS) | 857 |
| Hardcoded hex remaining (JSX) | 163 |
| CSS files with dark mode | 42 |
| CSS files without dark mode | 24 |

## ARIA Coverage

| Metric | Value |
|---|---|
| Pages with `role="main"` | 28 |
| Pages without `role="main"` | 13 |

## Component Directories

```
src/
├── components/           # Shared components
│   ├── jam/              # Jam-specific components
│   ├── posts/            # Post-specific components
│   ├── reels/            # Reel-specific components
│   ├── discovery/        # Discovery-specific components
│   ├── trust/            # Trust & safety components
│   ├── analytics/        # Analytics components
│   └── creator/          # Creator tools components
├── enhanced/
│   ├── components/       # Enhanced shared components
│   └── pages/            # Enhanced page components
├── pages/                # Standard page components
├── hooks/                # Custom React hooks
├── context/              # React context providers
├── services/             # API service modules
├── styles/               # Global styles + tokens
└── utils/                # Utility functions
```
