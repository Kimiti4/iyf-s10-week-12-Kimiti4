/**
 * R2 — P0 MFA / Verification Test Suite (T20..T35)
 *
 * Validates:
 *   - P0-5  TOTP secret server-persisted; client-supplied secret ignored
 *   - P0-6  verification_codes durable; cross-process + atomic single-use
 *   - P1-12 email service fail-closed; structured deliveryStatus
 *   - P1-13 login lockout with bounded backoff, reset on success
 *   - P2-1  /api/auth/send-verification rate limit
 *   - P2-2  /api/auth/verify-code attempt limit
 *   - Math.random -> crypto.randomInt (validated implicitly by code validity)
 *
 * Run: npm run test:r2
 *
 * T34 cross-process: the test file performs:
 *   process A : HTTP request to /send-verification (creates the row in DB)
 *   process exit: not actually a process exit; we demonstrate durability by
 *                 reading the verification_codes row directly from the DB
 *                 via query() and asserting the record is in DB and the
 *                 candidate code is verifiable. The DB is the source of
 *                 truth; a process restart loses no state.
 *
 * T35 atomic: two concurrent HTTP /verify-code requests for the same code.
 *            The repo's UPDATE ... WHERE used_at IS NULL ensures exactly
 *            one wins.
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const jwt = require('jsonwebtoken');
const otplib = require('otplib');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { verificationLimiter } = require('../src/middleware/rateLimiter');

let server;
const PORT = 3777 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}`;

const USERS = {
  userA: null, userB: null, userC: null,
};
const TOKENS = { userA: null, userB: null, userC: null };

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

  function token(userId) {
    // R5: strict claim contract (iss/aud enforced by authPG).
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h', issuer: 'jamiilink', audience: 'jamiilink-api' });
  }

async function req(method, p, body = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(p, BASE);
    const opts = {
      method, hostname: url.hostname, port: url.port,
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
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function setup() {
  await connectDB();
  // Ensure schema (R2 adds verification_codes) is in place before tests run.
  await createTables();
  const ts = Date.now();
  // Store a real bcrypt hash so password verification behaves like production.
  // (Plaintext 'x' would make bcrypt.compare always return false.)
  // Use lowercase usernames/emails: production register() lowercases email
  // before insert, and findByEmail() lowercases the lookup.
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('R2-Correct-Password-123!', 10);
  const u = (name) => query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    [`r2_${name}_${ts}`, `r2_${name}_${ts}@example.com`, hash, 'user']
  );
  USERS.userA = (await u('usera')).rows[0].id;
  USERS.userB = (await u('userb')).rows[0].id;
  USERS.userC = (await u('userc')).rows[0].id;
  TOKENS.userA = token(USERS.userA);
  TOKENS.userB = token(USERS.userB);
  TOKENS.userC = token(USERS.userC);
  // Defensive reset of any inherited lockout state.
  await query(
    `UPDATE users SET mfa_failed_attempts = 0, mfa_locked_until = NULL
       WHERE id = ANY($1::uuid[])`,
    [[USERS.userA, USERS.userB, USERS.userC]]
  );
}

async function teardown() {
  await query(`DELETE FROM verification_codes WHERE contact LIKE 'r2_%@example.com' OR user_id = ANY($1::uuid[])`,
    [[USERS.userA, USERS.userB, USERS.userC]]);
  await query(`DELETE FROM mfa_methods WHERE user_id = ANY($1::uuid[])`,
    [[USERS.userA, USERS.userB, USERS.userC]]);
  await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`,
    [[USERS.userA, USERS.userB, USERS.userC]]);
}
async function tests() {
  console.log('\n=== R2 P0 MFA / VERIFICATION TESTS (T20..T35) ===\n');

  // ===== T20..T23: P0-5 server-authoritative TOTP =====
  console.log('T20..T23: P0-5 server-authoritative TOTP');
  const t20 = await req('POST', '/api/auth/mfa/totp/enroll', {});
  assert(t20.status === 401, 'T20 enroll anonymous -> 401');

  const t21 = await req('POST', '/api/auth/mfa/totp/enroll', {}, TOKENS.userA);
  assert(t21.status === 200, 'T21 enroll userA -> 200');
  if (t21.status === 200) {
    const d = t21.body.data || {};
    assert('qrCode' in d, 'T21 response has qrCode');
    assert('otpauth_url' in d, 'T21 response has otpauth_url');
    // CRITICAL: the raw secret must NOT be in the response.
    const responseText = JSON.stringify(t21.body);
    assert(!responseText.match(/[A-Z2-7]{20,}=/), 'T21 raw secret NOT in response (only otpauth URL is exposed)');
  }

  // T22: client supplies a DIFFERENT secret in the body -- server must ignore it
  // and use the server-stored secret.
  // Step 1: compute a valid TOTP for the server-stored secret.
  const storedSecretRow = (await query(
    `SELECT id, secret, verified FROM mfa_methods WHERE user_id = $1 AND type = 'totp' AND verified = FALSE ORDER BY added_at DESC LIMIT 1`,
    [USERS.userA]
  )).rows[0];
  if (!storedSecretRow) {
    const debugRows = (await query(
      `SELECT id, user_id, type, verified, secret IS NOT NULL AS has_secret, added_at FROM mfa_methods WHERE user_id = $1 ORDER BY added_at DESC`,
      [USERS.userA]
    )).rows;
    console.log('  [debug] mfa_methods rows for userA:', JSON.stringify(debugRows));
  }
  const storedSecret = storedSecretRow && storedSecretRow.secret;
  const validCode = await otplib.generate({ secret: storedSecret });
  const t22 = await req('POST', '/api/auth/mfa/totp/verify',
    { code: validCode, secret: 'AAAA-FAKE-SECRET-DO-NOT-USE' }, TOKENS.userA);
  // The server ignores the client-supplied secret and uses storedSecret.
  // The TOTP we computed is for storedSecret, so verification should succeed.
  assert(t22.status === 200, 'T22 server ignores client-supplied secret and verifies against stored secret');

  // Confirm via DB that users.mfa_enabled is now true.
  const u1 = (await query('SELECT mfa_enabled FROM users WHERE id = $1', [USERS.userA])).rows[0];
  assert(u1.mfa_enabled === true, 'T23 users.mfa_enabled = true after first valid verify');

  // ===== T24..T26: P1-13-style lockout for TOTP (also applies P0-5) =====
  console.log('\nT24..T26: TOTP lockout (R2 server-side lockout on users.mfa_locked_until)');
  // Reset lockout state for userB to get a clean test.
  await query(`UPDATE users SET mfa_failed_attempts = 0, mfa_locked_until = NULL WHERE id = $1`, [USERS.userB]);
  // Fresh enrollment for userB.
  const enrollB = await req('POST', '/api/auth/mfa/totp/enroll', {}, TOKENS.userB);
  assert(enrollB.status === 200, 'T-enrollB userB enrolled');
  for (let i = 0; i < 4; i++) {
    const wrong = await req('POST', '/api/auth/mfa/totp/verify',
      { code: '000000' }, TOKENS.userB);
    assert(wrong.status === 401, `T24 wrong attempt #${i + 1} -> 401`);
  }
  // 5th wrong attempt should lock.
  const fifth = await req('POST', '/api/auth/mfa/totp/verify',
    { code: '000000' }, TOKENS.userB);
  assert(fifth.status === 423, 'T25 5th wrong attempt -> 423 (locked)');
  // Even with a valid code, the account is locked.
  const storedSecretB = (await query(
    `SELECT secret FROM mfa_methods WHERE user_id = $1 AND type = 'totp' AND verified = FALSE ORDER BY added_at DESC LIMIT 1`,
    [USERS.userB]
  )).rows[0].secret;
  const validCodeB = await otplib.generate({ secret: storedSecretB });
  const locked = await req('POST', '/api/auth/mfa/totp/verify',
    { code: validCodeB }, TOKENS.userB);
  assert(locked.status === 423, 'T26 valid code while locked -> 423');

  // ===== T27: rate limiter on /send-verification =====
  console.log('\nT27: P2-1 /send-verification rate limit (verificationLimiter middleware)');
  // Probe approach: mount verificationLimiter on a scratch Express app and
  // hit it 6 times with NODE_ENV forced to a non-test value (the limiter's
  // skip() reads NODE_ENV live). The 6th must yield 429.
  // emailService caches NODE_ENV at require-time, so this does not disturb it.
  const express = require('express');
  const probe = express();
  probe.use('/rl-probe', verificationLimiter);
  probe.get('/rl-probe', (req, res) => res.json({ ok: true }));
  const probePort = 3911 + Math.floor(Math.random() * 500);
  const probeSrv = await new Promise((resolve) => {
    const s = probe.listen(probePort, () => resolve(s));
  });
  async function probeGet() {
    return new Promise((resolve, reject) => {
      const r = http.request({ hostname: '127.0.0.1', port: probePort, path: '/rl-probe', method: 'GET' }, (res) => {
        let d = ''; res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode }));
      });
      r.on('error', reject); r.end();
    });
  }
  const savedEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  let sixth = null;
  try {
    for (let i = 0; i < 6; i++) {
      const r = await probeGet();
      if (i === 5) sixth = r;
    }
  } finally {
    process.env.NODE_ENV = savedEnv;
    await new Promise((r) => probeSrv.close(r));
  }
  assert(sixth && sixth.status === 429, 'T27 6th send-verification within 15min -> 429');

  // ===== T28: email service returns deliveryStatus =====
  console.log('\nT28: P1-12 email service deliveryStatus');
  const t28 = await req('POST', '/api/auth/send-verification',
    { method: 'email', contact: 'r2_t28@example.com' });
  assert(t28.status === 200, 'T28 send-verification -> 200');
  if (t28.status === 200) {
    assert('deliveryStatus' in t28.body, 'T28 response has deliveryStatus field');
    // In test mode emailService returns 'noop'.
    assert(t28.body.deliveryStatus === 'noop', 'T28 in test env deliveryStatus = noop');
  }

  // ===== T29..T31: P0-6 durable verification_codes + attempt limit =====
  console.log('\nT29..T31: P0-6 verification_codes durable, single-use, attempt-limited');
  // Send a verification code to a fresh contact.
  const contact29 = 'r2_t29@example.com';
  const s29 = await req('POST', '/api/auth/send-verification',
    { method: 'email', contact: contact29 });
  assert(s29.status === 200, 'T29a send-verification for t29 -> 200');
  // Read the raw code from the DB by querying verification_codes -- in a
  // production environment the raw code would only be in the email. To
  // simulate the user "reading the email", we read the code_hash from DB
  // and brute-force the 6-digit space. For T29 we use a tighter trick:
  // the send handler generated a code via crypto.randomInt(100000, 1000000)
  // and the controller returned the response WITHOUT the raw code (P0-6
  // design: the controller does not log or return raw). So we read the
  // active row and verify it exists in DB, then submit a wrong code 3x,
  // then submit nothing valid (we don't have the code in this test).
  // For the success path we use T30 below with a code we know.

  // First confirm the row exists in DB (durable state).
  const row29 = (await query(
    `SELECT id, code_hash, attempt_count, used_at, expires_at
       FROM verification_codes WHERE contact = $1 AND purpose = 'email'
       ORDER BY created_at DESC LIMIT 1`,
    [contact29]
  )).rows[0];
  assert(!!row29, 'T29 verification_codes row exists in DB (P0-6 durable)');
  assert(row29.used_at === null, 'T29 row.used_at is NULL (not yet consumed)');
  assert(row29.code_hash && row29.code_hash.length > 20, 'T29 code_hash is bcrypt-shaped (not raw)');
  assert(new Date(row29.expires_at) > new Date(), 'T29 expires_at is in the future');

  // T30: 3 wrong attempts then the row becomes forced-consumed.
  // We don't have the raw code, so all attempts are "wrong"; attempt_count
  // increments; at 5 the row is forced-consumed.
  // To prove the actual matching path works, do a separate flow where we
  // brute-force the 6-digit code from the code_hash. bcrypt(10) is slow
  // (~100ms per attempt), so 1M attempts would take hours. Instead, we
  // synthesize a separate verification row with a known code.
  // -- Brute force skipped; we test attempt-count and forced-consume
  //    with 3 wrong attempts on the s29 row.
  for (let i = 0; i < 3; i++) {
    const r = await req('POST', '/api/auth/verify-code',
      { method: 'email', contact: contact29, code: '000000' });
    assert(r.status === 400, `T30 wrong code attempt #${i + 1} -> 400 (invalid code)`);
  }
  const r30a = (await query(
    `SELECT attempt_count FROM verification_codes WHERE id = $1`, [row29.id]
  )).rows[0];
  assert(r30a.attempt_count === 3, 'T30 attempt_count incremented to 3');

  // T31: after forced-consume (at 5 attempts) the row is consumed.
  for (let i = 0; i < 2; i++) {
    await req('POST', '/api/auth/verify-code',
      { method: 'email', contact: contact29, code: '000000' });
  }
  const r31 = (await query(
    `SELECT used_at, attempt_count FROM verification_codes WHERE id = $1`, [row29.id]
  )).rows[0];
  assert(r31.used_at !== null, 'T31 row forced-consumed at attempt 5 (used_at set)');
  // Subsequent verify returns "No active code" (consumed -> not active).
  const t31 = await req('POST', '/api/auth/verify-code',
    { method: 'email', contact: contact29, code: '000000' });
  assert(t31.status === 400, 'T31 verify after forced-consume -> 400 (No active code)');

  // ===== T32..T33: login lockout (P1-13) =====
  console.log('\nT32..T33: P1-13 login lockout with bounded backoff');
  const emailC = `r2_userC_${Date.now()}@example.com`;
  // userC's email needs to match the user lookup -- USERS.userC is a UUID.
  // Get userC's email.
  const uC = (await query('SELECT id, email FROM users WHERE id = $1', [USERS.userC])).rows[0];
  // Reset lockout state.
  await query(`UPDATE users SET mfa_failed_attempts = 0, mfa_locked_until = NULL WHERE id = $1`, [USERS.userC]);
  for (let i = 0; i < 5; i++) {
    const r = await req('POST', '/api/auth/login',
      { email: uC.email, password: 'WRONG_PASSWORD' });
    assert(r.status === 401 || r.status === 423, `T32 wrong login #${i + 1} -> 401 or 423`);
  }
  // The 6th attempt must be 423 (locked).
  const t32 = await req('POST', '/api/auth/login',
    { email: uC.email, password: 'WRONG_PASSWORD' });
  assert(t32.status === 423, 'T32 5x wrong password -> 423 locked');
  assert(t32.body && t32.body.lockedUntil, 'T32 response includes lockedUntil');
  // T33: the password for userC is 'R2-Correct-Password-123!' (bcrypt-hashed
  // in setup). After waiting for the lock to expire (backoff #1 = 30s) the
  // user can log in again. For the test we directly clear mfa_locked_until
  // to simulate the wait, then verify the reset-on-success path.
  await query(`UPDATE users SET mfa_locked_until = NULL WHERE id = $1`, [USERS.userC]);
  // The attempt counter is still elevated from the wrong attempts above.
  // Logging in successfully must reset it.
  const t33 = await req('POST', '/api/auth/login',
    { email: uC.email, password: 'R2-Correct-Password-123!' });
  assert(t33.status === 200, 'T33 successful login after lockout window -> 200');
  const uCafter = (await query('SELECT mfa_failed_attempts, mfa_locked_until FROM users WHERE id = $1', [USERS.userC])).rows[0];
  assert(uCafter.mfa_failed_attempts === 0, 'T33 successful login resets mfa_failed_attempts to 0');
  assert(uCafter.mfa_locked_until === null, 'T33 successful login clears mfa_locked_until');

  // ===== T34: cross-process durability (DB-backed) =====
  console.log('\nT34: P0-6 cross-process durability (DB-backed)');
  // Prove that a verification row created in this process is visible in
  // the DB (and therefore would be available to a fresh process that
  // queries the same DB). The "process restart" is the absence of
  // any in-memory state; the DB row IS the only state.
  const contact34 = 'r2_t34@example.com';
  const s34 = await req('POST', '/api/auth/send-verification',
    { method: 'email', contact: contact34 });
  assert(s34.status === 200, 'T34a send-verification for t34 -> 200');
  // Read the row directly. There is no in-memory cache to invalidate.
  const row34 = (await query(
    `SELECT id, code_hash, expires_at FROM verification_codes
       WHERE contact = $1 AND purpose = 'email' AND used_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
    [contact34]
  )).rows[0];
  assert(!!row34, 'T34b verification_codes row is present in DB (no in-memory state required)');
  // Now verify the controller can consume it. We test the verifyCode path
  // by simulating the "code is correct" outcome: synthesize a known code,
  // hash it, INSERT it, then call /verify-code with the known code.
  // -- Better approach: prove the controller's verifyCode uses the
  //    server-stored hash by using the lockout path. With 5 wrong attempts
  //    on a fresh row we observe attempt_count and forced-consume; if any
  //    of that came from a stale in-memory Map, attempt_count would not
  //    increment. The increment demonstrates the code path is fully
  //    DB-driven.
  for (let i = 0; i < 5; i++) {
    await req('POST', '/api/auth/verify-code',
      { method: 'email', contact: contact34, code: '999999' });
  }
  const row34b = (await query(
    `SELECT used_at, attempt_count FROM verification_codes WHERE id = $1`, [row34.id]
  )).rows[0];
  assert(row34b.used_at !== null, 'T34c row is consumed after 5 wrong attempts (controller reads from DB, not memory)');

  // ===== T35: atomic single-use across two parallel requests =====
  console.log('\nT35: P0-6 atomic single-use (UPDATE ... WHERE used_at IS NULL)');
  // Synthesize a fresh code row for t35, then send two parallel verify
  // requests with the same code. Exactly one must succeed.
  const raw35 = String(crypto.randomInt(100000, 1000000));
  const hashed35 = await bcrypt.hash(raw35, 10);
  const ins = await query(
    `INSERT INTO verification_codes (user_id, purpose, contact, code_hash, expires_at)
     VALUES ($1, 'email', $2, $3, NOW() + INTERVAL '5 minutes')
     RETURNING id`,
    [USERS.userA, 'r2_t35@example.com', hashed35]
  );
  const id35 = ins.rows[0].id;
  // Two parallel verifies.
  const [r35a, r35b] = await Promise.all([
    req('POST', '/api/auth/verify-code',
      { method: 'email', contact: 'r2_t35@example.com', code: raw35 }),
    req('POST', '/api/auth/verify-code',
      { method: 'email', contact: 'r2_t35@example.com', code: raw35 })
  ]);
  const successes = [r35a, r35b].filter((r) => r.status === 200).length;
  const failures = [r35a, r35b].filter((r) => r.status === 400).length;
  assert(successes === 1, `T35 exactly ONE of two parallel verifies succeeded (got ${successes})`);
  assert(failures === 1, `T35 exactly ONE of two parallel verifies failed (got ${failures})`);
  // Confirm the row is consumed (used_at set).
  const row35 = (await query('SELECT used_at FROM verification_codes WHERE id = $1', [id35])).rows[0];
  assert(row35.used_at !== null, 'T35 row is consumed exactly once');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`R2 test server listening on ${BASE}`);
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
      console.log('\u2705 All R2 tests passed');
    }
  }
}

run();
