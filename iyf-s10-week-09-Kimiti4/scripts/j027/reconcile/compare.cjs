#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const PRE = path.join(ROOT, 'docs/audits/J027/predeploy');

const fe = JSON.parse(fs.readFileSync(path.join(PRE, 'frontend-inventory.json'), 'utf8'));
const be = JSON.parse(fs.readFileSync(path.join(PRE, 'backend-inventory.json'), 'utf8')).routes;

const hasFrontend = (method, p) => {
  const withoutPrefix = p.replace(/^\/api\/tf/, '');
  const normalizePath = (path) => path.replace(/\/:[a-zA-Z]+/g, '/:p').split('?')[0];
  const target = normalizePath(withoutPrefix);
  return fe.find(e => {
    if (e.method !== method) return false;
    return normalizePath(e.path) === target;
  });
};
const hasBackend = (method, p) => {
  const normalizePath = (path) => path.replace(/\/:[a-zA-Z]+/g, '/:p');
  const target = normalizePath(p);
  return be.find(e => e.method === method && normalizePath(e.full) === target);
};

const DISPUTES = [
  { id: 'M05', method: 'GET', flat: '/api/tf/projects', nested: '/api/tf/orgs/:p/projects' },
  { id: 'M06', method: 'POST', flat: '/api/tf/projects', nested: '/api/tf/orgs/:p/projects' },
  { id: 'M07', method: 'GET', flat: '/api/tf/projects/:p/tasks', nested: '/api/tf/orgs/:p/projects/:p/tasks' },
  { id: 'M08', method: 'GET', flat: '/api/tf/tasks/:p', nested: '/api/tf/orgs/:p/projects/:p/tasks/:p' },
  { id: 'M09', method: 'PUT', flat: '/api/tf/tasks/:p', nested: '/api/tf/orgs/:p/projects/:p/tasks/:p' },
  { id: 'M10', method: 'PUT', flat: '/api/tf/tasks/:p/move', nested: '/api/tf/orgs/:p/projects/:p/tasks/:p/move' }
];

const results = DISPUTES.map(d => {
  const feHit = hasFrontend(d.method, d.flat);
  const beFlat = hasBackend(d.method, d.flat);
  const beNested = hasBackend(d.method, d.nested);

  let classification, evidence;
  if (!feHit) {
    classification = 'UNKNOWN';
    evidence = 'frontend call not found in src/api';
  } else if (beFlat && beNested) {
    classification = 'ADAPTER_PRESENT';
    evidence = 'flat: ' + beFlat.file + ':' + beFlat.line + ' + nested: ' + beNested.file + ':' + beNested.line;
  } else if (beFlat) {
    classification = 'ALIGNED';
    evidence = 'flat route: ' + beFlat.file + ':' + beFlat.line;
  } else if (beNested) {
    classification = 'MISMATCH_REMAINS';
    evidence = 'frontend calls flat (' + feHit.file + ':' + feHit.line + '); backend only nested (' + beNested.file + ':' + beNested.line + ')';
  } else {
    classification = 'UNKNOWN';
    evidence = 'neither form found in backend inventory';
  }
  return Object.assign({}, d, {
    frontend: feHit ? feHit.file + ':' + feHit.line : null,
    classification: classification,
    evidence: evidence
  });
});

fs.writeFileSync(path.join(PRE, 'reconciliation.json'), JSON.stringify(results, null, 2));

console.log('\nRECONCILIATION (M05–M10):');
results.forEach(r => console.log('  ' + r.id + '  ' + r.classification.padEnd(18) + ' ' + r.evidence));

const bad = results.filter(r => ['MISMATCH_REMAINS', 'UNKNOWN'].indexOf(r.classification) >= 0);
if (bad.length) {
  console.log('\nFAIL: ' + bad.length + ' unresolved — bounded repair required');
  process.exit(1);
} else {
  console.log('\nPASS: all reconciled');
  process.exit(0);
}
