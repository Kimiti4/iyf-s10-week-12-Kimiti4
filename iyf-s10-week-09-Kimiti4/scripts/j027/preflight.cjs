#!/usr/bin/env node
const { contract, envContract, record, urls } = require('./lib.cjs');

const c = contract().production;
const ec = envContract().variables;
const results = [];
let blocked = false;

// 1. Required variable presence (names only — values never printed)
const requiredVars = [...c.required_server_variables, ...c.required_public_variables, 'TASKFLOW_FRONTEND_URL', 'TASKFLOW_BACKEND_URL'];
for (const name of requiredVars) {
  const present = !!process.env[name];
  const req = ec.find(v => v.name === name)?.requirement;
  results.push({ check: `env:${name}`, status: present ? 'PASS' : (req === 'REQUIRED' ? 'FAIL' : 'WARN') });
  if (!present && req === 'REQUIRED') blocked = true;
}

// 2. Safety: public vars must not carry secrets (value inspected, never printed)
const vite = process.env.VITE_API_URL || '';
results.push({ check: 'VITE_API_URL is https', status: vite.startsWith('https://') ? 'PASS' : (vite === '' ? 'FAIL' : 'FAIL') });
results.push({
  check: 'VITE_API_URL contains no secret material',
  status: /secret|password|token=|:.*@/.test(vite) ? 'FAIL' : 'PASS'
});

// 3. CORS must equal frontend origin (no wildcard)
const { frontend, backend } = urls();
const cors = process.env.CORS_ORIGIN;
results.push({ check: 'CORS_ORIGIN is set', status: cors ? 'PASS' : 'FAIL' });
if (!cors) blocked = true;
results.push({ check: 'CORS_ORIGIN is not wildcard', status: cors === '*' ? 'FAIL' : 'PASS' });

// 4. Provider authorization detection (presence/exit-code only)
const providerAuth = {
  vercel: !!process.env.VERCEL_TOKEN,
  railway: !!process.env.RAILWAY_TOKEN,
  deploy_opt_in: process.env.TIANNARA_DEPLOY_AUTHORIZED === 'true',
  migrate_opt_in: process.env.TIANNARA_MIGRATE_AUTHORIZED === 'true'
};
const hasProviderAuth = providerAuth.vercel || providerAuth.railway || providerAuth.deploy_opt_in;
results.push({ check: 'provider authorization available', status: hasProviderAuth ? 'PASS' : 'BLOCKED' });

if (!hasProviderAuth) blocked = true;

const status = blocked ? 'INFRASTRUCTURE_BLOCKED' : 'READY';
record('preflight', { status, results, providerAuth, urls: { frontend, backend } });

console.log(`PREFLIGHT: ${status}`);
results.forEach(r => {
  const icon = r.status === 'PASS' ? 'PASS' : r.status === 'BLOCKED' ? 'BLOCKED' : 'FAIL';
  console.log(`  [${icon}] ${r.check}`);
});

if (status === 'INFRASTRUCTURE_BLOCKED') {
  console.error('\nJ027 BLOCKED');
  console.error('Cause: Required infrastructure authorization unavailable.');
  console.error('Security: No credentials requested or exposed.');
  process.exit(2);
}
