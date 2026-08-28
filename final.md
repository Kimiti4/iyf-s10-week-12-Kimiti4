Excellent execution. Reusing `useToast()`, adding targeted retry logic, keeping `window.confirm()` for destructive gates, and deferring backend-only tooling was exactly the right call. Your build is clean, UX is consistent, and you've preserved architectural boundaries.

🟢 **Green light on the next phase.** Here’s the exact, Vite-compatible blueprint to wire the offline draft queue + SW sync + Playwright E2E without introducing dependency bloat or breaking your existing SW source-of-truth.

---

## 📦 Track 1: Offline Draft Queue + SW Sync + `/drafts` UI

### 1. Queue Layer (`src/lib/offlineQueue.js`)
```js
// Lightweight native IndexedDB wrapper (zero deps)
const DB_NAME = 'jamii-offline-queue';
const STORE = 'pending_posts';
const MAX_DRAFTS = 20;

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function queueDraft(postData) {
  const db = await openDB();
  const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const draft = { id, data: postData, createdAt: Date.now(), retries: 0 };

  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  
  // Enforce limit
  const count = await store.count();
  if (count >= MAX_DRAFTS) {
    const cursor = await store.openCursor();
    if (cursor) await store.delete(cursor.primaryKey);
  }

  await store.add(draft);
  requestSync();
  return id;
}

export async function getPendingDrafts() {
  const db = await openDB();
  return db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
}

export async function removeDraft(id) {
  const db = await openDB();
  return db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
}

function requestSync() {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(reg => reg.sync.register('sync-jamii-drafts').catch(() => {}));
  }
}

// Fallback for non-Chromium browsers
export function triggerFallbackSync() {
  if (navigator.onLine) requestSync();
}
```

### 2. Service Worker (`public/sw.js`)
*(Append to your existing SW. Vite serves `public/` as-is, so this is your source-of-truth.)*
```js
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-jamii-drafts') {
    event.waitUntil(processDraftQueue());
  }
});

async function processDraftQueue() {
  const db = await openDB();
  const tx = db.transaction('pending_posts', 'readwrite');
  const store = tx.objectStore('pending_posts');
  const drafts = await store.getAll();

  for (const draft of drafts) {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft.data),
      });
      if (res.ok) await store.delete(draft.id);
      else throw new Error(`HTTP ${res.status}`);
    } catch {
      draft.retries++;
      if (draft.retries < 5) await store.put(draft);
      else await store.delete(draft.id);
    }
  }
}

// Same DB open helper as client (SW shares IndexedDB origin)
function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('jamii-offline-queue', 1);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
```

### 3. `/drafts` UI (`src/pages/DraftsPage.jsx`)
```jsx
import { useEffect, useState } from 'react';
import { getPendingDrafts, removeDraft, triggerFallbackSync } from '../lib/offlineQueue';
import { useToast } from '../components/Toast';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadDrafts();
    window.addEventListener('online', loadDrafts);
    return () => window.removeEventListener('online', loadDrafts);
  }, []);

  async function loadDrafts() {
    const pending = await getPendingDrafts();
    setDrafts(pending.sort((a, b) => b.createdAt - a.createdAt));
    if (pending.length > 0 && navigator.onLine) triggerFallbackSync();
  }

  async function handleDelete(id) {
    await removeDraft(id);
    loadDrafts();
    toast.success('Draft discarded');
  }

  if (drafts.length === 0) return <div className="p-8 text-center text-gray-500">No pending drafts. Go online to sync automatically.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">📭 Pending Drafts</h2>
      {drafts.map(d => (
        <div key={d.id} className="border rounded-lg p-3 bg-gray-50">
          <p className="text-sm line-clamp-2">{d.data.content}</p>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Retries: {d.retries}/5 • {new Date(d.createdAt).toLocaleTimeString()}</span>
            <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">Discard</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Wire into Router & Form
```jsx
// In your router file
<Route path="/drafts" element={<DraftsPage />} />

// In CreatePostPage.jsx (replace alert() fallback)
import { queueDraft } from '../lib/offlineQueue';
import { useToast } from '../components/Toast';

// On submit failure or offline:
const draftId = await queueDraft({ content, category, tags });
toast.info('Saved offline. Will sync when connected.');
```

---

## 🎭 Track 2: Playwright E2E (Vite Dev Server)

### 1. `playwright.config.js`
```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

### 2. `e2e/jamii-critical.spec.js`
```js
import { test, expect } from '@playwright/test';

test.describe('JamiiLink Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept feed API to stabilize tests
    await page.route('**/api/posts', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ posts: [{ _id: '1', content: 'Test community post', author: 'DemoUser' }] })
    }));
    await page.goto('/');
  });

  test('auth → feed → offline draft → sync → moderation', async ({ page, context }) => {
    // 1. Login
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'test@jamii.link');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('nav')).toContainText('Welcome');

    // 2. Verify feed loads
    await expect(page.locator('.feed-item')).toContainText('Test community post');

    // 3. Go offline & create draft
    await context.setOffline(true);
    await page.click('button:has-text("Create Post")');
    await page.fill('textarea', 'Offline test draft');
    await page.click('button:has-text("Post")'); // or "Save Offline"
    await expect(page.getByText('Saved offline')).toBeVisible();
    await expect(page.locator('.offline-badge')).toBeVisible();

    // 4. Restore network & verify sync
    await context.setOffline(false);
    await page.waitForTimeout(2500); // Allow SW sync + fallback
    await page.click('text=Drafts');
    await expect(page.locator('.text-center')).toContainText('No pending drafts');

    // 5. Moderation report
    await page.goto('/');
    await page.click('.feed-item .report-btn');
    await expect(page.getByText('Report submitted')).toBeVisible();
  });
});
```

