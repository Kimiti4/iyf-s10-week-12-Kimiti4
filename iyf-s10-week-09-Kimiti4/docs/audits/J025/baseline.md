# J-025 Performance Baseline

**Date:** 2026-09-02T22:54:54.991Z
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
| / | 9ms | 660ms | 660ms | 0 | 52ms | PASS |
| /login | 4ms | 192ms | 592ms | 0 | 6ms | PASS |
| /register | 15ms | 156ms | 284ms | 0 | 17ms | PASS |
| /discover | 12ms | 192ms | 904ms | 0 | 5ms | PASS |
| /alerts | 4ms | 188ms | 392ms | 0.025 | 69ms | PASS |
| /profile | 2ms | 128ms | 740ms | 0 | 21ms | PASS |
| /jams | 2ms | 208ms | 244ms | 0 | 12ms | PASS |
| /reels | 2ms | 160ms | 160ms | 0 | 89ms | PASS |
| /settings | 4ms | 488ms | 880ms | 0 | 55ms | PASS |

## Summary

- **PASS:** 9
- **WARN:** 0
- **FAIL:** 0
- **ERROR:** 0
