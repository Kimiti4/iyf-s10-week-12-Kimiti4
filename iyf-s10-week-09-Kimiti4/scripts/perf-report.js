#!/usr/bin/env node
/**
 * J-025 Performance Report Generator
 * Reads baseline.json and produces a human-readable regression report.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const REPORT_DIR = join(process.cwd(), 'docs', 'audits', 'J025');
const BASELINE_FILE = join(REPORT_DIR, 'baseline.json');
const CURRENT_FILE = join(REPORT_DIR, 'current.json');
const REGRESSION_FILE = join(REPORT_DIR, 'regression-report.md');

function formatMs(ms) {
  if (ms === 0) return '-';
  return `${Math.round(ms)}ms`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '-';
  return `${Math.round(bytes / 1024)}KB`;
}

function compareBaseline(baseline, current) {
  const regressions = [];
  const improvements = [];
  for (const route of current.results) {
    const base = baseline.results.find(r => r.route === route.route);
    if (!base || !base.metrics || !route.metrics) continue;
    const metrics = ['ttfb', 'fcp', 'lcp', 'cls', 'loadTime'];
    for (const metric of metrics) {
      const baseVal = base.metrics[metric];
      const curVal = route.metrics[metric];
      if (baseVal === 0 || curVal === 0) continue;
      const change = ((curVal - baseVal) / baseVal) * 100;
      if (change > 20) {
        regressions.push({ route: route.route, metric, baseline: baseVal, current: curVal, change: Math.round(change) });
      } else if (change < -20) {
        improvements.push({ route: route.route, metric, baseline: baseVal, current: curVal, change: Math.round(change) });
      }
    }
  }
  return { regressions, improvements };
}

function generateReport(baseline, current, comparison) {
  return `# J-025 Performance Regression Report

**Generated:** ${new Date().toISOString()}
**Baseline:** ${baseline.baseline}
**Current:** ${current?.baseline || 'N/A'}

## Regression Summary

| Category | Count |
|---|---|
| Regressions (>20% worse) | ${comparison.regressions.length} |
| Improvements (>20% better) | ${comparison.improvements.length} |

## Regressions

${comparison.regressions.length === 0 ? 'No regressions detected.' :
  '| Route | Metric | Baseline | Current | Change |\n|---|---|---|---|---|\n' +
  comparison.regressions.map(r =>
    `| ${r.route} | ${r.metric} | ${formatMs(r.baseline)} | ${formatMs(r.current)} | +${r.change}% |`
  ).join('\n')}

## Improvements

${comparison.improvements.length === 0 ? 'No improvements detected.' :
  '| Route | Metric | Baseline | Current | Change |\n|---|---|---|---|---|\n' +
  comparison.improvements.map(r =>
    `| ${r.route} | ${r.metric} | ${formatMs(r.baseline)} | ${formatMs(r.current)} | ${r.change}% |`
  ).join('\n')}

## Current Baseline

| Route | TTFB | FCP | LCP | CLS | Load | Verdict |
|---|---|---|---|---|---|---|
${(current?.results || []).filter(r => r.metrics).map(r =>
  `| ${r.route} | ${formatMs(r.metrics.ttfb)} | ${formatMs(r.metrics.fcp)} | ${formatMs(r.metrics.lcp)} | ${r.metrics.cls} | ${formatMs(r.metrics.loadTime)} | ${r.overall} |`
).join('\n')}
`;
}

const baseline = existsSync(BASELINE_FILE) ? JSON.parse(readFileSync(BASELINE_FILE, 'utf-8')) : null;
const current = existsSync(CURRENT_FILE) ? JSON.parse(readFileSync(CURRENT_FILE, 'utf-8')) : null;

if (!baseline) {
  console.error('No baseline found. Run perf-check.js first.');
  process.exit(1);
}

const comparison = current ? compareBaseline(baseline, current) : { regressions: [], improvements: [] };
const report = generateReport(baseline, current, comparison);

writeFileSync(REGRESSION_FILE, report);
console.log(`Report generated: ${REGRESSION_FILE}`);

if (comparison.regressions.length > 0) {
  console.log(`\n⚠ ${comparison.regressions.length} regressions detected!`);
  process.exit(1);
}