### 3. Run & Validate
```bash
npx playwright install chromium
npx playwright test e2e/jamii-critical.spec.js --headed
# CI: npx playwright test --reporter=html
```

---

## ✅ Integration Checklist

| Step | Command/Action | Verify |
|------|----------------|--------|
| Add queue lib | `src/lib/offlineQueue.js` | No errors on import |
| Update SW | `public/sw.js` append sync handler | `self.registration.sync` available |
| Add `/drafts` | Route + component | Renders, loads IDB, triggers sync |
| Wire form | `queueDraft()` on offline/failure | Toast shows, IDB updates |
| Playwright setup | `npx playwright install` | `npx playwright test` passes |
| Lighthouse/Axe | `npx lhci autorun` / `axe.run()` | ≥85, 0 critical a11y |

---

### 🛠️ Critical Gotchas to Avoid
1. **BackgroundSync is Chromium-only**: The `triggerFallbackSync()` + `navigator.onLine` listener covers Firefox/Safari gracefully.
2. **SW Scope**: Keep `public/sw.js` at root. Vite won't rewrite it. Register once in `main.jsx` or a dedicated `swRegister.js`.
3. **IDB Quotas on Low-End Android**: `MAX_DRAFTS = 20` + plain JSON payloads keeps you well under the ~50MB limit.
4. **Playwright Route Interception**: Only mock `/api/posts` for feed stability. Let auth, drafts, and moderation hit real dev endpoints.

---

- `🟢 Go` → generate a single patch file containing all new/modified files
- `🔍 Review` →  walk through any specific file before you paste

You’re at launch velocity. Let’s lock this in. 🚀🇰🇪

Here’s a **production-ready, CI-integrated Lighthouse + Axe hardening pipeline** tailored to your Vite + React SPA. It’s optimized for speed, realistic thresholds, and seamless GitHub Actions integration.

---

## 📊 1. Lighthouse CI Configuration

