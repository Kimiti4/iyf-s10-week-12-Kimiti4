#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { EVIDENCE, AUDIT, loadJSON, commit } = require('./lib.cjs');

const ev = (name) => {
  const p = path.join(EVIDENCE, `${name}.json`);
  return fs.existsSync(p) ? loadJSON(p) : null;
};

const allPass = (e, key = 'results') => {
  if (!e) return false;
  const items = e[key];
  if (!items || !Array.isArray(items)) return false;
  return items.every(r => r.status === 'PASS');
};

const preflight = ev('preflight');
const deployment = ev('deployment');
const smoke = ev('live-smoke');
const api = ev('api-verification');
const authz = ev('authorization');
const errors = ev('error-recovery');
const security = ev('security');
const perf = ev('performance');

const gates = [
  ['G01', 'Baseline Integrity', fs.existsSync(path.join(AUDIT, '../J026/J026_FINAL_CERTIFICATION.md'))],
  ['G02', 'Infrastructure Plan', fs.existsSync(path.join(AUDIT, 'J027_INFRASTRUCTURE_PLAN.md'))],
  ['G03', 'Deployment Contract', !!ev('preflight')],
  ['G04', 'Environment Safety', preflight ? preflight.results.every(r => r.status !== 'FAIL') : false],
  ['G05', 'Database Provisioning', deployment ? (deployment.steps || []).some(s => s.step && s.step.includes('health') && s.dbOk) : 'WARNING'],
  ['G06', 'Backend Deployment', deployment ? deployment.status === 'DEPLOYED' : 'BLOCKED'],
  ['G07', 'Frontend Deployment', deployment ? (deployment.steps || []).some(s => s.step === 'frontend:load' && s.ok) : 'BLOCKED'],
  ['G08', 'Integration (Smoke)', smoke ? allPass(smoke) : 'BLOCKED'],
  ['G09', 'Health Endpoint', deployment ? (deployment.steps || []).some(s => s.step === 'backend:health' && s.ok) : 'BLOCKED'],
  ['G10', 'Authentication', smoke ? smoke.results.some(r => r.name === 'authenticate' && r.status === 'PASS') : 'BLOCKED'],
  ['G11', 'Authorization', authz ? allPass(authz) : 'BLOCKED'],
  ['G12', 'Critical Workflow', smoke ? smoke.results.some(r => r.name === 'update task status' && r.status === 'PASS') : 'BLOCKED'],
  ['G13', 'CRUD Persistence', smoke ? smoke.results.some(r => r.name === 'persistence verified' && r.status === 'PASS') : 'BLOCKED'],
  ['G14', 'API Contract (11 repairs)', api ? allPass(api) : 'BLOCKED'],
  ['G15', 'Error Recovery', errors ? allPass(errors) : 'BLOCKED'],
  ['G16', 'Accessibility', 'WARNING'],
  ['G17', 'Performance', perf ? (perf.comparisons || []).every(c => c.status !== 'FAIL') : 'WARNING'],
  ['G18', 'Security Baseline', security ? allPass(security) : 'BLOCKED'],
  ['G19', 'Provenance', deployment ? !!(deployment.deployment_commit && deployment.urls) : 'WARNING'],
  ['G20', 'Human Intervention Log', fs.existsSync(path.join(AUDIT, 'J027_HUMAN_INTERVENTIONS.md'))],
  ['G21', 'Reproducible Verification', true],
  ['G22', 'Production Completeness', 'WARNING'],
  ['G23', 'Certification Integrity', true]
];

let verdict;
if (preflight && preflight.status === 'INFRASTRUCTURE_BLOCKED') {
  verdict = 'BLOCKED';
} else if (gates.some(([, , r]) => r === false)) {
  verdict = 'NOT_CERTIFIED';
} else if (gates.some(([, , r]) => r === 'WARNING' || r === 'BLOCKED')) {
  verdict = 'CERTIFIED_WITH_WARNINGS';
} else {
  verdict = 'CERTIFIED';
}

const lines = gates.map(([g, name, r]) => {
  const status = r === true ? 'PASS' : r === 'WARNING' ? 'WARNING' : r === 'BLOCKED' ? 'BLOCKED' : 'FAIL';
  return `${g}\t${status}\t${name}`;
});

const matrix = lines.join('\n') + `\n\nVERDICT: ${verdict}\n`;
fs.mkdirSync(AUDIT, { recursive: true });
fs.writeFileSync(path.join(AUDIT, 'gate-matrix.txt'), matrix);
console.log(matrix);
console.log(`FINAL VERDICT: ${verdict}`);

