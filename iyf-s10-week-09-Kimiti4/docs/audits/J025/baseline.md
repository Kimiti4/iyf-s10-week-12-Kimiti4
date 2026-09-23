# J-025 Performance Baseline

**Date:** 2026-09-23T21:43:34.121Z
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
| / | 14ms | 2020ms | 2020ms | 0.001 | 31ms | WARN |
| /login | 18ms | 628ms | 1264ms | 0.001 | 10ms | PASS |
| /register | 2ms | 516ms | 640ms | 0.001 | 207ms | PASS |
| /discover | 2ms | 684ms | 1656ms | 0.001 | 5ms | PASS |
| /alerts | 2ms | 540ms | 620ms | 0.051 | 6ms | PASS |
| /profile | 2ms | 748ms | 856ms | 0.001 | 9ms | PASS |
| /jams | 3ms | 452ms | 568ms | 0.003 | 4ms | PASS |
| /reels | 1ms | 440ms | 784ms | 0.001 | 4ms | PASS |
| /settings | 2ms | 512ms | 640ms | 0.003 | 9ms | PASS |

## Summary

- **PASS:** 8
- **WARN:** 1
- **FAIL:** 0
- **ERROR:** 0