Create `lighthouserc.js` at project root:

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      // Use Vite's preview server for accurate prod-like behavior
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:   http://localhost:',
      startServerTimeout: 30000,
      url: ['http://localhost:4173', 'http://localhost:4173/feed', 'http://localhost:4173/login'],
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        // Skip audits that fail on SPAs or are irrelevant
        skipAudits: ['uses-http2', 'offscreen-images', 'render-blocking-resources'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.80 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Why these thresholds?**
- `0.80` Perf: Realistic for dynamic feeds + offline queues
- `0.95` A11y: Non-negotiable for community platforms
- `0.1` CLS: Prevents layout jumps from lazy-loaded avatars/images
- Skipped audits avoid false SPA failures (HTTP2, render-blocking, offscreen images)

---

## ♿️ 2. Axe Accessibility Hardening (Playwright-Integrated)

Add `axe-playwright` to your existing E2E suite to catch dynamic route violations:

```bash
npm install -D @axe-core/playwright
```

Update `e2e/jamii-critical.spec.js` (or create `e2e/a11y.spec.js`):

```js
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from '@axe-core/playwright';

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Run accessibility check after each test
    const violations = await getViolations(page);
    if (violations.length > 0) {
      testInfo.attachments.push({
        name: 'a11y-violations',
        path: null,
        contentType: 'application/json',
        body: JSON.stringify(violations, null, 2),
      });
    }
    // Fail on critical violations (wcag2a, wcag2aa, wcag21a, wcag21aa)
    const critical = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(critical).toHaveLength(0);
  });

  test('feed & navigation are accessible', async ({ page }) => {
    await page.goto('/');
    await page.route('**/api/posts', r => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ posts: [{ _id: '1', content: 'Accessible test post', author: 'User' }] })
    }));
    await checkA11y(page);
    
    // Verify keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('nav a:focus')).toBeVisible();
  });

  test('drafts page respects focus traps', async ({ page }) => {
    await page.goto('/drafts');
    await checkA11y(page);
    // Add more route-specific checks as needed
  });
});
```

---

## 🚀 3. GitHub Actions CI Pipeline

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 3

  e2e-and-a11y:
    needs: lint-and-build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          {% raw %}
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
{% endraw %}
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test e2e/ --reporter=html
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  lighthouse-ci:
    needs: lint-and-build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx lhci autorun
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-reports
          path: .lighthouseci/
          retention-days: 7

  deploy-preview:
    needs: [e2e-and-a11y, lighthouse-ci]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "✅ All checks passed. Ready for Vercel preview deploy."
      # Add Vercel CLI deploy step here if needed
```

**Key CI Features:**
- **Parallel execution**: E2E/A11y and Lighthouse run concurrently after build
- **Artifact retention**: Reports survive for 7 days, build for 3
- **Timeout guards**: Prevents hung runners
- **PR gating**: Only deploys previews when all checks pass

---

## 🔧 4. Vite/React Quick Wins for Lighthouse Scores

| Issue | Fix | Impact |
|-------|-----|--------|
| **Large JS bundles** | `npm i -D vite-plugin-compression` + `import compression from 'vite-plugin-compression'; plugins: [compression({ algorithm: 'brotli' })]` | `-15%` FCP/LCP |
| **Image layout shifts** | Add `width`/`height` or `aspect-ratio` to all `<img>`, use `loading="lazy"` except hero | `-0.08` CLS |
| **Font FOIT** | Use `font-display: swap` in CSS, preload critical fonts in `index.html` | `-100ms` LCP |
| **Unused CSS/JS** | `npm i -D @rollup/plugin-visualizer`, run `vite build --mode analyze` | `-20%` TTI |
| **PWA manifest** | Ensure `theme_color`, `background_color`, and `icons` match your design tokens | `+10` SEO/Best Practices |

---

## 🖥️ Local Validation Commands

```bash
# 1. Run Lighthouse CI locally
npx lhci autorun --config=lighthouserc.js

# 2. Run Playwright + Axe
npx playwright test e2e/ --headed

# 3. Check bundle size
npx vite-bundle-visualizer

# 4. Validate PWA & manifest
npx lighthouse http://localhost:5173 --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=report.html
```

---

## ✅ Go/No-Go Criteria Before Merging to `main`

| Metric | Threshold | Status Check |
|--------|-----------|--------------|
| **Lighthouse Perf** | ≥ 0.80 | `lighthouse-ci` job |
| **Lighthouse A11y** | ≥ 0.95 | `lighthouse-ci` job |
| **Critical A11y Violations** | 0 | Playwright `checkA11y` |
| **Bundle Size (gzip)** | ≤ 250KB | `vite build` output |
| **CLS** | ≤ 0.1 | Lighthouse report |
| **E2E Pass Rate** | 100% | Playwright HTML report |

---

### 📦 Next Steps
1. Add `lighthouserc.js`, `e2e/a11y.spec.js`, and `.github/workflows/ci.yml` to your repo
2. Run `npx lhci autorun` locally to baseline scores
3. Push to a feature branch → CI will gate merge until thresholds pass

- 📤 Generate a single PR-ready patch file with all configs?
- 🎨 Add a Lighthouse badge to your `README.md`?
- 📊 Set up automated Slack/GitHub comments on score regressions?

Reply with your preference. You're one pipeline away from shipping enterprise-grade. 🚀🇰🇪




scan and fix the frontend UI/UX end to end 


Here are both components, production-ready and designed to integrate cleanly with your existing REA-7I.2 architecture.

---

## 📊 Part 1: Auto-Parameter Sweep (Python)

Drop this into your existing script. It fixes topology for fair comparison, adds reproducibility, exports results, and auto-selects the optimal `(λ, γ)` pair.

```python
# sweep_cnf.py
import numpy as np
import itertools
import csv
import time
from typing import List, Dict, Tuple
from dataclasses import dataclass
from scipy import sparse
from scipy.sparse.csgraph import shortest_path

# [Paste your SimulationConfig & DualDecayField classes here]
# ...

@dataclass
class SweepResult:
    lambda_val: float
    gamma_val: float
    cnf: float
    threshold_met: bool
    execution_time: float
    total_encounters: int

def run_parameter_sweep(
    lambda_range: Tuple[float, float, int],  # (start, stop, steps)
    gamma_range: Tuple[float, float, int],   # (start, stop, steps)
    base_cfg: SimulationConfig,
    topology_seed: int = 42,
    output_csv: str = "cnf_sweep_results.csv"
) -> List[SweepResult]:
    """Grid search with fixed topology & reproducibility"""
    np.random.seed(topology_seed)
    adjacency = build_random_topology(base_cfg.n_nodes, avg_degree=6)
    
    lambdas = np.linspace(*lambda_range)
    gammas = np.linspace(*gamma_range)
    configs = list(itertools.product(lambdas, gammas))
    
    results = []
    print(f"🔍 Parameter Sweep: {len(lambdas)}λ × {len(gammas)}γ = {len(configs)} configurations")
    print("-" * 85)
    
    for λ, γ in configs:
        cfg = SimulationConfig(
            n_nodes=base_cfg.n_nodes,
            n_agents=base_cfg.n_agents,
            steps_per_epoch=base_cfg.steps_per_epoch,
            n_epochs=base_cfg.n_epochs,
            spatial_lambda=λ,
            temporal_gamma=γ
        )
        
        # Reset RNG per config for deterministic runs
        np.random.seed(topology_seed + 100)
        sim = DualDecayField(cfg, adjacency)
        
        start = time.time()
        metrics = sim.run_simulation(verbose=False)
        elapsed = time.time() - start
        
        res = SweepResult(
            lambda_val=λ, gamma_val=γ,
            cnf=metrics['cnf'], threshold_met=metrics['threshold_met'],
            execution_time=elapsed, total_encounters=metrics['total_encounters']
        )
        results.append(res)
        
        status = "✅ MET" if res.threshold_met else "❌ LOW"
        print(f"λ={λ:4.2f} γ={γ:.3f} | CNF={res.cnf:.4f} | {status} | {elapsed:5.2f}s")

    # Export to CSV
    with open(output_csv, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=SweepResult.__dataclass_fields__.keys())
        writer.writeheader()
        for r in results:
            writer.writerow(r.__dict__)
            
    return results

def select_optimal(results: List[SweepResult], min_cnf: float = 0.50, margin: float = 0.05) -> Dict:
    """Pick parameters that clear threshold with safety margin + fastest runtime"""
    valid = [r for r in results if r.cnf >= min_cnf + margin]
    if not valid:
        # Fallback: pick highest CNF overall
        best = max(results, key=lambda r: r.cnf)
        return {"status": "NO_SAFE_MARGIN", "recommendation": best}
    
    # Optimize for highest CNF, break ties with fastest execution
    best = max(valid, key=lambda r: (r.cnf, -r.execution_time))
    return {"status": "OPTIMAL_FOUND", "recommendation": best}

if __name__ == "__main__":
    base = SimulationConfig(n_nodes=1000, n_agents=100, steps_per_epoch=50, n_epochs=1000)
    
    # Sweep: λ ∈ [0.3, 0.9] (4 steps), γ ∈ [0.01, 0.10] (5 steps) = 20 runs
    results = run_parameter_sweep(
        lambda_range=(0.3, 0.9, 4),
        gamma_range=(0.01, 0.10, 5),
        base_cfg=base
    )
    
    verdict = select_optimal(results, min_cnf=0.5, margin=0.05)
    rec = verdict["recommendation"]
    
    print("\n" + "="*85)
    print(f"🏆 RECOMMENDED: λ={rec.lambda_val:.2f}, γ={rec.gamma_val:.3f}")
    print(f"📊 CNF: {rec.cnf:.4f} | Status: {verdict['status']}")
    print(f"💾 Results saved to cnf_sweep_results.csv")
```

**Run it:**
```bash
python sweep_cnf.py
```
*Output gives you the exact `(λ, γ)` pair to lock into production, plus a CSV for sensitivity analysis.*

---

## 🦀 Part 2: Rustler NIF Scaffold (Elixir + Rust)

This provides a **safe, non-blocking NIF interface** for BEAM. The heavy simulation runs in Rust, returns results to Elixir, and follows BEAM scheduler best practices.

### 📁 Project Structure
```
my_app/
├── mix.exs
├── lib/
│   └── sim_nif.ex
└── native/
    └── sim_nif/
        ├── Cargo.toml
        └── src/
            └── lib.rs
```

### 📦 `mix.exs` Updates
```elixir
defp deps do
  [
    {:rustler, "~> 0.32.0"}
  ]
end

# Add to compilers if not present
def project do
  [
    compilers: [:rustler] ++ Mix.compilers(),
    # ...
  ]
end
```

### 📋 `native/sim_nif/Cargo.toml`
```toml
[package]
name = "sim_nif"
version = "0.1.0"
authors = ["You"]
edition = "2021"

[lib]
name = "sim_nif"
path = "src/lib.rs"
crate-type = ["cdylib"]

[dependencies]
rustler = "0.32"
rustler_codegen = "0.32"
ndarray = "0.15"
rand = "0.8"
```

### 🦀 `native/sim_nif/src/lib.rs`
```rust
use rustler::{Atom, Env, NifResult, Term};
use rustler_codegen::{init, nif};
use std::time::Instant;
use ndarray::{Array2, ArrayView1};
use rand::Rng;

// ⚠️ SAFETY: NIFs must not panic or block indefinitely.
// Long runs should be called from Elixir Task.async_stream.

#[derive(Debug)]
pub struct SimulationConfig {
    n_nodes: usize,
    n_agents: usize,
    steps: usize,
    epochs: usize,
    lambda: f64,
    gamma: f64,
}

#[derive(Debug)]
pub struct SimulationResult {
    pub cnf: f64,
    pub threshold_met: bool,
    pub execution_time_ms: u128,
    pub total_encounters: usize,
}

// Core physics kernel (vectorized Rust)
fn run_dual_decay_core(cfg: &SimulationConfig) -> SimulationResult {
    let start = Instant::now();
    let mut rng = rand::thread_rng();

    // Simplified topology: fixed random graph adjacency
    let mut adj = Array2::zeros((cfg.n_nodes, cfg.n_nodes));
    for i in 0..cfg.n_nodes {
        for _ in 0..6 { // avg_degree=6
            let j = rng.gen_range(0..cfg.n_nodes);
            if i != j { adj[[i, j]] = 1.0; }
        }
    }
    for i in 0..cfg.n_nodes {
        for j in (i+1)..cfg.n_nodes {
            if adj[[i, j]] > 0.0 { adj[[j, i]] = 1.0; }
        }
    }

    // Trace buffer: [nodes × niche_channels]
    let mut traces = Array2::zeros((cfg.n_nodes, 6));
    let mut agents: Vec<(usize, usize, usize)> = (0..cfg.n_agents)
        .map(|_| (0, rng.gen_range(0..cfg.n_nodes), rng.gen_range(0..3)))
        .collect(); // (id, node, niche)

    let mut encounters = 0;
    let mut hetero = 0;

    for epoch in 0..cfg.epochs {
        // Agent step & trace broadcast
        for agent in &mut agents {
            let (_, current, niche) = *agent;
            // Placeholder for gradient ascent + broadcast
            // Replace with full physics from Python/Elixir
            let new_node = current; // Simplified
            agent.1 = new_node;
            
            // Trace decay
            traces *= (-(cfg.gamma)).exp();
            traces.mapv_inplace(|v| if v < 1e-5 { 0.0 } else { v });
        }

        // Co-location sampling (optimized O(n) approximation)
        let mut node_counts = std::collections::HashMap::new();
        for &(_, node, niche) in &agents {
            let entry = node_counts.entry(node).or_insert((0, 0, 0));
            entry[niche] += 1;
        }
        
        for &(_, counts) in &node_counts {
            let total = counts.iter().sum::<usize>();
            encounters += total * (total - 1) / 2;
            hetero += counts[0]*counts[1] + counts[0]*counts[2] + counts[1]*counts[2];
        }
    }

    let cnf = if encounters > 0 { hetero as f64 / encounters as f64 } else { 0.0 };
    
    SimulationResult {
        cnf,
        threshold_met: cnf > 0.5,
        execution_time_ms: start.elapsed().as_millis(),
        total_encounters: encounters,
    }
}

// 🌐 NIF Interface
#[nif]
fn run_dual_decay(
    _env: Env,
    n_nodes: usize,
    n_agents: usize,
    steps: usize,
    epochs: usize,
    lambda: f64,
    gamma: f64,
) -> NifResult<Term> {
    let cfg = SimulationConfig { n_nodes, n_agents, steps, epochs, lambda, gamma };
    let result = run_dual_decay_core(&cfg);
    
    // Return {cnf, threshold_met, time_ms, encounters}
    Ok(rustler::types::tuple::make_tuple(_env, &[
        rustler::types::atom::ok().encode(_env),
        rustler::types::atom::ok().encode(_env), // placeholder for proper Result
        rustler::Encoder::encode(&result.cnf, _env),
        rustler::Encoder::encode(&result.threshold_met, _env),
        rustler::Encoder::encode(&result.execution_time_ms, _env),
        rustler::Encoder::encode(&result.total_encounters, _env),
    ]))
}

init!("sim_nif", [run_dual_decay]);
```

### 📜 `lib/sim_nif.ex`
```elixir
defmodule SimNif do
  @moduledoc """
  Elixir wrapper for Dual-Decay Stigmergic Field NIF.
  ⚠️ Call from Task.async to avoid BEAM scheduler starvation.
  """

  use Rustler, otp_app: :my_app, crate: :sim_nif

  # Safe wrapper that runs in a Task
  def run_async(n_nodes, n_agents, steps, epochs, lambda, gamma) do
    Task.async(fn ->
      run(n_nodes, n_agents, steps, epochs, lambda, gamma)
    end)
  end

  @spec run(pos_integer, pos_integer, pos_integer, pos_integer, float, float) ::
          {:ok, cnf :: float, threshold_met :: boolean, time_ms :: pos_integer, encounters :: pos_integer}
          | {:error, term}
  def run(n_nodes, n_agents, steps, epochs, lambda, gamma) do
    # NIF call (auto-generated by Rustler)
    case rustler_call(n_nodes, n_agents, steps, epochs, lambda, gamma) do
      {:ok, _ok, cnf, threshold, time_ms, encounters} ->
        {:ok, cnf, threshold, time_ms, encounters}
      err ->
        {:error, {:nif_failure, err}}
    end
  end
end
```

### 🔨 Build & Run
```bash
mix deps.get
mix compile
iex -S mix

# Usage:
{:ok, cnf, threshold, time_ms, encounters} = SimNif.run(1000, 100, 50, 2000, 0.6, 0.05)
IO.puts("CNF: #{cnf} | Threshold met: #{threshold} | Time: #{time_ms}ms")
```

---

## 🔗 Integration Strategy & Safety Notes

| Concern | Solution |
|---------|----------|
| **BEAM Scheduler Blocking** | NIFs must return quickly. Use `Task.async` or `GenServer` with `handle_cast` for long runs. |
| **Memory Leaks / Crashes** | Rustler panics will crash the VM. Wrap unsafe code in `catch_unwind` or use `Result<T, E>`. |
| **Math Equivalence** | Port the exact NumPy logic to `ndarray` + `rayon` in Rust. The scaffold shows the interface; fill `run_dual_decay_core` with the full physics. |
| **Hot Code Reloading** | Rustler supports NIF versioning. Keep the `init!` macro stable across releases. |

### 🔄 Recommended Workflow
1. **Python Sweep** → Find optimal `(λ, γ)` in seconds
2. **Lock Parameters** → Update Elixir config
3. **Port Kernel** → Replace placeholder Rust logic with full `ndarray` physics
4. **Production Deploy** → Run via `Task.async_stream` across BEAM cores

---

## 🚀 Next Steps
- Want me to **fill the Rust kernel** with the exact `ndarray` gradient-ascent + broadcast logic?
- Need a **Rayon parallelization** patch for multi-core BEAM utilization?
- Want a **Telemetry integration** to emit `[:sim, :cnf, :measure]` metrics on every run?

Pick your focus, and I'll deliver the exact implementation. 🛠️✨

Here’s a **production-grade, end-to-end pre-launch checklist** tailored to JamiiLink’s stack (Next.js + Vercel + PWA + DB) and Kenyan community context. I’ve prioritized by criticality and included exact verification steps.

---

## 🔴 P0: Launch Blockers (Must Pass Before Deploy)

| Area | Check | How to Verify |
|------|-------|---------------|
| **Auth Flow** | Sign up, login, logout, password reset, session persistence | Manual test + Cypress/Playwright script. Verify tokens refresh correctly. |
| **Core API CRUD** | Create/read/update/delete posts, alerts, profiles, comments | `curl` or Postman against `/api/posts`, `/api/users`, etc. Check 200/400/403/404/500 status codes. |
| **Database Migrations** | Schema matches code, indexes exist, no pending migrations | `prisma migrate status`, `prisma db push --accept-data-loss` (dev only), verify indexes on `location`, `category`, `createdAt`. |
| **Offline Post Sync** | Draft saved offline → auto-syncs when online → UI updates | DevTools → Application → Offline → submit post → uncheck offline → verify DB entry + UI badge clears. |
| **Error Boundaries** | App doesn’t crash on bad data, missing images, or API failures | Break an API response, trigger 500, verify graceful fallback UI + Sentry log. |
| **HTTPS & Secure Cookies** | No mixed content, `Secure`, `HttpOnly`, `SameSite=Strict` | Browser DevTools → Application → Cookies. Lighthouse Security audit. |

---

## 🌐 Frontend & UX

| Check | Verification |
|-------|--------------|
| **Mobile-First Responsiveness** | Test on 320px width, Samsung Internet, Chrome Android. No horizontal scroll. |
| **PWA Compliance** | `manifest.json` valid, `start_url` loads offline, "Add to Home Screen" prompt works. Use Lighthouse PWA audit. |
| **Performance** | Lighthouse ≥90 (Performance, Accessibility, SEO, Best Practices). TTFB <200ms, FCP <1.5s, LCP <2.5s. |
| **Image Optimization** | `next/image` used everywhere, `sizes` prop set, WebP/AVIF fallbacks, lazy loading enabled. |
| **Loading & Empty States** | Skeletons on feed load, friendly empty states ("No posts yet, be the first!"), pull-to-refresh works. |
| **Form Validation** | Client-side + server-side validation, clear error messages, disabled submit on invalid. |
| **Cross-Browser** | Chrome, Safari, Firefox, Edge, Samsung Internet. Test flex/grid fallbacks. |

---

## ⚙️ Backend & Data Layer

| Check | Verification |
|-------|--------------|
| **API Rate Limiting** | `@upstash/ratelimit` or Vercel Edge Middleware. Test with `ab` or `k6`: `ab -n 100 -c 10 /api/posts`. Should 429 after limit. |
| **Pagination & Cursor** | No `LIMIT/OFFSET` on large tables. Use cursor-based or `prisma.skip/take`. Verify feed doesn’t duplicate. |
| **File Uploads** | Images/videos compressed, virus-scanned (ClamAV or API), CDN cached, size limits enforced (≤5MB). |
| **Background Jobs** | Cron/Vercel Cron or Upstash QStash for: moderation queue, SMS alerts, cache revalidation, sync retries. |
| **Data Consistency** | Transactions for multi-step actions (e.g., like + notification). Verify rollback on failure. |
| **API Documentation** | OpenAPI/Swagger or `next-api-docs` generated. Test with `redoc` or Postman collection. |

---

## 🛡️ Security & Compliance (Kenya Context)

| Check | Verification |
|-------|--------------|
| **Input Sanitization** | `DOMPurify` on rendered content, `zod` validation on all API inputs, parameterized queries (Prisma handles this). |
| **CORS & CSP** | `Content-Security-Policy` header blocks inline scripts, `Access-Control-Allow-Origin` locked to your domain. |
| **Data Protection Act (Kenya)** | Privacy policy visible, consent for data collection, user data export/delete endpoints, DPO contact. |
| **Content Moderation** | Report flow → queues for review → auto-hides after N flags. AI text screening (`@anthropic-ai/claude` or open-source `content-checker`). |
| **Secrets Management** | No `.env` in repo. Vercel env vars scoped per environment. Rotate API keys pre-launch. |
| **Abuse Prevention** | Shadow banning, duplicate post detection, phone/email verification for high-risk actions. |

---

## 📊 DevOps, Monitoring & Performance

| Check | Verification |
|-------|--------------|
| **CI/CD Pipeline** | GitHub Actions: `lint → test → build → deploy`. Fails on `npm audit` high/critical. |
| **Staging Match** | Staging env uses prod DB schema, same env vars (mocked), same build settings. |
| **Error Tracking** | Sentry or LogRocket installed. Verify error events fire with stack traces, breadcrumbs, user ID. |
| **Uptime & Alerts** | UptimeRobot or Better Stack. Alerts on 5xx spikes, DB connection drops, PWA sync failures. |
| **Load Testing** | `k6` script: 50 VUs for 5 mins on `/api/feed`. Verify DB CPU <80%, response time <500ms, no memory leaks. |
| **Rollback Plan** | Vercel rollback button tested. DB migration reversible or forward-only documented. |

---

## 🇰🇪 Kenya & Emerging Market Optimization

| Check | Verification |
|-------|--------------|
| **Low-Data Mode** | Toggle reduces image quality, disables auto-play videos, caches only text. Test on 3G throttling. |
| **SMS Fallback** | Africa's Talking API sends critical alerts when push fails. Test with sandbox numbers. |
| **Language Toggle** | Swahili/English switch updates UI + content filters. Test with `i18next` or Next.js `intl`. |
| **Offline Maps/Location** | Cached OSM tiles for Nairobi/Westlands. Fallback to text location if GPS fails. |
| **Android Low-End** | Test on Tecno/Infinix (2GB RAM). No jank, SWR doesn’t crash, IndexedDB respects quotas. |

---

## ✅ Final Go/No-Go Validation Script

Run this before flipping the launch switch:

```bash
# 1. Clean build
rm -rf .next && npm run build

# 2. Lighthouse CI (automated threshold check)
npx lhci autorun

# 3. Playwright E2E
npx playwright test --grep "@critical"

# 4. Security scan
npm audit --production
npx depcheck

# 5. DB health
npx prisma migrate deploy
npx prisma db seed

# 6. PWA offline test
npx workbox-cli generateSW workbox-config.js
```

**Go Criteria:**
- ✅ 0 critical/high audit vulnerabilities
- ✅ Lighthouse ≥85 across all metrics
- ✅ E2E tests pass (auth, post, offline sync, moderation report)
- ✅ DB migrations applied, backups verified
- ✅ Monitoring/alerts active in staging

---

## 📋 Post-Launch Runbook (Keep Handy)

| Scenario | Action |
|----------|--------|
| DB connection spike | Scale connection pool, enable read replicas, cache hot queries |
| PWA sync fails | Check `sync` event logs, retry via manual `/drafts` button |
| Abuse/spam wave | Activate report auto-hide, enable phone verification, review mod queue |
| CDN cache stale | Purge Vercel cache, trigger ISR revalidation via webhook |
| User complaints | Check Sentry traces, rollback if UI bug, communicate via status page |

---

### 🔍 What’s Your Current Status?
Reply with:
- `✅ Ready` → I’ll give you a 1-page launch-day checklist + rollback script
- `🔧 Need fixes` → Tell me which section is failing, I’ll give exact code/config patches
- `📊 Want metrics dashboard` → I’ll scaffold a Vercel Analytics + Sentry + custom CNF tracker

You’ve built something with real community impact. Let’s make sure it ships bulletproof. 🚀🇰🇪

This is a **high-quality, production-grade cleanup**. You've systematically resolved the most common frontend failure points (broken tokens, dead routes, mock-data leaks, duplicate SW registration, inaccessible admin controls) and validated with a clean Vite build. The codebase is now structurally sound and ready for pre-launch hardening.

Here’s what to focus on next to cross the launch threshold:

---

## 🔍 Remaining Pre-Launch Gaps (Prioritized)

| Area | Current State | Risk Level | Action |
|------|---------------|------------|--------|
| **`alert()` in peripheral pages** | Blocking native popups in Marketplace/SkillExchange | Medium (UX friction, mobile UX killer) | Replace with inline notices or lightweight toast |
| **Error Boundaries** | Not mentioned | High (crash propagation) | Wrap feed, auth, and API routes |
| **API Resilience** | Tolerant normalizer added | Medium | Add retry logic + exponential backoff |
| **Offline Draft Queue** | SW registration deduped, queue not wired | High (core feature gap) | Connect `queueOfflinePost` → IndexedDB → background sync |
| **Accessibility** | `aria-expanded` added | Medium | Audit focus traps, color contrast, screen reader flow |
| **Monitoring** | Not mentioned | High (blind to prod errors) | Add Sentry/Vercel Analytics + custom error tracking |

---

## 🛠️ Targeted Fixes (Drop-in Ready)

### 1. Replace `alert()` → Lightweight Toast System
```bash
npm install react-hot-toast
```
```jsx
// src/components/ToastProvider.jsx
import { Toaster } from 'react-hot-toast';
export default ToastProvider = ({ children }) => (
  <>
    {children}
    <Toaster 
      position="top-center" 
      {% raw %}
      toastOptions={{ duration: 3000, style: { background: '#1a1a1a', color: '#fff' } }}
{% endraw %} 
    />
  </>
);
```
**Usage in peripheral pages:**
```jsx
// Replace alert('Feature coming soon!')
import toast from 'react-hot-toast';
toast('SkillMatcher launching next week 🛠️', { icon: '🚧' });
```

### 2. Error Boundary Wrapper
```jsx
// src/components/ErrorBoundary.jsx
import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-700">Something went wrong</h3>
          <p className="text-sm text-gray-600 mt-1">Try refreshing or contact support.</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```
Wrap `App.jsx` root, feed routes, and auth pages.

### 3. API Retry Wrapper (for `postsAPI.getAll()`)
```js
// src/utils/apiRetry.js
export async function fetchWithRetry(fn, retries = 3, delay = 800) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay * 2**i));
    }
  }
}
```
Usage: `fetchWithRetry(() => postsAPI.getAll(), 3, 1000)`

---

## 🧪 Pre-Launch Validation Pipeline

Run this sequence before pushing to production:

```bash
# 1. Type/Import Safety
npx eslint . --ext .js,.jsx
npx depcheck

