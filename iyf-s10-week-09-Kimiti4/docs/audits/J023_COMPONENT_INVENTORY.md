# J-023 Component Inventory

**Captured:** 2026-09-02
**Commit:** 636a7ef
**Total components:** 111

---

## Summary

| Category | Count | % |
|---|---|---|
| DOMAIN_COMPONENT | 52 | 46.8% |
| PRODUCT_PATTERN | 17 | 15.3% |
| PRIMITIVE | 16 | 14.4% |
| UTILITY | 8 | 7.2% |
| NAVIGATION | 6 | 5.4% |
| LAYOUT | 4 | 3.6% |
| **Total** | **111** | |

## Import Distribution

| Import Count | Components |
|---|---|
| 10+ | AvatarIcon (13), Toast (11) |
| 3-9 | PostCard (4), AnalyticsCard (3), JamCard (3) |
| 1-2 | Sidebar, JamStatusBadge, ShareSheet, ReportSheet, VerificationBadge |
| 0 (dead code candidates) | ~50 components |

---

## Full Inventory

### PRIMITIVE (16)

| # | Component | Path | Description | Imports | Styling | framer-motion | ARIA |
|---|---|---|---|---|---|---|---|
| 1 | AvatarIcon | components/AvatarIcon.jsx | Emoji avatar with deterministic hash | 13 | CSS | No | No |
| 2 | LazyImage | components/LazyImage.jsx | Lazy-loaded image with IntersectionObserver | 0 | Inline | No | No |
| 3 | SearchBar | components/SearchBar.jsx | Search input navigating to results | 0 | None | No | Yes |
| 4 | PullToRefreshIndicator | components/PullToRefresh.jsx | Pull-to-refresh visual feedback | 0 | CSS | Yes | No |
| 5 | NotificationBell | components/notifications/NotificationBell.jsx | Bell icon with unread count | 0 | None | No | Yes |
| 6 | CommentComposer | components/posts/CommentComposer.jsx | Comment input form | 0 | None | No | Yes |
| 7 | PostMedia | components/posts/PostMedia.jsx | Lazy image with skeleton | 0 | None | No | No |
| 8 | ReelControls | components/reels/ReelControls.jsx | Play/pause, mute controls | 0 | None | No | Yes |
| 9 | ReelPlayer | components/reels/ReelPlayer.jsx | Video player with states | 0 | None | No | No |
| 10 | ReelProgress | components/reels/ReelProgress.jsx | Progress bar with time | 0 | None | No | Yes |
| 11 | JamStatusBadge | components/jam/JamStatusBadge.jsx | Jam status badge | 0 | None | No | No |
| 12 | VerificationBadge | components/VerificationBadge.jsx | Tiered verification badge | 1 | CSS | No | No |
| 13 | ModerationBadge | components/trust/ModerationBadge.jsx | Content moderation status badge | 0 | None | No | Yes |
| 14 | MiniChart | components/analytics/MiniChart.jsx | SVG sparkline chart | 0 | CSS | No | No |
| 15 | CategoryGrid | components/discovery/CategoryGrid.jsx | Category button grid | 0 | None | No | No |
| 16 | DiscoverySearchBar | components/discovery/DiscoverySearchBar.jsx | Discovery search input | 0 | None | No | Yes |

### PRODUCT_PATTERN (17)

