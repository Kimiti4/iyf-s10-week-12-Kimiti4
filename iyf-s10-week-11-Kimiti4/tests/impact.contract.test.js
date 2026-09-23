/**
 * Impact Contract Tests (server catalog + monthly dashboard)
 *
 *   IMP-01 track validates event_type against catalog -> 400
 *   IMP-02 track rejects divergent impact_value       -> 400
 *   IMP-03 track persists server catalog value       -> 201
 *   IMP-04 duplicate reference_id                    -> 409
 *   IMP-05 dashboard is raw-only (no KES/hours/badges)
 *   IMP-06 dashboard uses current calendar month boundary
 *   IMP-07 passport export has integrity + provenance, no signature
 *
 * Run: npm run test:impact
 * Requires: DATABASE_URL
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const jwt = require('jsonwebtoken');
const assert = require('assert');

let server;
const PORT = 4555 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;

let userId;
let userToken;
let otherId;

const results = { passed: 0, failed: 0, errors: [] };

function check(condition, label) {
  if (condition) {
    results.passed++;
    console.log(`  ✅ ${label}`);
  } else {
    results.failed++;
    results.errors.push(label);
    console.log(`  ❌ ${label}`);
  }
}

function token(id) {
  return jwt.sign(
    { id },
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
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch { parsed = data; }
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
  await createTables();
  const ts = Date.now();
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('Impact-Contract-Password-123!', 10);
  const mk = async (name) => (await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,'user') RETURNING id`,
    [`imp_${name}_${ts}`, `imp_${name}_${ts}@example.com`, hash]
  )).rows[0].id;
  userId = await mk('usera');
  otherId = await mk('userb');
  userToken = token(userId);
}

async function teardown() {
  const ids = [userId, otherId].filter(Boolean);
  if (ids.length) {
    await query(`DELETE FROM impact_metrics WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
    await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [ids]).catch(() => {});
  }
}

async function tests() {
  console.log('\n=== IMPACT CONTRACT TESTS ===\n');

  // IMP-01 unknown event_type -> 400
  console.log('IMP-01: unknown event_type rejected');
  const unknown = await req('POST', '/api/impact/track', { event_type: 'not_a_real_event' }, userToken);
  check(unknown.status === 400, 'POST /impact/track unknown event -> 400');
  check(unknown.body && unknown.body.code === 'UNKNOWN_EVENT_TYPE', 'body has UNKNOWN_EVENT_TYPE');

  // IMP-02 divergent impact_value -> 400
  console.log('\nIMP-02: divergent impact_value rejected');
  const divergent = await req('POST', '/api/impact/track', {
    event_type: 'help_provided',
    impact_value: 999
  }, userToken);
  check(divergent.status === 400, 'divergent impact_value -> 400');
  check(divergent.body && divergent.body.code === 'DIVERGENT_IMPACT_VALUE', 'body has DIVERGENT_IMPACT_VALUE');

  // IMP-03 valid track persists catalog value (1 for help_provided)
  console.log('\nIMP-03: valid track persists server catalog value');
  const ok = await req('POST', '/api/impact/track', { event_type: 'help_provided' }, userToken);
  check(ok.status === 201, 'valid track -> 201');
  if (ok.status === 201) {
    check(ok.body.data.impact_value === 1, 'impact_value resolved from catalog (=1)');
    check(ok.body.data.event_type === 'help_provided', 'event_type persisted');
    check(ok.body.data.user_id === userId, 'user_id from JWT, not body');
  }

  // IMP-04 duplicate reference -> 409
  console.log('\nIMP-04: duplicate reference_id -> 409');
  const ref = '11111111-2222-4333-8444-555555555555';
  const first = await req('POST', '/api/impact/track', {
    event_type: 'exchange_completed',
    reference_id: ref
  }, userToken);
  check(first.status === 201, 'first reference track -> 201');
  if (first.status === 201) {
    check(first.body.data.impact_value === 10, 'exchange_completed catalog value (=10)');
  }
  const second = await req('POST', '/api/impact/track', {
    event_type: 'exchange_completed',
    reference_id: ref
  }, userToken);
  check(second.status === 409, 'duplicate reference -> 409');
  check(second.body && second.body.code === 'DUPLICATE_IMPACT_EVENT', 'body has DUPLICATE_IMPACT_EVENT');

  // IMP-05/06 dashboard raw-only + monthly boundary
  console.log('\nIMP-05/06: dashboard raw-only, calendar month boundary');
  const dash = await req('GET', `/api/impact/${userId}/dashboard`, null, userToken);
  check(dash.status === 200, 'GET /impact/:id/dashboard -> 200');
  if (dash.status === 200) {
    const d = dash.body.data || {};
    const text = JSON.stringify(dash.body);
    check(!text.includes('KES'), 'dashboard has NO fabricated KES');
    check(!text.includes('hours'), 'dashboard has NO fabricated hours');
    check(!('badges' in d), 'dashboard has NO badges array');
    check(d.contribution_breakdown && typeof d.contribution_breakdown.help_provided === 'number', 'help_provided present (number)');
    check(d.contribution_breakdown && d.contribution_breakdown.exchange_completed === 10, 'exchange_completed sum includes catalog track (=10)');
    check(d.period && d.period.type === 'calendar_month', 'period.type is calendar_month');
    check(d.period && !Number.isNaN(Date.parse(d.period.start)), 'period.start is parseable ISO');
    check(d.period && !Number.isNaN(Date.parse(d.period.end)), 'period.end is parseable ISO');
    if (d.period) {
      const start = new Date(d.period.start);
      const end = new Date(d.period.end);
      const days = (end - start) / (1000 * 60 * 60 * 24);
      check(days >= 28 && days <= 31, `period spans ~1 month (${days.toFixed(1)} days)`);
      check(start.getUTCDate() === 1, 'period.start is day 1 of month');
    }
    check(Array.isArray(d.catalog) && d.catalog.includes('help_provided'), 'catalog exposed in response');
  }

  // IMP-07 passport integrity + provenance, no signature
  console.log('\nIMP-07: passport integrity + provenance, no signature');
  const passport = await req('GET', '/api/reputation/export', null, userToken);
  check(passport.status === 200, 'GET /reputation/export -> 200');
  if (passport.status === 200) {
    const p = passport.body.data || {};
    check(!('signature' in p), 'passport has NO signature');
    check(p.schema_version === '1.1', 'schema_version is 1.1');
    check(typeof p.passport_id === 'string' && p.passport_id.startsWith('jamii_'), 'passport_id present');
    check(p.issuer === 'JamiiLink', 'issuer is JamiiLink');
    check(typeof p.generated_at === 'string', 'generated_at present');
    check(typeof p.digest === 'string' && p.digest.length === 64, 'SHA-256 digest present');
    check(p.integrity && p.integrity.algorithm === 'SHA-256', 'integrity.algorithm is SHA-256');
    check(p.provenance && p.provenance.authority === 'server_database', 'provenance.authority is server_database');
    check(p.provenance && p.provenance.client_claims_accepted === false, 'client claims not accepted');
    check(Array.isArray(p.evidence) && p.evidence.length > 0, 'evidence array present');
    check(p.completeness && typeof p.completeness.complete === 'boolean', 'completeness.complete boolean');
    check(p.identity && p.identity.username, 'canonical identity.username present');
    check(Array.isArray(p.skills), 'skills array present (graceful empty ok)');

    // Determinism: same user+schema -> same passport_id
    const passport2 = await req('GET', '/api/reputation/export', null, userToken);
    if (passport2.status === 200) {
      check(passport2.body.data.passport_id === p.passport_id, 'passport_id deterministic across exports');
    }
  }

  // Anonymous track -> 401
  console.log('\nIMP-auth: anonymous track -> 401');
  const anon = await req('POST', '/api/impact/track', { event_type: 'help_provided' });
  check(anon.status === 401, 'POST /impact/track anonymous -> 401');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, async () => {
      console.log(`Impact contract test server on ${BASE}`);
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
      console.log('✅ All impact contract tests passed');
    }
  }
}

run();