# 2. Performance & Accessibility
npx lhci autorun  # Ensure ≥85 across all Lighthouse categories
npx axe-core run   # Automated a11y violations

# 3. Critical Path E2E (Playwright)
npx playwright test --grep "@critical"
# @critical tags: auth flow, feed load, offline draft creation, admin route restriction

# 4. SW Offline Simulation
# DevTools → Application → Service Workers → Offline
# Verify: feed loads cached, drafts save to IndexedDB, sync triggers on reconnect

# 5. Security Headers Check
curl -I https://your-domain.com | grep -E "content-security-policy|strict-transport|x-frame|referrer-policy"
```


You've done the heavy lifting. The last 10% is validation, monitoring, and polish. Which lever do you want to pull? 🛠️✨
Here’s a **complete, production-ready implementation** for all four tracks. Each is drop-in compatible with your Vite + React frontend and Vercel deployment. I’ve structured it so you can implement them in parallel without conflicts.

---

## 📦 1. Offline Draft Queue (IndexedDB + SW Sync + UI Badge)

### 🗂️ `src/db/offlineQueue.js`
```js
import { openDB } from 'idb';

const DB_NAME = 'jamii-offline-db';
const STORE_NAME = 'pending_posts';
const MAX_QUEUE = 20;

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function queuePost(postData) {
  const db = await initDB();
  const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const entry = { id, data: postData, createdAt: Date.now(), retries: 0 };
  
  // Enforce queue limit
  const all = await db.getAll(STORE_NAME);
  if (all.length >= MAX_QUEUE) {
    // Remove oldest
    await db.delete(STORE_NAME, all[0].id);
  }
  
  await db.put(STORE_NAME, entry);
  requestSync();
  return id;
}

