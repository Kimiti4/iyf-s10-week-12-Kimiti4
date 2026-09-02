#!/usr/bin/env node

/**
 * Regression Analysis — compares current vs baseline
 */

const fs = require('fs');
const path = require('path');

const BASELINE_PATH = path.join(__dirname, '../docs/audits/J025/baseline.json');
const CURRENT_PATH = path.join(__dirname, '../docs/audits/J025/current.json');
const REGRESSION_PATH = path.join(__dirname, '../docs/audits/J025/regression.json');

if (!fs.existsSync(BASELINE_PATH)) {
  console.error('❌ Baseline not found. Create baseline.json first.');
  process.exit(1);
}

if (!fs.existsSync(CURRENT_PATH)) {
  console.error('❌ Current measurements not found. Run: npm run perf:report');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
const current = JSON.parse(fs.readFileSync(CURRENT_PATH, 'utf8'));

const regression = {
  timestamp: new Date().toISOString(),
  baseline: baseline.buildInfo?.commit || 'unknown',
  current: current.buildInfo?.commit || 'unknown',
  comparisons: [],
  summary: { improved: 0, stable: 0, regressed: 0, unmeasurable: 0 }
};

function compare(metric, baselineVal, currentVal) {
  if (baselineVal === null || currentVal === null) {
    return { verdict: 'UNMEASURABLE', delta: null };
  }

  const delta = ((currentVal - baselineVal) / baselineVal) * 100;

  if (delta <= -5) { regression.summary.improved++; return { verdict: 'IMPROVED', delta }; }
  if (delta <= 5) { regression.summary.stable++; return { verdict: 'STABLE', delta }; }
  if (delta <= 15) { regression.summary.regressed++; return { verdict: 'ACCEPTABLE_REGRESSION', delta }; }
  regression.summary.regressed++;
  return { verdict: 'CRITICAL_REGRESSION', delta };
}

for (const metric of ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']) {
  const comparison = compare(metric, baseline.webVitals?.[metric]?.p75, current.webVitals?.[metric]?.p75);
  regression.comparisons.push({ category: 'Web Vitals', metric, baseline: baseline.webVitals?.[metric]?.p75, current: current.webVitals?.[metric]?.p75, ...comparison });
}

for (const metric of ['initialJS', 'initialCSS', 'largestChunk']) {
  const comparison = compare(metric, baseline.bundle?.[metric], current.bundle?.[metric]);
  regression.comparisons.push({ category: 'Bundle', metric, baseline: baseline.bundle?.[metric], current: current.bundle?.[metric], ...comparison });
}

for (const metric of ['requestCount', 'totalTransfer']) {
  const comparison = compare(metric, baseline.network?.[metric], current.network?.[metric]);
  regression.comparisons.push({ category: 'Network', metric, baseline: baseline.network?.[metric], current: current.network?.[metric], ...comparison });
}

for (const metric of ['longTaskCount', 'totalBlockingTime']) {
  const comparison = compare(metric, baseline.runtime?.[metric], current.runtime?.[metric]);
  regression.comparisons.push({ category: 'Runtime', metric, baseline: baseline.runtime?.[metric], current: current.runtime?.[metric], ...comparison });
}

fs.writeFileSync(REGRESSION_PATH, JSON.stringify(regression, null, 2));

console.log('📊 Regression Analysis Complete\n');
console.log(`  ✅ Improved: ${regression.summary.improved}`);
console.log(`  ➖ Stable: ${regression.summary.stable}`);
console.log(`  ⚠️  Regressed: ${regression.summary.regressed}`);
console.log(`  ❓ Unmeasurable: ${regression.summary.unmeasurable}`);

if (regression.summary.regressed > 0) {
  console.log('\n⚠️  Regressions detected:');
  regression.comparisons
    .filter(c => c.verdict.includes('REGRESSION'))
    .forEach(c => console.log(`  - ${c.category}.${c.metric}: ${c.delta?.toFixed(1)}%`));
}
