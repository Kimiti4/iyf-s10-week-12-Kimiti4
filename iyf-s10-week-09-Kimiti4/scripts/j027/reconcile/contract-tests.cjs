#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
};

const feInventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/audits/J027/predeploy/frontend-inventory.json'), 'utf8'));
const beInventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/audits/J027/predeploy/backend-inventory.json'), 'utf8'));

console.log('-- CONTRACT TEST LAYER 1: INVENTORY COHERENCE --');
console.log('  (proves frontend calls have matching backend route registrations)');

const normalizeBackend = (p) => p.replace(/^\/api\/tf/, '').replace(/\/:[a-zA-Z]+/g, '/:p');
const normalizeFrontend = (p) => p.replace(/\/:[a-zA-Z]+/g, '/:p').split('?')[0];

const backendPaths = new Set(beInventory.routes.map(r => normalizeBackend(r.full)));
const backendMethods = new Map();
beInventory.routes.forEach(r => {
  const path = normalizeBackend(r.full);
  if (!backendMethods.has(path)) backendMethods.set(path, new Set());
  backendMethods.get(path).add(r.method);
});

let feCallsCovered = 0;
let feCallsUncovered = 0;

feInventory.forEach(call => {
  const fePath = normalizeFrontend(call.path);
  const hasBackend = backendPaths.has(fePath) && backendMethods.get(fePath).has(call.method);
  if (hasBackend) {
    feCallsCovered++;
  } else {
    feCallsUncovered++;
    check('frontend call covered: ' + call.method + ' ' + call.path, false, 'no matching backend route');
  }
});

check('all frontend calls have backend coverage', feCallsUncovered === 0, feCallsCovered + '/' + (feCallsCovered + feCallsUncovered) + ' covered');

console.log('\n-- CONTRACT TEST LAYER 2: M05–M10 RECONCILIATION --');
const recon = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/audits/J027/predeploy/reconciliation.json'), 'utf8'));
recon.forEach(r => {
  const ok = r.classification === 'ALIGNED' || r.classification === 'ADAPTER_PRESENT' || r.classification === 'MISMATCH_REPAIRED';
  check(r.id + ' ' + r.method + ' ' + r.flat, ok, r.classification + ' — ' + r.evidence);
});

console.log('\n-- CONTRACT TEST LAYER 3: NO DEAD ROUTES --');
const KNOWN_ORPHANS = [
  { path: '/projects/:id/activity', reason: 'activity log data is provided via dashboard endpoint instead' }
];

const isKnownOrphan = (path) => KNOWN_ORPHANS.some(o => normalizeBackend(o.path) === normalizeBackend(path));

const deadRoutes = beInventory.routes.filter(r => {
  const norm = normalizeBackend(r.full);
  if (norm === '/auth/register' || norm === '/auth/login' || norm === '/auth/me' || norm === '/health' || norm === '/dashboard' || norm === '/search') return false;
  if (isKnownOrphan(r.full)) return false;
  return !feInventory.some(fe => normalizeFrontend(fe.path) === norm);
});
if (deadRoutes.length > 0) {
  check('no dead routes (all backend routes called by frontend)', false, deadRoutes.length + ' orphan routes: ' + deadRoutes.map(r => r.method + ' ' + r.full).join(', '));
} else {
  check('no dead routes', true);
}

const outDir = path.join(ROOT, 'docs/audits/J027/predeploy');
fs.writeFileSync(path.join(outDir, 'contract-tests.json'), JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));

const fails = results.filter(r => r.status === 'FAIL');
console.log('\n' + (fails.length ? 'FAIL: ' + fails.length + ' contract failures' : 'PASS: contract proof passed'));
process.exit(fails.length ? 1 : 0);