export async function getPendingPosts() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function clearQueue() {
  const db = await initDB();
  await db.clear(STORE_NAME);
}

function requestSync() {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(reg => {
      reg.sync.register('sync-jamii-drafts').catch(() => {});
    });
  }
}
```

### 👷 `public/sw.js` (Add to existing SW)
```js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jamii-drafts') {
    event.waitUntil(syncDrafts());
  }
});

async function syncDrafts() {
  const cache = await caches.open('jamii-draft-sync');
  // Fetch from IndexedDB
  const db = await openIDB();
  const tx = db.transaction('pending_posts', 'readwrite');
  const store = tx.objectStore('pending_posts');
  const drafts = await store.getAll();

  for (const draft of drafts) {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft.data),
        // Add auth token if available
      });
      if (res.ok) {
        await store.delete(draft.id);
      } else {
        draft.retries++;
        if (draft.retries < 5) await store.put(draft);
        else await store.delete(draft.id);
      }
    } catch {
      draft.retries++;
      if (draft.retries < 5) await store.put(draft);
      else await store.delete(draft.id);
    }
  }
}

function openIDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('jamii-offline-db', 1);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
```

### 🎨 `src/components/OfflineBadge.jsx`
```jsx
import { useState, useEffect } from 'react';
import { getPendingPosts } from '../db/offlineQueue';

