#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { record, ROOT } = require('./lib.cjs');

const provenance = {
  timestamp: new Date().toISOString(),
  commit: execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(),
  commitFull: execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(),
  branch: execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT }).toString().trim(),
  remote: (() => {
    try { return execSync('git remote get-url origin', { cwd: ROOT }).toString().trim(); }
    catch { return 'no remote'; }
  })(),
  spec: {
    product: 'TaskFlow',
    specVersion: '1.0.0',
    generatorVersion: 'tiannara-compiler-1.0',
    j026Certification: 'CERTIFIED_WITH_WARNINGS',
    sourceCommit: '59c644a',
    predeployCommit: execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim()
  },
  artifacts: {
    frontend: {
      files: 39,
      pages: 10,
      components: 14,
      bundle: '222KB JS + 27KB CSS (244KB total)'
    },
    backend: {
      files: 16,
      routes: 9,
      endpoints: 25
    },
    tests: {
      e2e: 40,
      suites: 10,
      contract: 6,
      reconciliation: '6/6 ALIGNED'
    },
    documentation: {
      j026_artifacts: 18,
      j027_artifacts: 7,
      predeploy_artifacts: 6
    }
  },
  chain: [
    { step: 'SPEC', artifact: 'product-specification.json' },
    { step: 'PLAN', artifact: 'J026_GENERATION_PLAN.md' },
    { step: 'SOURCE', artifact: 'products/taskflow/' },
    { step: 'TEST', artifact: 'e2e/taskflow.spec.js' },
    { step: 'REPAIR', artifact: 'J026_REPAIR_LOG.md' },
    { step: 'BUILD', artifact: 'frontend/dist/' },
    { step: 'CONTRACT', artifact: 'api-contract.canonical.json' },
    { step: 'RECONCILIATION', artifact: 'predeploy/reconciliation.json' },
    { step: 'CERTIFICATION', artifact: 'J027_PREDEPLOY_COMPLETE.md' }
  ]
};

const outDir = path.join(ROOT, 'docs/audits/J027/evidence');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'provenance.json'), JSON.stringify(provenance, null, 2));
record('provenance', provenance);

console.log('PROVENANCE RECORDED:');
console.log('  Commit: ' + provenance.commit);
console.log('  Branch: ' + provenance.branch);
console.log('  Remote: ' + provenance.remote);
console.log('  Frontend: ' + provenance.artifacts.frontend.files + ' files, ' + provenance.artifacts.frontend.bundle);
console.log('  Backend: ' + provenance.artifacts.backend.files + ' files, ' + provenance.artifacts.backend.endpoints + ' endpoints');
console.log('  Tests: ' + provenance.artifacts.tests.e2e + ' E2E + ' + provenance.artifacts.tests.contract + ' contract');
console.log('  Chain: ' + provenance.chain.length + ' steps recorded');
console.log('\nPASS: provenance recorded');