| # | Component | Path | Description | Imports | Styling | framer-motion | ARIA |
|---|---|---|---|---|---|---|---|
| 1 | AnalyticsCard | components/analytics/AnalyticsCard.jsx | Metric card with label, value, trend | 3 | CSS | Yes | No |
| 2 | ContentCalendar | components/creator/ContentCalendar.jsx | Monthly content calendar | 0 | None | No | Yes |
| 3 | DraftsList | components/creator/DraftsList.jsx | Drafts with edit/delete | 0 | None | No | Yes |
| 4 | MetricCard | components/creator/MetricCard.jsx | Single metric card | 1 | None | No | No |
| 5 | MetricsBar | components/creator/MetricsBar.jsx | Horizontal metric bar | 0 | None | No | No |
| 6 | TopContentList | components/creator/TopContentList.jsx | Top content ranked list | 0 | None | No | No |
| 7 | DistributionMenu | components/distribution/DistributionMenu.jsx | Share/repost/remix menu | 0 | None | No | Yes |
| 8 | ShareSheet | components/distribution/ShareSheet.jsx | Share sheet overlay | 2 | None | No | Yes |
| 9 | FeedEmptyState | components/feed/FeedEmptyState.jsx | Feed empty state | 0 | None | No | Yes |
| 10 | FeedErrorState | components/feed/FeedErrorState.jsx | Feed error with retry | 0 | None | No | Yes |
| 11 | FeedItem | components/feed/FeedItem.jsx | Renders correct card by type | 0 | None | No | No |
| 12 | FeedSkeleton | components/feed/FeedSkeleton.jsx | Feed loading skeleton | 0 | None | No | No |
| 13 | NotificationEmptyState | components/notifications/NotificationEmptyState.jsx | Notifications empty state | 0 | None | No | Yes |
| 14 | NotificationSkeleton | components/notifications/NotificationSkeleton.jsx | Notification loading skeleton | 0 | None | No | No |
| 15 | PostEngagement | components/posts/PostEngagement.jsx | Like/comment/repost counts | 0 | None | No | No |
| 16 | ShareReelSheet | components/reels/ShareReelSheet.jsx | Reel share sheet | 0 | None | No | Yes |
| 17 | ContentStatusNotice | components/trust/ContentStatusNotice.jsx | Moderation status notice | 0 | None | No | Yes |

### DOMAIN_COMPONENT (52)