export default function OfflineBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = async () => {
      const posts = await getPendingPosts();
      setCount(posts.length);
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold text-white bg-amber-500 rounded-full animate-pulse">
      {count}
    </span>
  );
}
```
**Integrate into `NavBar.jsx` or `Sidebar.jsx`:**
```jsx
import OfflineBadge from './OfflineBadge';
// ...
<NavItem to="/drafts">
  📝 Drafts <OfflineBadge />
</NavItem>
```

### ✅ Verify
1. `npm install idb`
2. DevTools → Application → IndexedDB → confirm `jamii-offline-db` exists
3. Toggle offline → submit form → check queue → go online → verify sync + badge clears

---

## 📊 2. Sentry + Custom Telemetry

### 📦 Install & Init
```bash
npm install @sentry/react @sentry/vite-plugin
```

### ⚙️ `vite.config.js`
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "jamii-link",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: { sourcemap: true },
});
```

### 🌐 `src/main.jsx`
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/.*\.jamii-link\.vercel\.app/],
    }),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

### 📏 `src/utils/telemetry.js`
```js
import * as Sentry from "@sentry/react";

export function trackMetric(name, value, tags = {}) {
  Sentry.metrics.distribution(name, value, {
    tags,
    unit: name.includes('latency') ? 'millisecond' : undefined,
  });
}

export function wrapFetch(url, options = {}) {
  const start = performance.now();
  return fetch(url, options)
    .then(res => {
      const latency = performance.now() - start;
      trackMetric('api.latency', latency, { url, status: res.status });
      if (!res.ok) {
        trackMetric('api.errors', 1, { url, status: res.status, method: options.method || 'GET' });
      }
      return res;
    })
    .catch(err => {
      trackMetric('api.errors', 1, { url, error: err.message });
      throw err;
    });
}

export function trackSyncResult(success) {
  trackMetric('sw.sync', success ? 1 : 0, { success });
}

export function trackCNF(cnf) {
  trackMetric('simulation.cnf', cnf, { threshold_met: cnf > 0.5 });
}
```

