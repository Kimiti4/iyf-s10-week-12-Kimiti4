const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const AUDIT = path.join(ROOT, 'docs/audits/J027');
const EVIDENCE = path.join(AUDIT, 'evidence');

const loadJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const contract = () => loadJSON(path.join(ROOT, 'products/taskflow/deployment/deployment-contract.json'));
const envContract = () => loadJSON(path.join(ROOT, 'products/taskflow/deployment/environment-contract.json'));

function commit() {
  try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); }
  catch { return 'unknown'; }
}

function record(category, payload) {
  fs.mkdirSync(EVIDENCE, { recursive: true });
  const doc = { category, timestamp: new Date().toISOString(), commit: commit(), ...payload };
  fs.writeFileSync(path.join(EVIDENCE, `${category}.json`), JSON.stringify(doc, null, 2));
  return doc;
}

const urls = () => {
  const c = contract().production;
  const frontend = process.env[c.frontend_url_env] || '';
  const backend = process.env[c.backend_url_env] || '';
  return { frontend, backend };
};

async function req(method, url, { token, body } = {}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, headers: Object.fromEntries(res.headers.entries()) };
}

const getPath = (obj, p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

function checkShape(json, shape) {
  const failures = [];
  for (const s of shape) {
    const v = getPath(json, s.path);
    const ok =
      s.type === 'array' ? Array.isArray(v) :
      s.type === 'object' ? (v !== null && typeof v === 'object') :
      typeof v === s.type;
    if (!ok) failures.push({ path: s.path, expected: s.type, got: Array.isArray(v) ? 'array' : typeof v });
  }
  return failures;
}

function classifyFailure(err) {
  const msg = String(err?.message || err).toLowerCase();
  if (msg.includes('cors')) return 'CONFIGURATION';
  if (msg.includes('401')) return 'AUTHENTICATION';
  if (msg.includes('403')) return 'AUTHORIZATION';
  if (msg.includes('migration') || msg.includes('database')) return 'DATABASE';
  if (msg.includes('econnrefused') || msg.includes('enotfound') || msg.includes('fetch failed')) return 'NETWORK';
  if (msg.includes('build')) return 'BUILD';
  if (msg.includes('vercel') || msg.includes('railway') || msg.includes('provider')) return 'PROVIDER';
  return 'APPLICATION';
}

const unique = () => `j027-${Date.now().toString(36)}`;

module.exports = { ROOT, AUDIT, EVIDENCE, loadJSON, contract, envContract, commit, record, urls, req, getPath, checkShape, classifyFailure, unique };
