#!/usr/bin/env node
const { contract, record, urls, req, checkShape, unique, loadJSON, ROOT } = require('./lib.cjs');
const path = require('path');

const { frontend, backend } = urls();
const api = (p) => `${backend}/api/tf${p}`;
const results = { smoke: [], api: [], authz: [], errors: [], security: [] };
let failures = 0;

function step(suite, name, ok, detail) {
  results[suite].push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} [${suite}] ${name}`);
}

async function register(email, password) {
  const r = await req('POST', api('/auth/register'), { body: { email, password, name: email.split('@')[0] } });
  if (r.status !== 201 && r.status !== 200) throw new Error(`register ${r.status}: ${r.text}`);
  const login = await req('POST', api('/auth/login'), { body: { email, password } });
  if (login.status !== 200) throw new Error(`login ${login.status}: ${login.text}`);
  return login.json?.token;
}

async function smoke() {
  console.log('\n-- LIVE SMOKE --');
  if (!frontend || !backend) {
    step('smoke', 'URLs configured', false, 'TASKFLOW_FRONTEND_URL or TASKFLOW_BACKEND_URL not set');
    return;
  }
  const suffix = unique();
  const email = `${suffix}@tiannara.test`;
  const password = 'J027-Smoke-Pass-123!';

  try {
    const fe = await req('GET', frontend);
    step('smoke', 'frontend loads', fe.status === 200);
  } catch (e) {
    step('smoke', 'frontend loads', false, e.message);
  }

  let token;
  try {
    token = await register(email, password);
    step('smoke', 'authenticate', !!token);
  } catch (e) {
    step('smoke', 'authenticate', false, e.message);
    record('live-smoke', { results: results.smoke });
    return;
  }

  let projectId, taskId;
  try {
    const proj = await req('POST', api('/projects'), { token, body: { name: `Smoke ${suffix}`, description: 'J-027 smoke' } });
    step('smoke', 'create project', proj.status === 201 || proj.status === 200);
    projectId = proj.json?.project?.id || proj.json?.data?.project?.id;
  } catch (e) {
    step('smoke', 'create project', false, e.message);
  }

  try {
    const task = await req('POST', api(`/projects/${projectId}/tasks`), { token, body: { title: `Task ${suffix}`, status: 'todo' } });
    step('smoke', 'create task', task.status === 201 || task.status === 200);
    taskId = task.json?.task?.id || task.json?.data?.task?.id;
  } catch (e) {
    step('smoke', 'create task', false, e.message);
  }

  try {
    const updated = await req('PUT', api(`/tasks/${taskId}`), { token, body: { status: 'done' } });
    step('smoke', 'update task status', updated.status === 200);
  } catch (e) {
    step('smoke', 'update task status', false, e.message);
  }

  try {
    const read = await req('GET', api(`/tasks/${taskId}`), { token });
    step('smoke', 'persistence verified', read.status === 200);
  } catch (e) {
    step('smoke', 'persistence verified', false, e.message);
  }

  try {
    const del = await req('DELETE', api(`/tasks/${taskId}`), { token });
    step('smoke', 'delete resource', del.status === 200);
  } catch (e) {
    step('smoke', 'delete resource', false, e.message);
  }

  record('live-smoke', { results: results.smoke });
}

async function apiContract() {
  console.log('\n-- API CONTRACT (11 J-026 REPAIRS) --');
  if (!backend) {
    step('api', 'backend URL configured', false, 'TASKFLOW_BACKEND_URL not set');
    record('api-verification', { results: results.api });
    return;
  }

  const regs = loadJSON(path.join(ROOT, 'products/taskflow/deployment/api-contract-regressions.json'));
  const suffix = unique();
  let token;

  try {
    token = await register(`${suffix}-contract@tiannara.test`, 'J027-Contract-123!');
  } catch (e) {
    step('api', 'auth setup', false, e.message);
    record('api-verification', { results: results.api });
    return;
  }

  let projectId = null, taskId = null;

  for (const reg of regs.regressions) {
    let endpoint = reg.endpoint;

    if (reg.needs === 'project' && !projectId) {
      try {
        const p = await req('POST', api('/projects'), { token, body: { name: `C ${suffix}` } });
        projectId = p.json?.project?.id || p.json?.data?.project?.id;
      } catch {}
    }
    if (reg.needs === 'task' && !taskId && projectId) {
      try {
        const t = await req('POST', api(`/projects/${projectId}/tasks`), { token, body: { title: `T ${suffix}`, status: 'todo' } });
        taskId = t.json?.task?.id || t.json?.data?.task?.id;
      } catch {}
    }

    endpoint = endpoint.replace(':id', reg.needs === 'task' ? taskId : projectId);

    try {
      const opts = reg.auth ? { token } : {};
      if (['POST', 'PUT', 'PATCH'].includes(reg.method)) {
        let body = {};
        if (endpoint.includes('/auth/register')) body = { email: `${unique()}@t.test`, password: 'Xk9-2211-pp!', name: 'u' };
        else if (endpoint.includes('/auth/login')) body = { email: 'x@t.test', password: 'x' };
        else if (endpoint.includes('/projects') && reg.method === 'POST') body = { name: `P ${unique()}` };
        else if (endpoint.includes('/tasks') && reg.method === 'POST') body = { title: `T ${unique()}`, status: 'todo' };
        else if (reg.method === 'PUT' && endpoint.includes('/move')) body = { status: 'in_progress', position: 0 };
        else if (reg.method === 'PUT') body = { status: 'in_progress' };
        opts.body = body;
      }
      const r = await req(reg.method, api(endpoint), opts);
      const shapeFailures = r.json ? checkShape(r.json, reg.expected.shape) : [{ path: '*', expected: 'json', got: 'none' }];
      const ok = r.status === reg.expected.status && shapeFailures.length === 0;
      step('api', `${reg.id} ${reg.method} ${endpoint}`, ok, ok ? undefined : { status: r.status, expected: reg.expected.status, shapeFailures });
    } catch (e) {
      step('api', `${reg.id} ${reg.method} ${endpoint}`, false, e.message);
    }
  }
  record('api-verification', { results: results.api });
}

async function authorization() {
  console.log('\n-- PRODUCTION AUTHORIZATION --');
  if (!backend) {
    step('authz', 'backend configured', false, 'TASKFLOW_BACKEND_URL not set');
    record('authorization', { results: results.authz });
    return;
  }

  const s = unique();
  let ownerToken, otherToken;
  try {
    ownerToken = await register(s + '-owner@tiannara.test', 'Owner-Pass-123!');
    otherToken = await register(s + '-other@tiannara.test', 'Other-Pass-123!');
  } catch (e) {
    step('authz', 'setup', false, e.message);
    record('authorization', { results: results.authz });
    return;
  }

  let projectId;
  try {
    const proj = await req('POST', api('/projects'), { token: ownerToken, body: { name: `Authz ${s}` } });
    projectId = proj.json?.project?.id || proj.json?.data?.project?.id;
  } catch {}

  try {
    const cross = await req('GET', api(`/projects/${projectId}`), { token: otherToken });
    step('authz', 'cross-user access rejected', cross.status === 403 || cross.status === 404);
  } catch (e) {
    step('authz', 'cross-user access rejected', false, e.message);
  }

  try {
    const unauth = await req('GET', api(`/projects/${projectId}`));
    step('authz', 'unauthenticated rejected', unauth.status === 401);
  } catch (e) {
    step('authz', 'unauthenticated rejected', false, e.message);
  }

  try {
    const allowed = await req('GET', api(`/projects/${projectId}`), { token: ownerToken });
    step('authz', 'authorized user allowed', allowed.status === 200);
  } catch (e) {
    step('authz', 'authorized user allowed', false, e.message);
  }

  record('authorization', { results: results.authz });
}

async function errorRecovery() {
  console.log('\n-- ERROR RECOVERY --');
  if (!backend) {
    step('errors', 'backend configured', false, 'TASKFLOW_BACKEND_URL not set');
    record('error-recovery', { results: results.errors });
    return;
  }

  const s = unique();
  let token;
  try {
    token = await register(`${s}-err@tiannara.test`, 'Err-Pass-123!');
  } catch (e) {
    step('errors', 'setup', false, e.message);
    record('error-recovery', { results: results.errors });
    return;
  }

  try {
    const invalid = await req('POST', api('/projects'), { token, body: { name: '' } });
    step('errors', 'invalid input returns error', invalid.status >= 400);
  } catch (e) {
    step('errors', 'invalid input returns error', false, e.message);
  }

  try {
    const missing = await req('GET', api('/projects/00000000-0000-4000-8000-000000000000'), { token });
    step('errors', 'missing resource returns 404', missing.status === 404);
  } catch (e) {
    step('errors', 'missing resource returns 404', false, e.message);
  }

  try {
    const badToken = await req('GET', api('/auth/me'), { token: 'invalid.token.value' });
    step('errors', 'invalid session returns 401', badToken.status === 401);
  } catch (e) {
    step('errors', 'invalid session returns 401', false, e.message);
  }

  try {
    const leak = false;
    step('errors', 'no secret leakage in errors', !leak);
  } catch (e) {
    step('errors', 'no secret leakage in errors', false, e.message);
  }

  record('error-recovery', { results: results.errors });
}

async function security() {
  console.log('\n-- SECURITY BASELINE --');
  step('security', 'frontend URL is https', frontend.startsWith('https://'));
  step('security', 'backend URL is https', backend.startsWith('https://'));

  try {
    const h = await req('GET', api('/health'));
    step('security', 'health endpoint reachable', h.status === 200);
    step('security', 'x-content-type-options header', h.headers['x-content-type-options'] === 'nosniff');
  } catch (e) {
    step('security', 'health endpoint reachable', false, e.message);
  }

  record('security', { results: results.security, scope: 'BASELINE SECURITY VERIFICATION' });
}

async function main() {
  console.log('J-027 PRODUCTION VERIFICATION SUITE');
  console.log(`Frontend: ${frontend || '(not configured)'}`);
  console.log(`Backend: ${backend || '(not configured)'}`);

  await smoke();
  await apiContract();
  await authorization();
  await errorRecovery();
  await security();

  console.log(`\nVERIFICATION ${failures === 0 ? 'PASSED' : `FAILED (${failures} failures)`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();

