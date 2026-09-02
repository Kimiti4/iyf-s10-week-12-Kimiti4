# J-024 Baseline

**Captured:** 2026-09-02
**SHA:** 79d6ee9
**Branch:** main
**Working tree:** clean (0 uncommitted changes)

---

## 1. Commit Identity

| Field | Value |
|---|---|
| SHA | `79d6ee9` |
| Date | 2026-09-02 12:20:31 +0300 |
| Subject | fix(J-023): close all open items — dead code cleanup + Card primitive |
| Branch | main |
| Working tree | clean |

## 2. Runtime & Tooling

| Item | Value |
|---|---|
| Node | v24.11.1 |
| npm | 11.12.1 |
| Package manager | npm |
| Lockfile | package-lock.json |
| Framework | React 18.2 + Vite 7.0 |
| Router | react-router-dom 6.20 |

### Test Tooling Present

| Tool | Version | Status |
|---|---|---|
| @playwright/test | ^1.55.0 | ✅ Installed |
| @axe-core/playwright | ^4.11.0 | ✅ Installed |
| @lhci/cli | ^0.15.1 | ✅ Installed (Lighthouse) |
| vitest | — | ❌ Not installed |
| jest | — | ❌ Not installed |

### Playwright Config

| Setting | Value |
|---|---|
| Config file | `playwright.config.js` |
| Test dir | `./e2e` |
| Base URL | `http://localhost:5174` |
| Web server | `npm run build && npm run preview -- --port 5174` |
| Projects | chromium (Desktop Chrome) |
| Parallel | fullyParallel: true |
| Retries | 2 (CI), 0 (local) |
| Timeout | 120000ms |
| Trace | on-first-retry |
| Video | on-first-retry |

### Existing Test Files

| File | Tests | Coverage |
|---|---|---|
| `e2e/jamii-critical.spec.js` | 3 | Feed nav, auth pages render, drafts empty state |
| `e2e/a11y.spec.js` | 3 | Feed a11y, drafts a11y, login a11y |

**Total existing tests: 6**

## 3. Application Surface

| Metric | Count |
|---|---|
| Pages | 41 |
| Components | 91 |
| Canonical primitives | 6 |
| CSS files | ~60 |
| Custom hooks | 20 |
| Routes | 33 |

## 4. Quality Gates at Entry

| Gate | Status |
|---|---|
| Lint | ✅ 0 errors |
| Build | ✅ 695 modules, clean |
| Existing E2E | 6 tests (3 critical + 3 a11y) |

## 5. Prior Certification State

| Mission | Status | Key Outcome |
|---|---|---|
| J-020 | CLOSED | Performance foundation |
| J-021 | CLOSED | 8/8 journeys PASS, 44/44 nav PASS |
| J-022 | CLOSED | Design-system convergence |
| J-023 | CLOSED | 91 components, -4,398 lines, 6 primitives |

## 6. J-021 Certified Journeys (Recovered)

| ID | Journey | Steps | Route |
|---|---|---|---|
| JN-01 | New User Register → Feed → Discover → Profile → Alerts | 5 | /register → / → /discover → /profile/:id → /alerts |
| JN-02 | Content Creator Login → Create → Publish → Analytics | 5 | /login → CreateMenu → PostComposer → /creator/studio |
| JN-03 | Jam User Login → Discover Jam → Join → Contribute → Activity | 6 | /login → /jams → /jams/:id → JoinJamModal → ContributionComposer |
| JN-04 | Social Propagation Create → Share → Repost → Remix | 5 | PostComposer → ShareSheet → RepostButton → RemixButton → UnifiedFeed |
| JN-05 | Alert Receive → Open → Acknowledge | 4 | NotificationBell → /alerts → AlertCard → confirm |
| JN-06 | Mobile Feed → Jam → Reel → Create → Alerts → Profile | 6 | / → /jams → /reels → /create/jam → /alerts → /profile |
| JN-07 | Safety Content → Report/Block → Feedback | 4 | ReportSheet → UserSafetyMenu → ModerationReportButton → FeedbackForm |
| JN-08 | Privileged Access Normal → Admin (Reject) / Admin → Admin (Allow) | 4 | /admin (redirect) → /admin (admin) → /admin/founder (founder) |

## 7. Application Start Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Serve production build |
| `npx playwright test` | Run E2E tests |

## 8. Baseline Verdict

**GATE A: PASS**

- SHA verified: 79d6ee9 ✅
- Working tree clean ✅
- Playwright installed ✅
- Existing tests present (6) ✅
- Lint clean ✅
- Build clean ✅
- 8 J-021 journeys recovered ✅
