#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { record, ROOT } = require('./lib.cjs');

const FRONTEND = path.join(ROOT, 'products/taskflow/frontend');
const DIST = path.join(FRONTEND, 'dist');
const ASSETS = path.join(DIST, 'assets');

const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'products/taskflow/deployment/deployment-contract.json'), 'utf8'));
const perfContractPath = path.join(ROOT, 'docs/audits/J025/performance-contract.json');

let perfContract = null;
if (fs.existsSync(perfContractPath)) {
  perfContract = JSON.parse(fs.readFileSync(perfContractPath, 'utf8'));
}

const results = [];
const budgets = perfContract && perfContract.budgets ? perfContract.budgets : {
  webVitals: { LCP: { target: 2500, failure: 4000 }, FCP: { target: 1800, failure: 3000 }, CLS: { target: 0.1, failure: 0.25 }, TTFB: { target: 800, failure: 1800 } },
  bundle: { initialJS: { target: 250, failure: 500 }, initialCSS: { target: 50, failure: 100 }, largestChunk: { target: 200, failure: 500 } }
};

function check(name, ok, detail) {
  results.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
}

console.log('-- PERFORMANCE BASELINE (local build) --');

if (!fs.existsSync(ASSETS)) {
  check('dist exists', false, 'no dist/assets directory');
  record('performance', { results });
  process.exit(1);
}

const files = fs.readdirSync(ASSETS);
const jsFiles = files.filter(f => f.endsWith('.js'));
const cssFiles = files.filter(f => f.endsWith('.css'));

let totalJS = 0;
let totalCSS = 0;
let largestJS = 0;
let largestCSS = 0;

jsFiles.forEach(f => {
  const sizeKB = fs.statSync(path.join(ASSETS, f)).size / 1024;
  totalJS += sizeKB;
  if (sizeKB > largestJS) largestJS = sizeKB;
});
cssFiles.forEach(f => {
  const sizeKB = fs.statSync(path.join(ASSETS, f)).size / 1024;
  totalCSS += sizeKB;
  if (sizeKB > largestCSS) largestCSS = sizeKB;
});

const largestChunk = Math.max(largestJS, largestCSS);
const totalBundle = totalJS + totalCSS;

check('Total JS within budget', totalJS <= budgets.bundle.initialJS.failure, totalJS.toFixed(2) + 'KB / ' + budgets.bundle.initialJS.failure + 'KB budget');
check('Total CSS within budget', totalCSS <= budgets.bundle.initialCSS.failure, totalCSS.toFixed(2) + 'KB / ' + budgets.bundle.initialCSS.failure + 'KB budget');
check('Largest chunk within budget', largestChunk <= budgets.bundle.largestChunk.failure, largestChunk.toFixed(2) + 'KB / ' + budgets.bundle.largestChunk.failure + 'KB budget');
check('JS chunk count', jsFiles.length <= 60, jsFiles.length + ' chunks');
check('Total bundle size', totalBundle <= 600, totalBundle.toFixed(2) + 'KB total');

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const preloadHints = (html.match(/<link[^>]+rel=["']preload["']/g) || []).length;
check('HTML has preload hints', preloadHints > 0, preloadHints + ' preload links');

const modulePreloads = (html.match(/modulepreload/g) || []).length;
check('HTML has modulepreload', modulePreloads > 0, modulePreloads + ' modulepreloads');

const initialJS = jsFiles.filter(f => {
  const content = fs.readFileSync(path.join(ASSETS, f), 'utf8');
  return content.length < 50000;
});
const initialCSS = cssFiles.length;
check('Lazy loading detected (chunks under 50KB)', initialJS.length > 1, initialJS.length + ' small chunks (code-split)');

const metrics = {
  totalJS: +totalJS.toFixed(2),
  totalCSS: +totalCSS.toFixed(2),
  largestChunk: +largestChunk.toFixed(2),
  totalBundle: +totalBundle.toFixed(2),
  jsChunkCount: jsFiles.length,
  cssChunkCount: cssFiles.length,
  preloadHints: preloadHints
};

record('performance', {
  results,
  metrics,
  budgets,
  scope: 'LOCAL BUILD MEASUREMENT (not live Web Vitals)',
  environment: 'build',
  note: 'Live Web Vitals measurement available via npm run j027:perf when deployed'
});

const fails = results.filter(r => r.status === 'FAIL');
console.log('\n' + (fails.length ? 'WARN: ' + fails.length + ' perf findings' : 'PASS: performance budget met'));
process.exit(0);