| # | Component | Path | Description | Imports | Styling | framer-motion | ARIA |
|---|---|---|---|---|---|---|---|
| 1 | AchievementBadge | components/AchievementBadge.jsx | User achievement badges | 0 | CSS | Yes | No |
| 2 | AlertCard | components/AlertCard.jsx | Community alert card | 0 | CSS | No | Yes |
| 3 | CommunityEvents | components/CommunityEvents.jsx | Events with RSVP | 0 | CSS | Yes | No |
| 4 | CreateAlertForm | components/CreateAlertForm.jsx | Alert creation form | 0 | CSS | Yes | No |
| 5 | EmergencyAlerts | components/EmergencyAlerts.jsx | Emergency notifications | 0 | CSS | Yes | No |
| 6 | EnhancedEmergencyAlerts | components/EnhancedEmergencyAlerts.jsx | Enhanced emergency alerts | 0 | CSS | Yes | Yes |
| 7 | FeedbackForm | components/FeedbackForm.jsx | User feedback form | 0 | Inline | Yes | No |
| 8 | ImpactMeterWidget | components/ImpactMeterWidget.jsx | Community impact points | 0 | CSS | Yes | No |
| 9 | MoodIndicator | components/MoodIndicator.jsx | User mood indicator | 0 | CSS | Yes | No |
| 10 | PollCard | components/PollCard.jsx | Interactive poll | 0 | CSS | Yes | No |
| 11 | ProductCard | components/ProductCard.jsx | Marketplace product | 0 | CSS | Yes | No |
| 12 | ReactionBar | components/ReactionBar.jsx | Facebook-style reactions | 0 | CSS | Yes | No |
| 13 | SkillMatchCard | components/SkillMatchCard.jsx | Skill exchange match | 0 | CSS | Yes | No |
| 14 | StoreCard | components/StoreCard.jsx | Verified store display | 0 | CSS | Yes | No |
| 15 | TiannaraAssistant | components/TiannaraAssistant.jsx | AI assistant | 0 | CSS | Yes | No |
| 16 | TrendingHashtags | components/TrendingHashtags.jsx | Trending hashtags widget | 0 | CSS | Yes | No |
| 17 | TrendingChip | components/TrendingChip.jsx | Draggable trending chip | 0 | CSS | No | Yes |
| 18 | CreatorStats | components/analytics/CreatorStats.jsx | Creator analytics | 0 | CSS | No | No |
| 19 | ParticipationStats | components/analytics/ParticipationStats.jsx | Jam participation analytics | 0 | CSS | No | No |
| 20 | PropagationStats | components/analytics/PropagationStats.jsx | Content propagation analytics | 0 | CSS | No | No |
| 21 | SuggestedUsers | components/discovery/SuggestedUsers.jsx | Suggested users list | 0 | None | No | No |
| 22 | TrendingSection | components/discovery/TrendingSection.jsx | Trending content section | 0 | None | No | No |
| 23 | RemixAttribution | components/distribution/RemixAttribution.jsx | Remix attribution | 0 | None | No | Yes |
| 24 | RemixButton | components/distribution/RemixButton.jsx | Remix button | 0 | None | No | Yes |
| 25 | RepostButton | components/distribution/RepostButton.jsx | Repost button | 0 | None | No | Yes |
| 26 | ReelPreview | components/feed/ReelPreview.jsx | Compact reel preview | 0 | None | No | Yes |
| 27 | UnifiedFeed | components/feed/UnifiedFeed.jsx | Main feed container | 0 | None | No | No |
| 28 | ContributionCard | components/jam/ContributionCard.jsx | Jam contribution card | 0 | None | No | Yes |
| 29 | ContributionComposer | components/jam/ContributionComposer.jsx | Contribution form | 0 | None | No | Yes |
| 30 | JamCard | components/jam/JamCard.jsx | Jam info card | 0 | None | No | Yes |
| 31 | JamConfigForm | components/jam/JamConfigForm.jsx | Jam config form | 0 | None | No | Yes |
| 32 | JamCreationWizard | components/jam/JamCreationWizard.jsx | Multi-step jam creation | 0 | None | No | Yes |
| 33 | JamLeaderboard | components/jam/JamLeaderboard.jsx | Jam leaderboard | 0 | None | No | Yes |
| 34 | JamParticipantsPanel | components/jam/JamParticipantsPanel.jsx | Jam participants | 0 | None | No | Yes |
| 35 | JamPreview | components/jam/JamPreview.jsx | Jam preview | 0 | None | No | No |
| 36 | JamPublish | components/jam/JamPublish.jsx | Jam publish step | 0 | None | No | No |
| 37 | JoinJamModal | components/jam/JoinJamModal.jsx | Jam join confirmation modal | 0 | None | No | Yes |
| 38 | FeedJamBanner | components/jam-signature/FeedJamBanner.jsx | Active jams banner | 0 | None | No | No |
| 39 | JamCTA | components/jam-signature/JamCTA.jsx | Jam call-to-action | 0 | None | No | No |
| 40 | JamInlineCard | components/jam-signature/JamInlineCard.jsx | Inline jam card | 0 | None | No | No |
| 41 | PostJamConnector | components/jam-signature/PostJamConnector.jsx | Post-to-jam connector | 0 | None | No | No |
| 42 | ReelJamOverlay | components/jam-signature/ReelJamOverlay.jsx | Reel jam overlay | 0 | None | No | No |
| 43 | NotificationGroup | components/notifications/NotificationGroup.jsx | Grouped notification | 0 | None | No | Yes |
| 44 | NotificationItem | components/notifications/NotificationItem.jsx | Single notification | 0 | None | No | Yes |
| 45 | CommentList | components/posts/CommentList.jsx | Comment list with actions | 0 | None | No | Yes |
| 46 | PostActions | components/posts/PostActions.jsx | Post action buttons | 0 | None | No | Yes |
| 47 | PostAuthor | components/posts/PostAuthor.jsx | Post author display | 0 | None | No | Yes |
| 48 | PostCard | components/posts/PostCard.jsx | Main post card | 4 | None | No | No |
| 49 | PostComposer | components/posts/PostComposer.jsx | Post creation form | 0 | None | No | Yes |
| 50 | ReelActions | components/reels/ReelActions.jsx | Reel action buttons | 0 | None | No | Yes |
| 51 | ReelCaption | components/reels/ReelCaption.jsx | Reel caption | 0 | None | No | Yes |
| 52 | ReelCard | components/reels/ReelCard.jsx | Full reel card | 0 | None | No | No |
| 53 | ReelFeed | components/reels/ReelFeed.jsx | Reel infinite scroll | 0 | None | No | No |
| 54 | ReelJamCTA | components/reels/ReelJamCTA.jsx | Reel jam CTA | 0 | None | No | Yes |
| 55 | ReelRecommendations | components/reels/ReelRecommendations.jsx | Related jams for reel | 0 | None | No | No |
| 56 | BlockedMutedList | components/trust/BlockedMutedList.jsx | Blocked/muted users list | 0 | None | No | Yes |
| 57 | ModerationQueueItem | components/trust/ModerationQueueItem.jsx | Moderation report item | 0 | None | No | Yes |
| 58 | ModerationReportButton | components/trust/ModerationReportButton.jsx | Report button | 0 | None | No | Yes |
| 59 | UserSafetyMenu | components/trust/UserSafetyMenu.jsx | Block/mute/restrict menu | 0 | None | No | Yes |
| 60 | EnhancedPostCard | enhanced/components/EnhancedPostCard.jsx | Enhanced post card | 0 | CSS | Yes | No |
| 61 | ReelsSection | enhanced/components/ReelsSection.jsx | Short-form video section | 0 | CSS | Yes | No |