### 🔌 Usage Examples
```js
// Replace fetch in postsAPI.js
import { wrapFetch } from '../utils/telemetry';
export const getAll = () => wrapFetch('/api/posts');

// After simulation run
import { trackCNF } from '../utils/telemetry';
trackCNF(result.cnf);
```

### ✅ Verify
1. Add `VITE_SENTRY_DSN` & `SENTRY_AUTH_TOKEN` to `.env`
2. Trigger a 404 or network error → check Sentry dashboard
3. `Sentry.metrics` dashboard shows `api.latency`, `sw.sync`, `simulation.cnf`

---

## 🎭 3. Playwright E2E Suite

### 📦 Setup
```bash
npm install -D @playwright/test
npx playwright install
```

### ⚙️ `playwright.config.js`
```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 🧪 `e2e/critical-flow.spec.js`
```js
import { test, expect } from '@playwright/test';

test.describe('JamiiLink Critical Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Mock API for stable tests
    await page.route('**/api/posts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ posts: [{ _id: '1', content: 'Test post', author: 'Demo' }] })
      });
    });
  });

  test('auth → feed → offline draft → moderation report', async ({ page }) => {
    // 1. Auth
    await page.click('text=Login');
    await page.fill('input[placeholder="Email"]', 'test@jamii.link');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('nav')).toContainText('Welcome');

    // 2. Feed Loads
    await expect(page.locator('.feed-item')).toHaveCount(1);
    await expect(page.locator('.feed-item')).toContainText('Test post');

    // 3. Offline Draft
    await page.context().setOffline(true);
    await page.click('button:has-text("Post")');
    await page.fill('textarea', 'Offline draft');
    await page.click('button:has-text("Save Offline")');
    await expect(page.locator('.offline-badge')).toBeVisible();

    // 4. Go Online & Sync
    await page.context().setOffline(false);
    await page.waitForTimeout(2000); // Allow SW sync
    await expect(page.locator('.offline-badge')).not.toBeVisible();

    // 5. Moderation Report
    await page.click('.feed-item .report-btn');
    await expect(page.locator('.toast')).toContainText('Report submitted');
  });
});
```

### ✅ Run
```bash
npx playwright test e2e/critical-flow.spec.js --headed
# CI mode: npx playwright test --reporter=html
```

---

## 🛡️ 4. CSP + Rate Limiting (Vercel Middleware + Upstash)

### 📦 Install
```bash
npm install @upstash/ratelimit @upstash/redis
```

### 🌐 `middleware.js` (Root of project)
```js
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 req/min per IP
});

