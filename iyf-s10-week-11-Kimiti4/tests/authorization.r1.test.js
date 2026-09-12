/**
 * R1 — P0 Authorization Test Suite (T1..T19)
 *
 * Validates:
 *   - P0-1  GET /api/users                 (admin/founder only)
 *   - P0-2  GET /api/users/:id             (public-minimal for non-owners)
 *   - P0-3  GET /api/metrics/users/:userId/activity (self/admin/founder/moderator)
 *   - P0-4  POST /api/tiannara/moderate    (admin/moderator/founder)
 *   - P1-11 requireAuth.js removed (T16)
 *   - P2-8  GET /api/users/stats/:id?      (self/admin/founder)
 *
 * Run: npm run test:r1
 *
 * Mirrors alerts.contract.test.js style: real Express app, real DB,
 * real JWTs (server reads role from DB, not from token claims).
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const jwt = require('jsonwebtoken');

let server;
const PORT = 3555 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}`;

const USERS = {
  userA: null, userB: null, admin: null, founder: null, moderator: null,
};
const TOKENS = {
  userA: null, userB: null, admin: null, founder: null, moderator: null,
};

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

  function token(userId, role) {
    // role claim is informational only; authPG.js loads role from DB
    // R5: strict claim contract (iss/aud enforced by authPG).
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h', issuer: 'jamiilink', audience: 'jamiilink-api' }
    );
  }

async function req(method, path, body = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
    };
    if (authToken) opts.headers['Authorization'] = `Bearer ${authToken}`;
    if (body) {
      const payload = JSON.stringify(body);
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function setup() {
  await connectDB();
  const ts = Date.now();
  const u = (name, role) => query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    [`r1_${name}_${ts}`, `r1_${name}_${ts}@example.com`, 'x', role]
  );
  USERS.userA     = (await u('userA',     'user'      )).rows[0].id;
  USERS.userB     = (await u('userB',     'user'      )).rows[0].id;
  USERS.admin     = (await u('admin',     'admin'     )).rows[0].id;
  USERS.founder   = (await u('founder',   'founder'   )).rows[0].id;
  USERS.moderator = (await u('moderator', 'moderator' )).rows[0].id;
  TOKENS.userA     = token(USERS.userA,     'user');
  TOKENS.userB     = token(USERS.userB,     'user');
  TOKENS.admin     = token(USERS.admin,     'admin');
  TOKENS.founder   = token(USERS.founder,   'founder');
  TOKENS.moderator = token(USERS.moderator, 'moderator');
}

async function teardown() {
  await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`,
    [[USERS.userA, USERS.userB, USERS.admin, USERS.founder, USERS.moderator]]);
}

async function tests() {
  console.log('\n=== R1 P0 AUTHORIZATION TESTS (T1..T19) ===\n');

  // ===== T1..T3: P0-1 GET /api/users =====
  console.log('T1..T3: P0-1 GET /api/users');
  const t1 = await req('GET', '/api/users');
  assert(t1.status === 401, 'T1 anonymous -> 401');
  const t2 = await req('GET', '/api/users', null, TOKENS.userA);
  assert(t2.status === 403, 'T2 ordinary user -> 403');
  const t3 = await req('GET', '/api/users', null, TOKENS.admin);
  assert(t3.status === 200, 'T3 admin -> 200');
  if (t3.status === 200) {
    const users = t3.body.data || [];
    const hasPassword = users.some((u) => 'password' in u || 'mfa_recovery_codes' in u);
    assert(!hasPassword, 'T3 admin payload does NOT contain password or mfa_recovery_codes');
  }

  // ===== T4..T7: P0-2 GET /api/users/:id =====
  console.log('\nT4..T7: P0-2 GET /api/users/:id');
  const t4 = await req('GET', `/api/users/${USERS.userB}`);
  assert(t4.status === 401, 'T4 anonymous -> 401');
  const t5 = await req('GET', `/api/users/${USERS.userB}`, null, TOKENS.userA);
  assert(t5.status === 200, 'T5 user A asks for user B -> 200 (public-minimal)');
  if (t5.status === 200) {
    const u = t5.body.data || {};
    assert(!('email' in u), 'T5 public-minimal does NOT include email');
    assert(!('mfa' in u), 'T5 public-minimal does NOT include mfa object');
    assert(!('currentOrganization' in u), 'T5 public-minimal does NOT include currentOrganization');
    assert(!('updatedAt' in u), 'T5 public-minimal does NOT include updatedAt');
    assert('username' in u, 'T5 public-minimal includes username');
    assert('profile' in u, 'T5 public-minimal includes profile');
  }
  const t6 = await req('GET', `/api/users/${USERS.userA}`, null, TOKENS.userA);
  assert(t6.status === 200, 'T6 user A asks for own profile -> 200 (full)');
  if (t6.status === 200) {
    const u = t6.body.data || {};
    assert('email' in u, 'T6 owner view includes email');
    assert('mfa' in u, 'T6 owner view includes mfa object');
  }
  const t7 = await req('GET', `/api/users/${USERS.userB}`, null, TOKENS.admin);
  assert(t7.status === 200, 'T7 admin asks for user B -> 200 (full)');
  if (t7.status === 200) {
    const u = t7.body.data || {};
    assert('email' in u, 'T7 admin view includes email');
    assert('mfa' in u, 'T7 admin view includes mfa object');
  }

  // ===== T8..T11: P0-3 GET /api/metrics/users/:userId/activity =====
  console.log('\nT8..T11: P0-3 GET /api/metrics/users/:userId/activity');
  const t8 = await req('GET', `/api/metrics/users/${USERS.userA}/activity`);
  assert(t8.status === 401, 'T8 anonymous -> 401');
  const t9 = await req('GET', `/api/metrics/users/${USERS.userB}/activity`, null, TOKENS.userA);
  assert(t9.status === 403, 'T9 user A asks for user B activity -> 403');
  const t10 = await req('GET', `/api/metrics/users/${USERS.userA}/activity`, null, TOKENS.userA);
  assert(t10.status === 200, 'T10 user A asks for own activity -> 200');
  const t11 = await req('GET', `/api/metrics/users/${USERS.userB}/activity`, null, TOKENS.admin);
  assert(t11.status === 200, 'T11 admin asks for user B activity -> 200');

  // ===== T12..T15: P0-4 POST /api/tiannara/moderate =====
  console.log('\nT12..T15: P0-4 POST /api/tiannara/moderate');
  const t12 = await req('POST', '/api/tiannara/moderate', { content: 'hello' });
  assert(t12.status === 401, 'T12 anonymous -> 401');
  const t13 = await req('POST', '/api/tiannara/moderate', { content: 'hello' }, TOKENS.userA);
  assert(t13.status === 403, 'T13 ordinary user -> 403');
  const t14 = await req('POST', '/api/tiannara/moderate', { content: 'hello' }, TOKENS.moderator);
  // R3 [P1-3] amendment (authorized): the capability is explicitly unavailable,
  // so privileged callers get 501 — the auth gate itself is unchanged
  // (T12 401 anonymous / T13 403 user still hold).
  assert(t14.status === 501, 'T14 moderator -> 501 (R3: explicitly unavailable)');
  const t15 = await req('POST', '/api/tiannara/moderate', { content: 'hello' }, TOKENS.admin);
  assert(t15.status === 501, 'T15 admin -> 501 (R3: explicitly unavailable)');

  // ===== T16: P1-11 requireAuth.js removed =====
  console.log('\nT16: P1-11 requireAuth.js removed');
  const p = path.join(__dirname, '..', 'src', 'middleware', 'requireAuth.js');
  assert(!fs.existsSync(p), 'T16 src/middleware/requireAuth.js does NOT exist on disk');

  // ===== T17..T19: P2-8 IDOR on /api/users/stats/:id =====
  console.log('\nT17..T19: P2-8 GET /api/users/stats/:id');
  const t17 = await req('GET', `/api/users/stats/${USERS.userB}`, null, TOKENS.userA);
  assert(t17.status === 403, 'T17 user A asks for user B stats -> 403');
  const t18 = await req('GET', `/api/users/stats/${USERS.userA}`, null, TOKENS.userA);
  assert(t18.status === 200, 'T18 user A asks for own stats -> 200');
  const t19 = await req('GET', `/api/users/stats/${USERS.userB}`, null, TOKENS.admin);
  assert(t19.status === 200, 'T19 admin asks for any user stats -> 200');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`R1 test server listening on ${BASE}`);
    });
    await new Promise((r) => setTimeout(r, 250));
    await tests();
  } catch (err) {
    console.error('Test runner error:', err.message);
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
      console.log('\u2705 All R1 authorization tests passed');
    }
  }
}

run();
