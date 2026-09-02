# J-021 Route Inventory

| # | Route | Page Component | Auth | Nav Entry | Dynamic | Status |
|---|---|---|---|---|---|---|
| 1 | `/` | UnifiedFeed | No | Sidebar, MobileBottomNav, NavBar | No | CERTIFIED |
| 2 | `/login` | EnhancedLoginPage | No | NavBar | No | CERTIFIED |
| 3 | `/register` | EnhancedRegisterPage | No | NavBar | No | CERTIFIED |
| 4 | `/reels` | ReelsPage | No | Sidebar, NavBar mobile | No | QUALIFIED_PARTIAL |
| 5 | `/notifications` | NotificationsPage | No | Sidebar, NavBar mobile | No | CERTIFIED |
| 6 | `/creator/studio` | CreatorStudioPage | No | Sidebar, NavBar mobile | No | QUALIFIED_PARTIAL |
| 7 | `/discover` | DiscoveryPage | No | Sidebar, MobileBottomNav, NavBar mobile | No | QUALIFIED_PARTIAL |
| 8 | `/mtaani` | MtaaniPage | No | Sidebar | No | QUALIFIED_PARTIAL |
| 9 | `/skills` | SkillsPage | No | Sidebar | No | QUALIFIED_PARTIAL |
| 10 | `/farm` | FarmPage | No | Sidebar | No | QUALIFIED_PARTIAL |
| 11 | `/gigs` | GigsPage | No | Sidebar | No | QUALIFIED_PARTIAL |
| 12 | `/org/:slug` | OrganizationPage | No | (linked) | Yes | QUALIFIED_PARTIAL |
| 13 | `/tiannara` | TiannaraAssistant | No | (no nav entry) | No | QUALIFIED_PARTIAL |
| 14 | `/events` | CommunityEvents | No | Sidebar, NavBar mobile | No | QUALIFIED_PARTIAL |
| 15 | `/alerts` | AlertFeedPage | No | Sidebar, MobileBottomNav, NavBar mobile | No | CERTIFIED |
| 16 | `/emergency-alerts` | EnhancedEmergencyAlerts | No | (no nav entry) | No | QUALIFIED_PARTIAL |
| 17 | `/profile/:userId?` | UserProfilePage | No | Sidebar, MobileBottomNav, NavBar avatar | Yes | QUALIFIED_PARTIAL |
| 18 | `/chat` | ChatPage | Yes | Sidebar, NavBar mobile | No | QUALIFIED_PARTIAL |
| 19 | `/drafts` | DraftsPage | Yes | Sidebar | No | QUALIFIED_PARTIAL |
| 20 | `/create/jam` | JamCreationPage | Yes | MobileBottomNav, NavBar CreateMenu | No | QUALIFIED_PARTIAL |
| 21 | `/jams` | JamFeedPage | No | Sidebar, NavBar mobile | No | CERTIFIED |
| 22 | `/jams/:id` | JamDetailPage | No | (linked from cards) | Yes | QUALIFIED_PARTIAL |
| 23 | `/posts/:id` | PostPage | No | (linked from cards) | Yes | CERTIFIED |
| 24 | `/following` | FollowingPage | Yes | (no nav entry) | No | QUALIFIED_PARTIAL |
| 25 | `/reels/:id` | ReelDetailPage | No | (linked from reels) | Yes | QUALIFIED_PARTIAL |
| 26 | `/activity` | ActivityHistory | Yes | (no nav entry) | No | QUALIFIED_PARTIAL |
| 27 | `/reputation` | ReputationSystem | Yes | (no nav entry) | No | QUALIFIED_PARTIAL |
| 28 | `/governance` | CommunityGovernance | Yes | (no nav entry) | No | QUALIFIED_PARTIAL |
| 29 | `/quests` | CollaborativeQuests | Yes | (no nav entry) | No | QUALIFIED_PARTIAL |
| 30 | `/marketplace` | MarketplacePage | Yes | (no nav entry) | No | QUALIFIED_PARTIAL |
| 31 | `/settings` | SettingsPage | Yes | NavBar mobile | No | QUALIFIED_PARTIAL |
| 32 | `/admin` | AdminDashboard | Yes (admin) | Sidebar (admin only) | No | QUALIFIED_PARTIAL |
| 33 | `/admin/founder` | FounderDashboard | Yes (founder) | Sidebar (founder only) | No | QUALIFIED_PARTIAL |

## Summary

| Status | Count |
|---|---|
| CERTIFIED | 7 |
| QUALIFIED_PARTIAL | 26 |
| NOT_CERTIFIED | 0 |
| BLOCKED | 0 |
| **Total** | **33** |