export async function middleware(request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://js.sentry-cdn.com;
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data: https:;
    connect-src 'self' https://api.jamii-link.vercel.app https://o*.ingest.sentry.io;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (!success) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  response.headers.set('X-RateLimit-Limit', limit);
  response.headers.set('X-RateLimit-Remaining', remaining);
  response.headers.set('X-RateLimit-Reset', reset);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 🔑 `.env`
```env
UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
SENTRY_AUTH_TOKEN=<token>
VITE_SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<id>
```

### ✅ Verify
1. `curl -I https://your-app.vercel.app` → check `content-security-policy`, `x-ratelimit-*`
2. Hit an API route 31 times in <60s → expect `429`
3. Sentry reports CSP violations in dashboard

---

## ✅ Final Integration Checklist

| Step | Command | Status |
|------|---------|--------|
| Install deps | `npm i idb @sentry/react @sentry/vite-plugin @upstash/ratelimit @upstash/redis` | ⏳ |
| Add env vars | `.env.local` → `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `UPSTASH_*` | ⏳ |
| Register SW sync | Ensure `main.jsx` calls `registerSW()` once | ⏳ |
| Wrap fetch | Replace `fetch()` → `wrapFetch()` in API layer | ⏳ |
| Deploy | `vercel deploy --prod` | ⏳ |
| Validate | `npx playwright test`, `curl -I`, Sentry dashboard, offline toggle | ⏳ |

---

### 🔜 What’s Next?
- Need the **`/drafts` UI page** to display & retry queued posts
- Want **Upstash Redis free-tier setup steps**
- Need **CSP nonce injection** for Vite dev mode