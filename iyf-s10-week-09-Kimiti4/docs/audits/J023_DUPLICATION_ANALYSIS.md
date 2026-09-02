# J-023 Duplication Analysis

**Captured:** 2026-09-02
**Commit:** 636a7ef
**Components analyzed:** 111

---

## Executive Summary

| Verdict | Count | Risk |
|---|---|---|
| **CONVERGE** | 7 migrations | LOW-MEDIUM |
| **PARTIAL CONVERGE** | 2 migrations | LOW |
| **KEEP_SEPARATE** | 6 components | — |

**Highest-value quick wins:**
1. Delete ShareReelSheet → use ShareSheet (90% identical)
2. Replace MetricCard → AnalyticsCard (superset)
3. Create StatusBadge primitive (JamStatusBadge + ModerationBadge)

---

## Analysis 1: Card Duplication

### Components Analyzed

| Card | Root | framer-motion | ARIA | Domain-specific |
|---|---|---|---|---|
| PostCard | `<article>` | No | `data-post-id` | Post deletion, moderation, jam connector |
| EnhancedPostCard | `<motion.article>` | Yes (entry, hover, scale) | None | Confetti, inline engagement, 7 useState |
| JamCard | `<article>` | No | `aria-label` | Deadline, participants, category |
| ProductCard | `<motion.div>` | Yes (whileHover) | None | Price, seller, rating |
| StoreCard | `<motion.div>` | Yes (whileHover + shadow) | None | Verification, metrics, badges |
| PollCard | `<div>` | Yes (enter, progress, hover) | None | Voting, optimistic update |
| SkillMatchCard | `<motion.div>` | Yes (whileHover, entry) | None | Match score, skills |
| AlertCard | `<article>` | No | `aria-label`, `aria-pressed` | Severity, verification, confirm/share |
| ContributionCard | `<article>` | No | `aria-label` | Vote up/down, status |
| JamInlineCard | `<Link>` | No | None | Minimal inline |

### Structural Patterns

**Pattern A — "Header → Content → Footer" with author/timestamp:**
PostCard, EnhancedPostCard, JamCard, ContributionCard, AlertCard

**Pattern B — "Media → Info → Footer" with price/stats:**
ProductCard, StoreCard

**Pattern C — "Specialized widget":**
PollCard (voting), SkillMatchCard (match), JamInlineCard (minimal)

### Verdicts

| Migration | Verdict | Risk | Notes |
|---|---|---|---|
| PostCard ↔ EnhancedPostCard | **CONVERGE** | MEDIUM | EnhancedPostCard is a superset. Decide which pattern wins. |
| JamCard, ContributionCard, AlertCard | **PARTIAL CONVERGE** | LOW | Share Card primitive with Header/Body/Footer slots |
| ProductCard, StoreCard | **KEEP_SEPARATE** | — | Marketplace domain, no author |
| PollCard | **KEEP_SEPARATE** | — | Interactive voting widget |
| SkillMatchCard | **KEEP_SEPARATE** | — | Match-specific UI |

### PostCard ↔ EnhancedPostCard Detail

| Aspect | PostCard | EnhancedPostCard |
|---|---|---|
| State management | Delegates to PostActions/PostEngagement | 7 useState (liked, downvoted, reblogged, bookmarked, likes, downvotes, reblogs) |
| Engagement UI | Separate PostEngagement component | Inline with animated counters |
| Actions | PostActions component | Inline action buttons |
| Animation | None | framer-motion entry, hover, button scale |
| Content moderation | ContentStatusNotice + ModerationBadge | None |
| Jam connector | PostJamConnector | None |

**Decision required:** EnhancedPostCard manages engagement inline (more cohesive but more complex). PostCard delegates to children (simpler but more components). The canonical PostCard should pick one pattern.

---

## Analysis 2: Empty/Skeleton/Error States

### Components Analyzed

| Component | Props | Customizable | CSS Class | ARIA |
|---|---|---|---|---|
| FeedEmptyState | `message, hint` | Yes | `feed-empty` | `role="status"` |
| NotificationEmptyState | None | No (hardcoded) | `notification-empty` | None |
| FeedSkeleton | None | No (3 cards) | `feed-skeleton` | None |
| NotificationSkeleton | None | No (5 items) | `notification-skeleton` | None |
| FeedErrorState | `error, onRetry` | Yes | `feed-error` | `role="alert"` |

### Verdict: **CONVERGE** (Risk: LOW)

**Canonical API:**

```jsx
// EmptyState — replaces FeedEmptyState + NotificationEmptyState
<EmptyState
  icon={<FaBell />}
  title="No notifications yet"
  hint="When someone interacts..."
  action={{ label: "Create post", onClick: handleCreate }}
/>

// Skeleton — replaces FeedSkeleton + NotificationSkeleton
<Skeleton count={3} variant="card" />      {/* feed */}
<Skeleton count={5} variant="list-item" /> {/* notifications */}

// ErrorState — replaces FeedErrorState
<ErrorState
  error="Something went wrong"
  onRetry={handleRetry}
/>
```

