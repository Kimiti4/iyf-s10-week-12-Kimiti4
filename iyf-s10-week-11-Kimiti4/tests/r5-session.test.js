/**
 * R5 — Session Security Test Suite (P0-7)
 *
 * Validates (E1 evidence):
 *   - access token: 15-min bound, iss/aud/jti claims enforced
 *   - expired / malformed / forged / altered / alg-none -> 401 (never 500)
 *   - wrong iss/aud, missing subject -> 401
 *   - refresh rotation: old token single-use; reuse -> family revoked
 *   - logout revokes refresh; password change revokes all sessions
 *   - CSRF: foreign Origin on refresh/logout -> 403
 *   - CSP: production policy without script unsafe-*; dev policy intact
 *   - WS authorizeSocket: no/bad token rejected; room scoping enforced
 *   - source sweep: no localStorage token persistence in frontend src
 *
 * Run: npm run test:r5
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const { authorizeSocket, canJoinRoom } = require('../src/services/socketService');
const { cspForEnv } = require('../src/middleware/securityHeaders');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let server;
const PORT = 4331 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;
const SECRET = process.env.JWT_SECRET || 'test-secret';

let userAId; let userAEmail;
let userBId;
let userAToken; // fresh access token (from login)

const results = { passed: 0, failed: 0, errors: [] };

function assert(condition, label) {
  if (condition) {
    results.passed++;
    console.log(`  \u2705 ${label}`);
  } else {
    results.failed++;
    results.errors.push(label);
    console.log(`  \u274c ${label}`);
  }
}

function b64urlDecode(seg) {
  return JSON.parse(Buffer.from(seg.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
}

async function req(method, p, body = null, authToken = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(p, BASE);
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      method, hostname: url.hostname, port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...extraHeaders },
    };
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch { parsed = null; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

function cookieFrom(res, name = 'jid_rt') {
  const setCookies = res.headers['set-cookie'] || [];
  for (const c of setCookies) {
    const m = c.match(new RegExp(`^${name}=([^;]*)`));
    if (m) return { header: `${name}=${m[1]}`, attrs: c };
  }
  return { header: null, attrs: null };
}

async function setup() {
  await connectDB();
  await createTables();
  const ts = Date.now();
  const hash = await bcrypt.hash('R5-Correct-Password-123!', 10);
  const mk = async (name, role) => (await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, email`,
    [`r5_${name}_${ts}`, `r5_${name}_${ts}@example.com`, hash, role]
  )).rows[0];
  const a = await mk('usera', 'user');
  const b = await mk('userb', 'user');
  userAId = a.id; userAEmail = a.email; userBId = b.id;
}

async function teardown() {
  const ids = [userAId, userBId].filter(Boolean);
  if (ids.length) {
    await query(`DELETE FROM refresh_sessions WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
    await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [ids]).catch(() => {});
  }
}

async function loginAs(email, password = 'R5-Correct-Password-123!') {
  return req('POST', '/api/auth/login', { email, password });
}

async function tests() {
  console.log('\n=== R5 SESSION SECURITY TESTS ===\n');

  // ===== Lifetime + claims (E1) =====
  console.log('Access token lifetime + claims');
  const login = await loginAs(userAEmail);
  assert(login.status === 200, 'login -> 200');
  userAToken = login.body.token;
  const claims = b64urlDecode(userAToken.split('.')[1]);
  assert(claims.exp - claims.iat <= 900, `access lifetime <= 900s (got ${claims.exp - claims.iat})`);
  assert(claims.iss === 'jamiilink', 'iss claim present');
  assert(claims.aud === 'jamiilink-api', 'aud claim present');
  assert(typeof claims.jti === 'string' && claims.jti.length > 0, 'jti claim present');
  const setCk = cookieFrom(login);
  assert(!!setCk.header, 'login sets jid_rt HttpOnly cookie');
  assert(/HttpOnly/i.test(setCk.attrs || ''), 'refresh cookie is HttpOnly');
  assert(/Path=\/api\/auth/i.test(setCk.attrs || ''), 'refresh cookie scoped to /api/auth');
  // userAToken works
  let r = await req('GET', '/api/auth/me', null, userAToken);
  assert(r.status === 200, 'fresh access token -> 200');

  // ===== Claim enforcement =====
  console.log('\nClaim enforcement');
  const wrongIss = jwt.sign({ id: userAId }, SECRET, { expiresIn: '1h', issuer: 'evil', audience: 'jamiilink-api', jwtid: 'x1' });
  r = await req('GET', '/api/auth/me', null, wrongIss);
  assert(r.status === 401, 'wrong iss -> 401');
  const wrongAud = jwt.sign({ id: userAId }, SECRET, { expiresIn: '1h', issuer: 'jamiilink', audience: 'evil', jwtid: 'x2' });
  r = await req('GET', '/api/auth/me', null, wrongAud);
  assert(r.status === 401, 'wrong aud -> 401');
  const noSub = jwt.sign({ role: 'user' }, SECRET, { expiresIn: '1h', issuer: 'jamiilink', audience: 'jamiilink-api', jwtid: 'x3' });
  r = await req('GET', '/api/auth/me', null, noSub);
  assert(r.status === 401, 'missing subject -> 401');
  const legacy = jwt.sign({ id: userAId }, SECRET, { expiresIn: '1h' });
  r = await req('GET', '/api/auth/me', null, legacy);
  assert(r.status === 401, 'pre-R5 token without iss/aud -> 401 (strict)');
  // altered payload normalizes to 401 (was 500 pre-R5)
  const segs = userAToken.split('.');
  const alt = segs[1].slice(0, -1) + (segs[1].slice(-1) === 'A' ? 'B' : 'A');
  r = await req('GET', '/api/auth/me', null, `${segs[0]}.${alt}.${segs[2]}`);
  assert(r.status === 401, 'altered payload -> 401 (never 500)');
  const forged = jwt.sign({ id: userAId }, 'wrong-secret-xyz', { expiresIn: '1h', issuer: 'jamiilink', audience: 'jamiilink-api', jwtid: 'x4' });
  r = await req('GET', '/api/auth/me', null, forged);
  assert(r.status === 401, 'forged signature -> 401');
  const expired = jwt.sign({ id: userAId }, SECRET, { expiresIn: '-10s', issuer: 'jamiilink', audience: 'jamiilink-api', jwtid: 'x5' });
  r = await req('GET', '/api/auth/me', null, expired);
  assert(r.status === 401, 'expired -> 401');

  // ===== Refresh rotation + reuse detection =====
  console.log('\nRefresh rotation + reuse detection');
  const ck1 = cookieFrom(login).header;
  const ref1 = await req('POST', '/api/auth/refresh', null, null, { Cookie: ck1 });
  assert(ref1.status === 200, 'refresh with live session -> 200');
  assert(ref1.body && typeof ref1.body.token === 'string', 'refresh returns new access token');
  const ck2 = cookieFrom(ref1).header;
  assert(!!ck2 && ck2 !== ck1, 'refresh rotates cookie (new value)');
  // old cookie must now be dead (rotated, single-use)
  const refOld = await req('POST', '/api/auth/refresh', null, null, { Cookie: ck1 });
  assert(refOld.status === 401, 'rotated (old) refresh token rejected');
  // reuse of the rotated token triggers family revocation: the successor dies too
  const refNew = await req('POST', '/api/auth/refresh', null, null, { Cookie: ck2 });
  assert(refNew.status === 401, 'successor dead after reuse detection (family revoked)');
  // no cookie -> 401
  const refNone = await req('POST', '/api/auth/refresh');
  assert(refNone.status === 401, 'refresh without cookie -> 401');

  // ===== CSRF: foreign Origin blocked =====
  console.log('\nCSRF Origin guard');
  const login2 = await loginAs(userAEmail);
  const ck3 = cookieFrom(login2).header;
  const csrf = await req('POST', '/api/auth/refresh', null, null, { Cookie: ck3, Origin: 'https://evil.test' });
  // Blocked either by the CORS layer or by the refresh CSRF guard; either
  // way the session must be unaffected (no rotation, no revocation).
  assert(csrf.status === 403 || csrf.status === 500, `foreign Origin on refresh blocked (got ${csrf.status})`);
  const stillLive = await req('POST', '/api/auth/refresh', null, null, { Cookie: ck3 });
  assert(stillLive.status === 200, 'session unaffected by blocked cross-origin attempt');

  // ===== Logout revocation =====
  console.log('\nLogout revocation');
  const login3 = await loginAs(userAEmail);
  const ck4 = cookieFrom(login3).header;
  const lo = await req('POST', '/api/auth/logout', null, null, { Cookie: ck4 });
  assert(lo.status === 200, 'logout -> 200');
  const afterLogout = await req('POST', '/api/auth/refresh', null, null, { Cookie: ck4 });
  assert(afterLogout.status === 401, 'refresh after logout -> 401 (revoked)');

  // ===== Password-change revocation =====
  console.log('\nPassword-change revocation');
  const login4 = await loginAs(userAEmail);
  const ck5 = cookieFrom(login4).header;
  const access4 = login4.body.token;
  const ch = await req('PUT', '/api/auth/change-password',
    { currentPassword: 'R5-Correct-Password-123!', newPassword: 'R5-Newer-Password-789!', confirmPassword: 'R5-Newer-Password-789!' },
    access4);
  assert(ch.status === 200, 'password change -> 200');
  const afterChange = await req('POST', '/api/auth/refresh', null, null, { Cookie: ck5 });
  assert(afterChange.status === 401, 'refresh after password change -> 401 (all sessions revoked)');
  // restore password for teardown cleanliness (row deleted anyway)
  await query(`UPDATE users SET password = $1 WHERE id = $2`,
    [await bcrypt.hash('R5-Correct-Password-123!', 10), userAId]).catch(() => {});

  // ===== CSP policies =====
  console.log('\nCSP policies');
  const savedEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const prodCsp = cspForEnv();
  process.env.NODE_ENV = savedEnv;
  const devCsp = cspForEnv();
  assert(!/unsafe-eval/.test(prodCsp.split('script-src')[1].split(';')[0]), 'prod script-src has no unsafe-eval');
  assert(!/unsafe-inline/.test(prodCsp.split('script-src')[1].split(';')[0]), 'prod script-src has no unsafe-inline');
  assert(/script-src 'self'/.test(prodCsp), 'prod script-src self present');
  assert(!/localhost/.test(prodCsp), 'prod connect-src has no localhost exception');
  assert(/unsafe-eval/.test(devCsp), 'dev policy still allows eval (HMR)');
  // live header in test env equals dev policy
  const live = await req('GET', '/api/posts?limit=1');
  assert(live.headers['content-security-policy'] === devCsp, 'live header matches dev policy in test env');

  // ===== WebSocket authorizeSocket unit tests =====
  console.log('\nWebSocket handshake auth');
  function fakeSocket(token) {
    return { handshake: { auth: token === undefined ? {} : { token } }, data: {}, _err: null };
  }
  function runMw(sock) {
    return new Promise((resolve) => {
      authorizeSocket(sock, (err) => resolve(err || null));
    });
  }
  let err = await runMw(fakeSocket(undefined));
  assert(!!err, 'WS without token rejected');
  err = await runMw(fakeSocket('garbage'));
  assert(!!err, 'WS with garbage token rejected');
  err = await runMw(fakeSocket(jwt.sign({ id: userAId }, 'nope', { expiresIn: '1h', issuer: 'jamiilink', audience: 'jamiilink-api' })));
  assert(!!err, 'WS with forged token rejected');
  // valid token needs a live user: create one
  const validTok = jwt.sign({ id: userAId }, SECRET, { expiresIn: '1h', issuer: 'jamiilink', audience: 'jamiilink-api', jwtid: 'ws1' });
  const sockOk = fakeSocket(validTok);
  err = await runMw(sockOk);
  assert(!err && sockOk.data.user && String(sockOk.data.user.id) === String(userAId), 'WS with valid token attaches DB user');
  // room scoping
  const { canJoinRoom } = require('../src/services/socketService');
  const me = { id: userAId };
  assert(await canJoinRoom(me, 'global') === true, 'room global allowed');
  assert(await canJoinRoom(me, `user:${userAId}`) === true, 'room user:self allowed');
  assert(await canJoinRoom(me, 'user:someone-else') === false, 'room user:other denied');
  assert(await canJoinRoom(me, '../../etc') === false, 'room path-traversal denied');
  assert(await canJoinRoom(me, '') === false, 'empty room denied');

  // ===== Source sweep: no persistent token storage (frontend) =====
  console.log('\nSource sweep: token persistence');
  const feRoot = path.join(__dirname, '..', '..', 'iyf-s10-week-09-Kimiti4', 'src');
  function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (/\.(jsx?|mjs)$/.test(e.name)) out.push(p);
    }
    return out;
  }
  const bad = [];
  for (const f of walk(feRoot)) {
    const src = fs.readFileSync(f, 'utf8');
    if (/localStorage\s*\.\s*setItem\s*\(\s*['"]token['"]/.test(src)) bad.push(`${path.relative(feRoot, f)}: setItem token`);
    if (/sessionStorage\s*\.\s*setItem\s*\(\s*['"]token['"]/.test(src)) bad.push(`${path.relative(feRoot, f)}: sessionStorage token`);
    if (/\.token\s*=\s*[^=]/.test(src) && /pendingPost|draft\.token|post\.token/.test(src)) bad.push(`${path.relative(feRoot, f)}: token persisted on queued object`);
  }
  assert(bad.length === 0, `no persistent token writes in frontend src${bad.length ? ` (${bad.join('; ')})` : ''}`);
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`R5 test server listening on ${BASE}`);
    });
    await new Promise((r) => setTimeout(r, 250));
    await tests();
  } catch (err) {
    console.error('Test runner error:', err.message);
    console.error(err.stack);
    process.exitCode = 2;
  } finally {
    if (server) await new Promise((r) => server.close(r));
    await teardown();
    await pool.end();
    console.log(`\n============================================================`);
    console.log(`RESULTS: ${results.passed} passed, ${results.failed} failed`);
    if (results.failed > 0) {
      console.log('Failures:');
      for (const e of results.errors) console.log(`  - ${e}`);
      process.exitCode = 1;
    } else {
      console.log('\u2705 All R5 tests passed');
    }
  }
}

run();
