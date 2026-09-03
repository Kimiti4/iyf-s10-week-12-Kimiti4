#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const E2E = path.join(ROOT, 'products/taskflow/frontend/e2e');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (/\.(js|ts)$/.test(e.name)) return [p];
    return [];
  });
}

const findings = walk(E2E).map(f => {
  const src = fs.readFileSync(f, 'utf8');
  const catchAll = /route\(\s*['"]\*\*\/api\/\*\*['"]/.test(src);
  const scoped = [];
  const routeRegex = /route\(\s*['"](\*\*\/api\/[a-zA-Z/:\-_]+)['"]/g;
  let m;
  while ((m = routeRegex.exec(src)) !== null) {
    scoped.push(m[1]);
  }
  return { file: path.relative(ROOT, f), catchAllMocksEverything: catchAll, scopedMocks: scoped };
});

const outDir = path.join(ROOT, 'docs/audits/J027/predeploy');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'mock-audit.json'), JSON.stringify(findings, null, 2));

console.log('MOCK EXPOSURE AUDIT:');
findings.forEach(f => {
  const icon = f.catchAllMocksEverything ? 'CONTAMINATED' : 'OK';
  console.log('  [' + icon + '] ' + f.file + (f.scopedMocks.length ? ' scoped:' + f.scopedMocks.join(',') : ''));
});

const contaminated = findings.filter(f => f.catchAllMocksEverything);
if (contaminated.length) {
  console.log('\nWARNING: ' + contaminated.length + ' E2E file(s) use catch-all API mocks.');
  console.log('   J-026 API-alignment evidence for these suites is DOWNGRADED to "verified against mock".');
  console.log('   contract-tests.js + reconciliation.json are the true alignment proof.');
} else {
  console.log('\nNo catch-all mocks found. All mocks are scoped.');
}