**Migration steps:**
1. Create `src/components/primitives/EmptyState.jsx`
2. Create `src/components/primitives/Skeleton.jsx`
3. Create `src/components/primitives/ErrorState.jsx`
4. Migrate FeedEmptyState consumers → EmptyState
5. Migrate NotificationEmptyState consumers → EmptyState
6. Migrate FeedSkeleton consumers → Skeleton
7. Migrate NotificationSkeleton consumers → Skeleton
8. Migrate FeedErrorState consumers → ErrorState
9. Delete old components

---

## Analysis 3: Action Bar

### Components Analyzed

| Component | Props | Buttons | State | ShareSheet |
|---|---|---|---|---|
| PostActions | `post, actions, currentUserId, contentStatus` | Like, Comment, Repost, Share, Save, Report | `shareOpen` | Yes (inline) |
| ReelActions | `reel, onLike, onUnlike, onSave, onUnsave, onShare, onRepost, onUndoRepost` | Like, Comment, Repost, Share, Save | None (callbacks) | Yes (inline) |
| PostEngagement | `post` | None (read-only) | None | None |

### Shared Pattern (PostActions ↔ ReelActions)

- Like toggle (filled/outline heart)
- Comment button
- Repost toggle
- Share button (opens ShareSheet)
- Save/bookmark toggle
- Same icon set (FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaShare, FaBookmark)

### Differences

| Aspect | PostActions | ReelActions |
|---|---|---|
| Handler passing | `actions` object | Flat props |
| Moderation | Includes ModerationReportButton | None |
| ShareSheet | Manages internally | Delegates `onShare` callback |

### Verdict

| Migration | Verdict | Risk |
|---|---|---|
| PostActions ↔ ReelActions | **CONVERGE** | LOW-MEDIUM |
| PostEngagement | **KEEP_SEPARATE** | — (read-only display) |

**Canonical API:**

```jsx
<ActionBar
  isLiked={item.isLiked}
  likeCount={item.likeCount}
  onLike={handleLike}
  onUnlike={handleUnlike}
  isReposted={item.isReposted}
  repostCount={item.repostCount}
  onRepost={handleRepost}
  onUndoRepost={handleUndoRepost}
  isSaved={item.isSaved}
  onToggleSave={handleSave}
  onShare={handleShare}
  onReport={handleReport}
  shareableItem={item}
  variant="post" | "reel"
/>
```

---

## Analysis 4: Share Sheet

### Components Analyzed

| Aspect | ShareSheet | ShareReelSheet |
|---|---|---|
| URL building | `buildShareUrl(item)` utility | Manual string concat |
| Native share | `canUseNativeShare()` util | Direct `navigator.share` |
| Copy link | Identical clipboard pattern | Identical clipboard pattern |
| Keyboard | Escape → onClose | Escape → onClose |
| ARIA | `role="dialog"`, `aria-label` | `role="dialog"`, `aria-label` |
| Icons | FaShare, FaLink, FaTimes, FaCheck | FaShare, FaLink, **FaBookmark**, FaTimes |
| `onRecordShare` | Supported | Missing |
| Focus trap | Auto-focus on open | None |

**These are ~90% identical.**

### Verdict: **CONVERGE** (Risk: LOW)

ShareReelSheet is a strict subset of ShareSheet. Delete ShareReelSheet, extend `buildShareUrl` to handle reel items, update 2-3 call sites.

**Migration:**
1. Add reel URL builder to `buildShareUrl` utility
2. Replace `<ShareReelSheet>` with `<ShareSheet item={{ type: 'reel', ...reel }}>`
3. Delete ShareReelSheet.jsx

---

## Analysis 5: Metric Cards

### Components Analyzed

| Aspect | AnalyticsCard | MetricCard |
|---|---|---|
| Props | `label, value, previousValue, icon, type, trend, className, compact` | `label, value, trend, metric` |
| Value formatting | `formatMetricValue(value, type)` | `toLocaleString()` |
| Trend calc | From `previousValue` or explicit | Parses string |
| Icon | Prop (any React node) | Hardcoded lookup by metric name |
| Color | CSS class | Hardcoded lookup |
| Animation | framer-motion entry | None |
| Compact mode | Yes | No |

**AnalyticsCard is a superset of MetricCard.**

### Verdict: **CONVERGE** (Risk: LOW)

Replace MetricCard with AnalyticsCard. MetricCard is only used in MetricsBar (2 files). Swap is mechanical.

---

## Analysis 6: Badges

### Components Analyzed

