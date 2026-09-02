#!/usr/bin/env node
/**
 * J-025 Performance CI Gate
 * Runs Playwright to collect performance metrics and checks against budgets.
 *
 * Usage: node scripts/perf-check.js [--report] [--verbose]
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const REPORT_DIR = join(process.cwd(), 'docs', 'audits', 'J025');
const BASELINE_FILE = join(REPORT_DIR, 'baseline.json');
const BUDGETS = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  loadTime: { good: 1000, poor: 3000, unit: 'ms' },
};

const CRITICAL_ROUTES = [
  '/',
  '/login',
  '/register',
  '/discover',
  '/alerts',
  '/profile',
  '/jams',
  '/reels',
  '/settings',
];

function evaluate(metric, value) {
  const budget = BUDGETS[metric];
  if (!budget) return 'UNKNOWN';
  if (value <= budget.good) return 'PASS';
  if (value <= budget.poor) return 'WARN';
  return 'FAIL';
}

async function measureRoute(page, route) {
  const start = Date.now();
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paints = performance.getEntriesByType('paint');
    const fcp = paints.find(p => p.name === 'first-contentful-paint');
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.initiatorType === 'script');
    const totalJsTransfer = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    return {
      ttfb: nav ? nav.responseStart - nav.requestStart : 0,
      fcp: fcp ? fcp.startTime : 0,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
      loadTime: nav ? nav.loadEventEnd - nav.startTime : 0,
      totalJsTransfer,
      resourceCount: resources.length,
    };
  });
  metrics.loadTime = Date.now() - start;

  let lcp = 0;
  try {
    const lcpEntry = await page.evaluate(() => {
      return new Promise((resolve) => {
        let last = 0;
        const obs = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) last = entries[entries.length - 1].startTime;
        });
        obs.observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => { obs.disconnect(); resolve(last); }, 3000);
      });
    });
    lcp = lcpEntry;
  } catch { lcp = 0; }

  let cls = 0;
  try {
    cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let value = 0;
        const obs = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) value += e.value;
          }
        });
        obs.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => { obs.disconnect(); resolve(value); }, 2000);
      });
    });
  } catch { cls = 0; }

  return {
    route,
    url: page.url(),
    metrics: {
      ttfb: Math.round(metrics.ttfb),
      fcp: Math.round(metrics.fcp),
      lcp: Math.round(lcp),
      cls: Math.round(cls * 1000) / 1000,
      loadTime: metrics.loadTime,
      domContentLoaded: Math.round(metrics.domContentLoaded),
      totalJsTransfer: metrics.totalJsTransfer,
      resourceCount: metrics.resourceCount,
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const reportOnly = args.includes('--report');

  console.log('J-025 Performance CI Gate');
  console.log('========================\n');

  const distPath = join(process.cwd(), 'dist');
  if (!existsSync(distPath)) {
    console.error('ERROR: dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }

  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await context.addInitScript(() => {
    localStorage.setItem('token', 'perf-test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'perf-test-user', username: 'perfuser',
      email: 'perf@jamii.link', role: 'user',
    }));
  });
  await context.route('**/api/auth/me', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, user: { id: 'perf-test-user', username: 'perfuser', role: 'user' } }) })
  );
  await context.route('**/api/posts', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ posts: [], total: 0 }) })
  );
  await context.route('**/api/posts/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }) })
  );
  await context.route('**/api/alerts', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [] }) })
  );
  await context.route('**/api/alerts/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }) })
  );
  await context.route('**/api/jams', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ jams: [] }) })
  );
  await context.route('**/api/jams/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }) })
  );
  await context.route('**/api/reels', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ reels: [] }) })
  );
  await context.route('**/api/notifications', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ notifications: [] }) })
  );
  await context.route('**/api/discover/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
  await context.route('**/api/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: '{"success":true,"data":[]}' })
  );
  await context.route('**/socket.io/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' })
  );

  const results = [];

  for (const route of CRITICAL_ROUTES) {
    process.stdout.write(`  Measuring ${route}... `);
    try {
      await page.goto(`http://localhost:5174${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const result = await measureRoute(page, route);
      results.push(result);

      const verdict = {
        ttfb: evaluate('TTFB', result.metrics.ttfb),
        fcp: evaluate('FCP', result.metrics.fcp),
        lcp: evaluate('LCP', result.metrics.lcp),
        cls: evaluate('CLS', result.metrics.cls),
      };
      result.verdict = verdict;

      const overall = Object.values(verdict).includes('FAIL') ? 'FAIL' :
                      Object.values(verdict).includes('WARN') ? 'WARN' : 'PASS';
      result.overall = overall;

      console.log(`${overall} (TTFB:${result.metrics.ttfb}ms FCP:${result.metrics.fcp}ms LCP:${result.metrics.lcp}ms CLS:${result.metrics.cls})`);

      if (verbose) {
        console.log(`    DOMContentLoaded: ${result.metrics.domContentLoaded}ms`);
        console.log(`    Resources: ${result.metrics.resourceCount}, JS Transfer: ${Math.round(result.metrics.totalJsTransfer/1024)}KB`);
      }
    } catch (err) {
      console.log(`ERROR (${err.message.substring(0, 50)})`);
      results.push({ route, error: err.message, overall: 'ERROR' });
    }
  }

  await browser.close();

  const passed = results.filter(r => r.overall === 'PASS').length;
  const warned = results.filter(r => r.overall === 'WARN').length;
  const failed = results.filter(r => r.overall === 'FAIL').length;
  const errors = results.filter(r => r.overall === 'ERROR').length;

  console.log(`\nSummary: ${passed} PASS, ${warned} WARN, ${failed} FAIL, ${errors} ERROR`);

  const report = {
    timestamp: new Date().toISOString(),
    baseline: '3cfe995',
    budgets: BUDGETS,
    results,
    summary: { passed, warned, failed, errors, total: results.length },
  };

  writeFileSync(join(REPORT_DIR, 'baseline.json'), JSON.stringify(report, null, 2));
  console.log(`\nResults saved to ${join(REPORT_DIR, 'baseline.json')}`);

  const md = `# J-025 Performance Baseline

**Date:** ${report.timestamp}
**Baseline:** ${report.baseline}
**Routes Measured:** ${results.length}

## Budgets

| Metric | Good | Poor |
|---|---|---|
| LCP | ${BUDGETS.LCP.good}ms | ${BUDGETS.LCP.poor}ms |
| FCP | ${BUDGETS.FCP.good}ms | ${BUDGETS.FCP.poor}ms |
| TTFB | ${BUDGETS.TTFB.good}ms | ${BUDGETS.TTFB.poor}ms |
| CLS | ${BUDGETS.CLS.good} | ${BUDGETS.CLS.poor} |

## Results

| Route | TTFB | FCP | LCP | CLS | Load | Verdict |
|---|---|---|---|---|---|---|
${results.filter(r => r.metrics).map(r =>
  `| ${r.route} | ${r.metrics.ttfb}ms | ${r.metrics.fcp}ms | ${r.metrics.lcp}ms | ${r.metrics.cls} | ${r.metrics.loadTime}ms | ${r.overall} |`
).join('\n')}

## Summary

- **PASS:** ${passed}
- **WARN:** ${warned}
- **FAIL:** ${failed}
- **ERROR:** ${errors}
`;

  writeFileSync(join(REPORT_DIR, 'baseline.md'), md);
  console.log(`Report saved to ${join(REPORT_DIR, 'baseline.md')}`);

  process.exit(failed > 0 || errors > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
