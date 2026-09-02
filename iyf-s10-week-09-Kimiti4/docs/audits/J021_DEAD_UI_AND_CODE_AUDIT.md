# J-021 Dead UI and Code Audit

## Unused Page Components

These files exist in `src/pages/` but have NO route in App.jsx:

| File | Status | Recommendation |
|---|---|---|
| `AboutPage.jsx` | Dead | Remove or add route |
| `CreatePostPage.jsx` | Dead | Superseded by CreateMenu |
| `HomePage.jsx` | Dead | Superseded by UnifiedFeed |
| `LoginPage.jsx` | Dead | Superseded by EnhancedLoginPage |
| `RegisterPage.jsx` | Dead | Superseded by EnhancedRegisterPage |
| `ProfilePage.jsx` | Dead | Superseded by UserProfilePage |
| `PostDetailPage.jsx` | Dead | Superseded by PostPage |
| `PostListPage.jsx` | Dead | No route |
| `ReputationProfilePage.jsx` | Dead | No route |
| `SearchResultsPage.jsx` | Dead | No route |
| `SkillExchange.jsx` | Dead | Superseded by SkillsPage |
| `EnhancedFeedPage.jsx` (enhanced) | Dead | Superseded by UnifiedFeed |

## Dead Code in NavBar

| Issue | Location | Status |
|---|---|---|
| `isActive` function defined but unused | NavBar.jsx line 17 | **REMOVED** (commit 04769cb) |

## Unused Imports

| File | Import | Status |
|---|---|---|
| MarketplacePage.jsx | `colors` from designSystem | **REMOVED** (commit 04769cb) |

## Hardcoded Data

| File | Issue |
|---|---|
| MtaaniPage.jsx | All data is hardcoded (no API calls) |
| SkillsPage.jsx | All data is hardcoded |
| FarmPage.jsx | All data is hardcoded |
| GigsPage.jsx | All data is hardcoded |

## Deprecated Elements

| File | Element | Status |
|---|---|---|
| ReelsPage.jsx line 291 | `<marquee>` | **REPLACED** with `<span>` (commit 04769cb) |

## Inline Styles That Should Be CSS

| File | Element | Style |
|---|---|---|
| CommunityGovernance.jsx | Vote bar | `style={{ width: ..., background: ... }}` |
| ReputationSystem.jsx | Progress fill | `style={{ background: ... }}` |
| CollaborativeQuests.jsx | Progress fill | `style={{ background: ... }}` |
| ReelsPage.jsx | Progress bar | `style={{ width: ..., transition: ... }}` |

## Console.log / Debug Code

| Status |
|---|
| ✅ None found — all logging uses structured `logger` utility |

## Summary

| Category | Total | Fixed | Remaining |
|---|---|---|---|
| Unused page components | 12 | 0 | 12 |
| Dead code | 1 | 1 | 0 |
| Unused imports | 1 | 1 | 0 |
| Hardcoded data pages | 4 | 0 | 4 |
| Deprecated elements | 1 | 1 | 0 |
| Inline styles | 4 | 0 | 4 |
| Console.log | 0 | 0 | 0 |