### NAVIGATION (6)

| # | Component | Path | Description | Imports | Styling | framer-motion | ARIA |
|---|---|---|---|---|---|---|---|
| 1 | MobileBottomNav | components/MobileBottomNav.jsx | Mobile bottom nav (5 items) | 0 | None | No | Yes |
| 2 | NavBar | components/NavBar.jsx | Top navigation bar | 0 | CSS | No | Yes |
| 3 | OrganizationSelector | components/OrganizationSelector.jsx | Org switcher dropdown | 0 | CSS | No | Yes |
| 4 | Sidebar | components/Sidebar.jsx | Main sidebar navigation | 2 | CSS | No | Yes |
| 5 | CreateMenu | components/jam/CreateMenu.jsx | Content creation dropdown | 0 | CSS | No | Yes |
| 6 | FeedTabs | components/feed/FeedTabs.jsx | Feed tab bar | 0 | None | No | Yes |

### LAYOUT (4)

| # | Component | Path | Description | Imports | Styling | framer-motion | ARIA |
|---|---|---|---|---|---|---|---|
| 1 | ErrorBoundary | components/ErrorBoundary.jsx | Runtime error catcher | 1 | CSS | No | No |
| 2 | ProtectedRoute | components/ProtectedRoute.jsx | Auth redirect guard | 0 | None | No | No |
| 3 | Sidebar (layout) | components/Sidebar.jsx | (counted in NAVIGATION) | — | — | — | — |
| 4 | FeedSidebar | enhanced/components/FeedSidebar.jsx | Collapsible feed sidebar | 0 | CSS | Yes | No |

### UTILITY (8)

| # | Component | Path | Description | Imports | Styling | framer-motion | ARIA |
|---|---|---|---|---|---|---|---|
| 1 | DarkModeToggle | components/DarkModeToggle.jsx | Theme toggle | 0 | CSS | Yes | Yes |
| 2 | JamiiModeToggle | components/JamiiModeToggle.jsx | Focus/Community/Discovery mode | 0 | CSS | No | Yes |
| 3 | OfflineBadge | components/OfflineBadge.jsx | Pending offline drafts count | 0 | None | No | Yes |
| 4 | PWAInstallPrompt | components/PWAInstallPrompt.jsx | PWA install prompt | 0 | Inline | Yes | No |
| 5 | Toast | components/Toast.jsx | Toast notification system | 11 | CSS | Yes | Yes |
| 6 | IntersectionSentinel | components/feed/IntersectionSentinel.jsx | Infinite scroll trigger | 0 | Inline | No | Yes |
| 7 | ConstellationBackground | enhanced/components/ConstellationBackground.jsx | Animated starfield | 0 | CSS | No | Yes |
| 8 | ReportSheet | components/trust/ReportSheet.jsx | Report modal | 2 | None | No | Yes |

---

## Duplicate Pattern Candidates

| Pattern | Components | Similarity |
|---|---|---|
| **Card** | PostCard, EnhancedPostCard, JamCard, ProductCard, StoreCard, PollCard, SkillMatchCard, AlertCard, ContributionCard, JamInlineCard | High structural overlap |
| **Button** | RemixButton, RepostButton, ModerationReportButton | Similar action button pattern |
| **Badge** | JamStatusBadge, VerificationBadge, ModerationBadge, AchievementBadge | Status display pattern |
| **Empty State** | FeedEmptyState, NotificationEmptyState, DraftsList (empty), TopContentList (empty) | Same UI contract |
| **Skeleton** | FeedSkeleton, NotificationSkeleton | Same UI contract |
| **Share Sheet** | ShareSheet, ShareReelSheet | Near-identical overlay |
| **Actions Bar** | PostActions, ReelActions | Similar action button layout |
| **Stats** | CreatorStats, ParticipationStats, PropagationStats | Similar data display |
| **Metric Card** | AnalyticsCard, MetricCard | Near-identical contract |
| **Feed Container** | UnifiedFeed, ReelFeed | Similar infinite scroll pattern |
