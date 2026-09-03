#!/usr/bin/env node
const { execSync } = require('child_process');
const { contract, record, urls, req, classifyFailure, ROOT, EVIDENCE } = require('./lib.cjs');
const fs = require('fs');
const path = require('path');

const MAX_DEPLOYMENT_REPAIR_ITERATIONS = 3;
const c = contract().production;
const { frontend, backend } = urls();
const repairLog = [];

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: 'pipe', cwd: ROOT, ...opts });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e.stderr || e.message).slice(0, 500) };
  }
}

async function healthCheck() {
  const res = await req('GET', `${backend}${c.health_endpoint}`);
  return { ok: res.status === 200, status: res.status, body: res.json };
}

async function waitForHealthy(timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const h = await healthCheck();
      if (h.ok) return h;
    } catch {}
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error('Backend health not reached within timeout');
}

async function deployOnce() {
  const steps = [];

  if (!frontend && !backend) {
    throw new Error('Neither TASKFLOW_FRONTEND_URL nor TASKFLOW_BACKEND_URL configured');
  }

  // If CLI deploy authorized
  if (process.env.TIANNARA_DEPLOY_AUTHORIZED === 'true') {
    if (process.env.RAILWAY_TOKEN) {
      const b = run('railway up --service taskflow-backend');
      steps.push({ step: 'backend:deploy', ...b });
      if (!b.ok) throw Object.assign(new Error('backend deploy failed'), { detail: b.error });
    }
    if (process.env.VERCEL_TOKEN) {
      const f = run('vercel --prod --yes');
      steps.push({ step: 'frontend:deploy', ...f });
      if (!f.ok) throw Object.assign(new Error('frontend deploy failed'), { detail: f.error });
    }
  } else {
    steps.push({ step: 'deploy:git-integration', ok: true, note: 'provider git-push deployment assumed; verification polls health' });
  }

  // Health check
  if (backend) {
    try {
      const health = await waitForHealthy();
      steps.push({ step: 'backend:health', ok: health.ok, status: health.status });
    } catch (e) {
      steps.push({ step: 'backend:health', ok: false, error: e.message });
      throw e;
    }
  }

  // Frontend check
  if (frontend) {
    try {
      const front = await req('GET', frontend);
      steps.push({ step: 'frontend:load', ok: front.status === 200 });
    } catch (e) {
      steps.push({ step: 'frontend:load', ok: false, error: e.message });
    }
  }

  return steps;
}

async function main() {
  console.log('J-027 DEPLOY ORCHESTRATOR');
  console.log(`Max repair iterations: ${MAX_DEPLOYMENT_REPAIR_ITERATIONS}`);

  if (!frontend && !backend) {
    console.error('\nDEPLOYMENT BLOCKED');
    console.error('Cause: TASKFLOW_FRONTEND_URL and TASKFLOW_BACKEND_URL not configured.');
    console.error('No deployment attempted.');
    record('deployment', { status: 'BLOCKED', reason: 'No production URLs configured', repairLog, urls: { frontend, backend } });
    process.exit(2);
  }

  for (let iteration = 1; iteration <= MAX_DEPLOYMENT_REPAIR_ITERATIONS; iteration++) {
    console.log(`\n-- DEPLOY ITERATION ${iteration}/${MAX_DEPLOYMENT_REPAIR_ITERATIONS} --`);
    try {
      const steps = await deployOnce();
      const failed = steps.filter(s => !s.ok);
      if (failed.length === 0) {
        record('deployment', { status: 'DEPLOYED', iterations: iteration, steps, repairLog, urls: { frontend, backend }, deployment_commit: require('./lib.cjs').commit() });
        console.log('\nDeployment verified: backend healthy, frontend reachable');
        return process.exit(0);
      }
      throw new Error(failed.map(f => `${f.step}: ${f.error || 'failed'}`).join('; '));
    } catch (err) {
      const classification = classifyFailure(err);
      console.error(`Iteration ${iteration} failed [${classification}]: ${err.message}`);
      repairLog.push({ iteration, failure: err.message, classification, repair: `retry/wait`, timestamp: new Date().toISOString() });

      if (iteration === MAX_DEPLOYMENT_REPAIR_ITERATIONS) {
        record('deployment', { status: 'DEPLOYMENT_REPAIR_LIMIT_REACHED', iterations: iteration, repairLog, urls: { frontend, backend } });
        console.error('DEPLOYMENT_REPAIR_LIMIT_REACHED');
        return process.exit(1);
      }

      if (classification === 'NETWORK') {
        console.log('Waiting 30s for provider propagation...');
        execSync('sleep 30');
      }
    }
  }
}

main();