| Badge | Root | Props | Animation |
|---|---|---|---|
| JamStatusBadge | `<span>` | `status` | None |
| VerificationBadge | `<div>` | `verification, type, size, showLabel, showTooltip, className` | CSS glow |
| ModerationBadge | `<span>` | `status, size` | None |
| AchievementBadge | `<motion.div>` | `badge, size, showCelebration` | framer-motion + confetti |

### Verdicts

| Migration | Verdict | Risk |
|---|---|---|
| JamStatusBadge ↔ ModerationBadge | **CONVERGE** | LOW |
| VerificationBadge | **KEEP_SEPARATE** | — (gradient + glow + tooltip) |
| AchievementBadge | **KEEP_SEPARATE** | — (animation + confetti + earned state) |

**Canonical API for StatusBadge:**

```jsx
// Replaces JamStatusBadge + ModerationBadge
<StatusBadge label="Live" color="#10b981" bg="rgba(16,185,129,0.12)" dot />
<StatusBadge label="Under Review" color="#f59e0b" bg="rgba(245,158,11,0.12)" />
```

---

## Migration Priority Matrix

| Priority | Migration | Risk | Impact | Effort |
|---|---|---|---|---|
| **1** | Delete ShareReelSheet → ShareSheet | LOW | 1 file deleted, 2-3 call sites | 15 min |
| **2** | Replace MetricCard → AnalyticsCard | LOW | 2 files updated, 1 deleted | 15 min |
| **3** | Create StatusBadge primitive | LOW | 2 components unified | 30 min |
| **4** | Create EmptyState/Skeleton/ErrorState | LOW | 5 components → 3 primitives | 45 min |
| **5** | Create ActionBar primitive | LOW-MED | 2 components unified | 45 min |
| **6** | PostCard ↔ EnhancedPostCard decision | MEDIUM | 2 components → 1 | 2+ hours |
| **7** | Card primitive (Header/Body/Footer) | MEDIUM | 3-5 cards share structure | 2+ hours |

---

## Dead Code Candidates (0 imports)

| Component | Category | Recommendation |
|---|---|---|
| AchievementBadge | DOMAIN | Verify page-level import before deleting |
| AlertCard | DOMAIN | Verify page-level import |
| CommunityEvents | DOMAIN | Verify page-level import |
| CreateAlertForm | DOMAIN | Verify page-level import |
| EmergencyAlerts | DOMAIN | Verify page-level import |
| EnhancedEmergencyAlerts | DOMAIN | Verify page-level import |
| FeedbackForm | DOMAIN | Verify page-level import |
| ImpactMeterWidget | DOMAIN | Verify page-level import |
| JamiiModeToggle | UTILITY | Verify page-level import |
| LazyImage | PRIMITIVE | Verify page-level import |
| MoodIndicator | DOMAIN | Verify page-level import |
| OrganizationSelector | NAVIGATION | Verify page-level import |
| PollCard | DOMAIN | Verify page-level import |
| ProductCard | DOMAIN | Verify page-level import |
| PullToRefreshIndicator | PRIMITIVE | Verify page-level import |
| PWAInstallPrompt | UTILITY | Verify page-level import |
| ReactionBar | DOMAIN | Verify page-level import |
| SkillMatchCard | DOMAIN | Verify page-level import |
| StoreCard | DOMAIN | Verify page-level import |
| TiannaraAssistant | DOMAIN | Verify page-level import |
| TrendingChip | UTILITY | Verify page-level import |
| TrendingHashtags | DOMAIN | Verify page-level import |
| JamCTA | DOMAIN | Verify page-level import |
| JamLeaderboard | DOMAIN | Verify page-level import |
| JamParticipantsPanel | DOMAIN | Verify page-level import |
| RemixAttribution | DOMAIN | Verify page-level import |
| RemixButton | DOMAIN | Verify page-level import |
| RepostButton | DOMAIN | Verify page-level import |
| DistributionMenu | PRODUCT | Verify page-level import |
| SuggestedUsers | DOMAIN | Verify page-level import |
| TrendingSection | DOMAIN | Verify page-level import |
| CreatorStats | DOMAIN | Verify page-level import |
| ParticipationStats | DOMAIN | Verify page-level import |
| PropagationStats | DOMAIN | Verify page-level import |
| ContentCalendar | PRODUCT | Verify page-level import |
| TopContentList | PRODUCT | Verify page-level import |
| MetricsBar | PRODUCT | Verify page-level import |
| DraftsList | PRODUCT | Verify page-level import |
| ModerationQueueItem | DOMAIN | Verify page-level import |
| BlockedMutedList | DOMAIN | Verify page-level import |
| ReelsSection | DOMAIN | Verify page-level import |
| FeedSidebar | LAYOUT | Verify page-level import |
| EnhancedPostCard | DOMAIN | Verify page-level import |
| ConstellationBackground | UTILITY | Verify page-level import |

**Note:** "0 imports" from grep may be false positives if components are imported via dynamic routes, barrel exports, or lazy loading. Must verify before deletion.
