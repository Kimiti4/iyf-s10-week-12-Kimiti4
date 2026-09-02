#!/usr/bin/env node
/**
 * J-025 Bundle Size Regression Check
 * Compares current build output against baseline budgets.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const DIST_DIR = join(process.cwd(), 'dist', 'assets');
const REPORT_DIR = join(process.cwd(), 'docs', 'audits', 'J025');
const BUNDLE_BASELINE = join(REPORT_DIR, 'bundle-baseline.json');

const BUDGETS = {
  totalJs: 2000 * 1024,      // 2000KB total JS (includes lazy chunks like html2pdf)
  totalCss: 300 * 1024,       // 300KB total CSS
  largestChunk: 1000 * 1024,  // 1000KB largest chunk (html2pdf is lazy-loaded)
  chunkCount: 60,              // max chunks
};

function getBundleStats() {
  if (!existsSync(DIST_DIR)) {
    console.error('ERROR: dist/assets/ not found. Run `npm run build` first.');
    process.exit(1);
  }
  const files = readdirSync(DIST_DIR);
  const jsFiles = files.filter(f => extname(f) === '.js');
  const cssFiles = files.filter(f => extname(f) === '.css');
  const jsSizes = jsFiles.map(f => ({ name: f, size: statSync(join(DIST_DIR, f)).size }));
  const cssSizes = cssFiles.map(f => ({ name: f, size: statSync(join(DIST_DIR, f)).size }));
  const totalJs = jsSizes.reduce((sum, f) => sum + f.size, 0);
  const totalCss = cssSizes.reduce((sum, f) => sum + f.size, 0);
  const largestJs = Math.max(...jsSizes.map(f => f.size), 0);
  const largestCss = Math.max(...cssSizes.map(f => f.size), 0);
  return {
    timestamp: new Date().toISOString(),
    js: { files: jsSizes.sort((a, b) => b.size - a.size), total: totalJs, count: jsFiles.length, largest: largestJs },
    css: { files: cssSizes.sort((a, b) => b.size - a.size), total: totalCss, count: cssFiles.length, largest: largestCss },
    total: totalJs + totalCss,
  };
}

function evaluate(stats) {
  const results = [];
  results.push({ metric: 'Total JS', value: stats.js.total, budget: BUDGETS.totalJs, status: stats.js.total <= BUDGETS.totalJs ? 'PASS' : 'FAIL' });
  results.push({ metric: 'Total CSS', value: stats.css.total, budget: BUDGETS.totalCss, status: stats.css.total <= BUDGETS.totalCss ? 'PASS' : 'FAIL' });
  results.push({ metric: 'Largest JS chunk', value: stats.js.largest, budget: BUDGETS.largestChunk, status: stats.js.largest <= BUDGETS.largestChunk ? 'PASS' : 'FAIL' });
  results.push({ metric: 'JS chunk count', value: stats.js.count, budget: BUDGETS.chunkCount, status: stats.js.count <= BUDGETS.chunkCount ? 'PASS' : 'FAIL' });
  return results;
}

console.log('J-025 Bundle Size Check');
console.log('======================\n');

const stats = getBundleStats();
const evals = evaluate(stats);

for (const e of evals) {
  const val = e.metric.includes('count') ? e.value : `${Math.round(e.value / 1024)}KB`;
  const bud = e.metric.includes('count') ? e.budget : `${Math.round(e.budget / 1024)}KB`;
  console.log(`  ${e.status === 'PASS' ? '✓' : '✗'} ${e.metric}: ${val} (budget: ${bud})`);
}

console.log(`\n  JS: ${Math.round(stats.js.total / 1024)}KB in ${stats.js.count} chunks`);
console.log(`  CSS: ${Math.round(stats.css.total / 1024)}KB in ${stats.css.count} chunks`);
console.log(`  Total: ${Math.round(stats.total / 1024)}KB`);

if (existsSync(BUNDLE_BASELINE)) {
  const prev = JSON.parse(readFileSync(BUNDLE_BASELINE, 'utf-8'));
  const jsChange = ((stats.js.total - prev.js.total) / prev.js.total) * 100;
  const cssChange = ((stats.css.total - prev.css.total) / prev.css.total) * 100;
  console.log(`\n  JS change: ${jsChange > 0 ? '+' : ''}${Math.round(jsChange)}% from baseline`);
  console.log(`  CSS change: ${cssChange > 0 ? '+' : ''}${Math.round(cssChange)}% from baseline`);
}

if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(BUNDLE_BASELINE, JSON.stringify(stats, null, 2));

console.log('\n  Top 10 largest JS files:');
stats.js.files.slice(0, 10).forEach((f, i) => {
  console.log(`    ${i + 1}. ${f.name}: ${Math.round(f.size / 1024)}KB`);
});

const failed = evals.some(e => e.status === 'FAIL');
process.exit(failed ? 1 : 0);
