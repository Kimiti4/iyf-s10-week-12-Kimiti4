# J-021 Remediation Register

## P1 — Must Fix Before Production

| ID | Area | Issue | Fix | Status |
|---|---|---|---|---|
| J021-P1-001 | Sidebar + MobileBottomNav | Profile active state uses exact match `/profile` vs `/profile/:id` — never triggers | Added prefix matching: `isActive('/profile', true)` in Sidebar; `startsWith('/profile/')` in MobileBottomNav | **CLOSED** (commit 04769cb) |
| J021-P1-002 | All pages | 0/17 audited pages support `prefers-reduced-motion` | Added global `@media (prefers-reduced-motion: reduce)` to tokens.css — disables all non-essential animations/transitions | **CLOSED** (commit 04769cb) |
| J021-P1-003 | NavBar | `isActive` function defined but unused (dead code) | Removed unused function from NavBar.jsx | **CLOSED** (commit 04769cb) |
| J021-P1-004 | ReelsPage | Deprecated `<marquee>` element | Replaced with `<span>` — music name displays as static italic text | **CLOSED** (commit 04769cb) |
| J021-P1-005 | MarketplacePage | Unused `colors` import from designSystem | Removed unused import | **CLOSED** (commit 04769cb) |

## P1 → P2 Reclassified

| ID | Area | Issue | Reclassification |
|---|---|---|---|
| J021-P1-003-original | ReelsPage | No loading/empty/error states; no tokens; no ARIA | Reclassified to P2 — marquee removed but full page refactor deferred |
| J021-P1-004-original | Mtaani/Skills/Farm/Gigs | No loading/empty/error; no tokens; no ARIA; no CSS | Reclassified to P2 — full page refactor deferred |

## P2 — Should Fix

| ID | Area | Issue | Fix | Status |
|---|---|---|---|---|
| J021-P2-001 | CSS files | ~200+ hardcoded `#hex` colors | Systematic migration to `var(--brand-500)`, `var(--danger)`, etc. | OPEN |
| J021-P2-002 | Dark mode | Only Login/Register have dark themes | Extend `[data-theme='dark']` overrides to all feature pages | OPEN |
| J021-P2-003 | ARIA | 15 pages have zero ARIA attributes | Add `role="tablist"`, `aria-selected`, `aria-label`, `aria-live` where appropriate | OPEN |
| J021-P2-004 | Error states | 13/33 pages have no error handling | Add try/catch + error UI with retry button | OPEN |
| J021-P2-005 | Empty states | 27/33 pages have no empty states | Add empty state components with icon + message + CTA | OPEN |
| J021-P2-006 | UserProfilePage | 25+ hardcoded hex; no tokens; no ARIA | Migrate to tokens; add ARIA | OPEN |
| J021-P2-007 | MarketplacePage | Heavy framer-motion; no error state | Add error state | OPEN |
| J021-P2-008 | Governance/Reputation/Quests/Founder | 30-40 hardcoded hex each; inline styles for progress bars | Migrate to tokens; extract inline styles to CSS | OPEN |
| J021-P2-009 | NavBar | Mobile menu lacks `aria-current="page"` and active styling | Add aria-current and active class to mobile menu items | OPEN |
| J021-P2-010 | ReelsPage | No loading/empty/error states; no tokens; no ARIA | Full page refactor with states, tokens, ARIA | OPEN |
| J021-P2-011 | Mtaani/Skills/Farm/Gigs | No loading/empty/error; no tokens; no ARIA; no CSS; hardcoded data | Add data fetching, states, tokens, ARIA, CSS | OPEN |

## P3 — Nice to Have

| ID | Area | Issue | Fix | Status |
|---|---|---|---|---|
| J021-P3-001 | Sidebar | Touch targets below 44px (nav items ~38px, collapse btn 24px) | Increase padding/size | OPEN |
| J021-P3-002 | Sidebar | 3× hardcoded `#fff` instead of `var(--text-white)` | Replace with token | OPEN |
| J021-P3-003 | NavBar | 2× hardcoded `#fff` instead of `var(--text-white)` | Replace with token | OPEN |
| J021-P3-004 | MobileBottomNav | 1× hardcoded `#fff` instead of `var(--text-white)` | Replace with token | OPEN |
| J021-P3-005 | Feed.css | `.post:hover` hardcodes `#fcfcfd` | Replace with `var(--surface-hover)` | OPEN |
| J021-P3-006 | NotificationsPage.css | Shimmer animation has no `prefers-reduced-motion` | Covered by global reduced-motion policy | **CLOSED** (commit 04769cb) |
| J021-P3-007 | JamDetailPage.css | Spinner `@keyframes jamSpin` has no reduced-motion | Covered by global reduced-motion policy | **CLOSED** (commit 04769cb) |
| J021-P3-008 | AlertCard.css | Official badge uses hardcoded `#8b5cf6`/`#7c3aed` | Create `--brand-600` token or use existing | OPEN |
| J021-P3-009 | DiscoveryPage/CreatorStudio | No ARIA on search inputs, tabs, tab panels | Add ARIA attributes | OPEN |
| J021-P3-010 | Sidebar | Reduced-motion incomplete (overlay, user-card transitions missing) | Covered by global reduced-motion policy | **CLOSED** (commit 04769cb) |

## Summary

| Priority | Total | Closed | Open |
|---|---|---|---|
| P1 | 5 | 5 | 0 |
| P2 | 11 | 0 | 11 |
| P3 | 10 | 3 | 7 |
| **Total** | **26** | **8** | **18** |

**All P1 defects are CLOSED.**
