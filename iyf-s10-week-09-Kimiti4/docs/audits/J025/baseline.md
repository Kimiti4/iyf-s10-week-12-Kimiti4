# J-025 Performance Baseline

**Date:** 2026-09-22T23:40:15.676Z
**Baseline:** 3cfe995
**Routes Measured:** 9

## Budgets

| Metric | Good | Poor |
|---|---|---|
| LCP | 2500ms | 4000ms |
| FCP | 1800ms | 3000ms |
| TTFB | 800ms | 1800ms |
| CLS | 0.1 | 0.25 |

## Results

| Route | TTFB | FCP | LCP | CLS | Load | Verdict |
|---|---|---|---|---|---|---|
| / | 24ms | 1468ms | 1468ms | 0.001 | 31ms | PASS |
| /login | 5ms | 1344ms | 1980ms | 0.001 | 11ms | PASS |
| /register | 2ms | 508ms | 840ms | 0.001 | 134ms | PASS |
| /discover | 2ms | 520ms | 1496ms | 0.001 | 19ms | PASS |
| /alerts | 2ms | 516ms | 636ms | 0.001 | 7ms | PASS |
| /profile | 7ms | 528ms | 616ms | 0.001 | 10ms | PASS |
| /jams | 2ms | 548ms | 668ms | 0.003 | 279ms | PASS |
| /reels | 2ms | 572ms | 796ms | 0.001 | 26ms | PASS |
| /settings | 2ms | 528ms | 656ms | 0.002 | 8ms | PASS |

## Summary

- **PASS:** 9
- **WARN:** 0
- **FAIL:** 0
- **ERROR:** 0
