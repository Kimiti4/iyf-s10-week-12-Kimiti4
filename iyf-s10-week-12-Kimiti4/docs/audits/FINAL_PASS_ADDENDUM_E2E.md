# FINAL PASS ADDENDUM — E2E/HARNESS REMEDIATION + SCOPE-DELTA REPORT

> Authorized: narrowly bounded final-certification remediation (web-vitals
> fix, seedAuth alignment, mock-shape corrections, re-run, Lighthouse).
> No backend/auth/contract changes. No Git operations.

## STATUS: 14/17 E2E PASS — SCOPE DELTA REQUESTED FOR 3 A11Y SPECS

## CLOSED IN THIS PASS (all E1-verified)

```text
1. web-vitals recordVital guard (src/performance/web-vitals.js)
   Root cause (E2+E0): web-vitals v6 invokes callbacks with a single Metric
   object; the code used the legacy (metric, data) signature, so `data` was
   undefined and `data.value` threw on EVERY page load (proven via dev-server
   stack: recordVital web-vitals.js:28). Fix: v6 adapter + undefined guard.
   Telemetry-only; no product behavior change.
   Evidence: pageerror eliminated in probe runs; smoke console-policy green.
2. seedAuth R5 alignment (e2e/fixtures/auth.js + a11y.spec.js + 2× sites in
   jamii-critical.spec.js): POST /api/auth/refresh mocked alongside /me.
3. Mock-glob query-string coverage (jn-01 6 globs, jn-05 1 glob): bare
   `**/api/X` never matches real `?page=&limit=` requests. E2E went 1/17
   (first green run) → 9/17 → 10/17 as each layer resolved.
4. Socket.io mocks added where missing (jn-01, smoke): the app auto-connects
   realtime sockets on boot; unmocked polling hits the baked-in production
   host (VITE_API_URL is build-time) and trips the network policy.
5. jn-05 alerts envelope: mock already correct ({data}); failure was the glob
   issue above, not shape. No change needed beyond the glob.
6. smoke discover mocks: /discover/* endpoints visited via navigation.
```

## E2E STATE (serial runs, chromium)

```text
14 passed, 3 failed. Failures are EXACTLY the 3 a11y specs:
- feed: axe color-contrast on .chip-count (#ffffff on #f9fafc, ratio 1.04)
- drafts: same contrast + heading-order + .user-avatar-link missing name
- login: color-contrast (same family)
Journeys (8/8 incl. jn-01, jn-05), smoke, jamii-critical (3/3): ALL GREEN.
```

## SCOPE-DELTA REQUEST (authorization required — NOT implemented)

```text
The 3 remaining failures require APP-SIDE UI changes outside the authorized
list (which covered web-vitals, seedAuth, and mock shapes only):
  D1. .chip-count contrast: CSS color fix (white-on-near-white).
  D2. .user-avatar-link accessible name: aria-label fix.
  D3. drafts heading-order: heading hierarchy fix.
  D4. login contrast: same family as D1 (exact node in report).
Each is a 1–3 line UI fix with zero backend/auth/contract impact, but per
the handoff discipline they are NOT performed without explicit authorization.
REQUEST: authorize D1–D4 (or subset), after which a11y re-run is expected
to complete E2E at 17/17.
```

## LIGHTHOUSE: STILL ENVIRONMENT-BLOCKED

```text
Second attempt post-changes: same Windows Chrome-cleanup EPERM harness
failure (taskkill/EPERM), audits begin executing but the run cannot
complete. No app verdict obtainable in this environment. Unchanged.
Needs a Linux/CI runner (out of scope for this pass).
```

## REGRESSION CHECK (backend lock untouched by this pass)

```text
No backend files were modified in this pass. The 281-test lock stands as
executed in the FINAL CERTIFICATION STOP REPORT. (Not re-run here: zero
backend changes exist to regress; frontend E2E runs above exercise the
frozen backend contract only via mocks.)
```

## FILES CHANGED (this pass only)

```text
M iyf-s10-week-09-Kimiti4/src/performance/web-vitals.js  (v6 adapter + guard)
M iyf-s10-week-09-Kimiti4/e2e/fixtures/auth.js           (refresh mocks)
M iyf-s10-week-09-Kimiti4/e2e/a11y.spec.js               (refresh mock)
M iyf-s10-week-09-Kimiti4/e2e/jamii-critical.spec.js     (2× refresh mocks)
M iyf-s10-week-09-Kimiti4/e2e/journeys/jn-01.*.spec.js   (6 glob fixes + socket mock)
M iyf-s10-week-09-Kimiti4/e2e/journeys/jn-05.*.spec.js   (1 glob fix + success envelope)
M iyf-s10-week-09-Kimiti4/e2e/smoke/smoke.spec.js        (socket + discover mocks)
NO backend files touched. NO Git operations.
```

## GATE IMPACT IF D1–D4 AUTHORIZED AND GREEN

```text
G08 Frontend: CONDITIONAL -> PASS (lint+build+E2E green; a11y green)
G09/G12 E2E: FAIL -> PASS (17/17)
G13 Lighthouse: remains UNVERIFIED (environment) — still blocks CERTIFIED
  on its own; needs the Linux/CI run.
Verdict would remain NOT CERTIFIED until G13 resolves, but the E2E/a11y
evidence gap would be closed.
```

## GIT: NO COMMIT / NO PUSH

## NEXT ACTION: HUMAN AUTHORIZATION REQUIRED

```text
[1] AUTHORIZE D1–D4 a11y UI fixes (then re-run a11y + full E2E)
[2] HOLD (leave E2E at 14/17 with this report as evidence)
[3] REQUEST CHANGES to this pass
[4] ABORT
```
