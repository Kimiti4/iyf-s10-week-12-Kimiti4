/**
 * Jam Contract Tests (flagship capability gate)
 *
 * Covers the implemented surface (each maps to the JAM-01..JAM-10 gate):
 *   JAM-01 create persists            (POST /api/jams -> 201 + DB row)
 *   JAM-02 created Jam retrievable    (GET /api/jams/:id -> 200, same fields)
 *   JAM-03 appears in discovery/list  (GET /api/jams includes it)
 *   JAM-04 user can join              (POST participants -> 201)
 *   JAM-05 membership persists        (participants/me + list show member)
 *   JAM-06 unauthorized mutation cut  (anon 401s; B cannot contribute to a
 *                                      jam they never joined -> 403; duplicate
 *                                      join is idempotent, not an error)
 *   JAM-07 user can leave             (DELETE participants -> 200 + gone)
 *   JAM-08 owner permissions enforced (only creator-owned data trusted;
 *                                      creator auto-member; non-member
 *                                      contribution -> 403)
 *   JAM-09 lifecycle transitions persist (N/A — no transition endpoint: no UI
 *                                      callers. create forces draft; verified
 *                                      status === 'draft' in DB.)
 *   JAM-10 reload preserves state     (fresh GETs return identical state)
 *
 * Run with: npm run test:jams
 * Requires: DATABASE_URL pointing to a test database
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const jwt = require('jsonwebtoken');

let server;
const PORT = 3777 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}`;

let ownerId; let ownerToken;
let memberId; let memberToken;
let outsiderId; let outsiderToken;

const results = { passed: 0, failed: 0, errors: [] };

function assert(condition, label) {
  if (condition) {
    results.passed++;
    console.log(`  ✅ ${label}`);
  } else {
    results.failed++;
    results.errors.push(label);
    console.log(`  ❌ ${label}`);
  }
}

function token(userId) {
  // R5: strict claim contract (iss/aud enforced by authPG).
  return jwt.sign(
    { id: userId },
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
  await createTables();
  const ts = Date.now();
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('Jam-Test-Password-123!', 10);
  const mk = async (name) => (await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id`,
    [`jam_${name}_${ts}`, `jam_${name}_${ts}@example.com`, hash]
  )).rows[0].id;
  ownerId = await mk('owner');
  memberId = await mk('member');
  outsiderId = await mk('outsider');
  ownerToken = token(ownerId);
  memberToken = token(memberId);
  outsiderToken = token(outsiderId);
}

async function teardown() {
  const ids = [ownerId, memberId, outsiderId];
  await query(`DELETE FROM jam_contributions WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM jam_participants WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM jams WHERE creator_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [ids]).catch(() => {});
}

async function tests() {
  console.log('\n=== JAM CONTRACT TESTS ===\n');

  // Auth gates
  console.log('auth gates');
  let r = await req('POST', '/api/jams', { title: 'x' });
  assert(r.status === 401, 'anonymous create -> 401');
  r = await req('POST', '/api/jams/00000000-0000-0000-0000-000000000000/participants', null, null);
  assert(r.status === 401, 'anonymous join -> 401');

  // JAM-01 create persists
  console.log('\nJAM-01 create persists');
  r = await req('POST', '/api/jams', {
    title: 'Nairobi Photo Walk',
    description: 'A weekend photo jam',
    prompt: 'Bring your camera',
    category: 'creator',
    participationTypes: ['post', 'image'],
  }, ownerToken);
  assert(r.status === 201, 'create -> 201');
  const jamId = r.body?.jam?.id;
  assert(!!jamId, 'created jam has an id');
  assert(r.body?.jam?.status === 'draft', 'created jam status is draft (server-forced)');
  assert(r.body?.jam?.creator?.id === ownerId, 'creator attributed to authenticated user');
  const dbRow = (await query(`SELECT * FROM jams WHERE id = $1`, [jamId])).rows[0];
  assert(!!dbRow && dbRow.title === 'Nairobi Photo Walk', 'jam row persisted in DB');

  // Validation
  r = await req('POST', '/api/jams', { description: 'no title' }, ownerToken);
  assert(r.status === 400, 'missing title -> 400');
  r = await req('POST', '/api/jams', { title: 'x', category: 'nope' }, ownerToken);
  assert(r.status === 400, 'invalid category -> 400');

  // JAM-02 retrievable
  console.log('\nJAM-02 retrievable');
  r = await req('GET', `/api/jams/${jamId}`);
  assert(r.status === 200, 'get by id -> 200');
  assert(r.body?.jam?.id === jamId && r.body?.jam?.title === 'Nairobi Photo Walk', 'retrieved fields match');
  r = await req('GET', '/api/jams/00000000-0000-0000-0000-000000000000');
  assert(r.status === 404, 'unknown jam -> 404');

  // JAM-03 discovery
  console.log('\nJAM-03 discovery');
  r = await req('GET', '/api/jams?sort=newest&limit=10');
  assert(r.status === 200, 'list -> 200');
  assert(Array.isArray(r.body?.jams) && r.body.jams.some((j) => j.id === jamId), 'created jam appears in list');

  // JAM-04 join + JAM-05 membership persists
  console.log('\nJAM-04/JAM-05 join + persistence');
  r = await req('POST', `/api/jams/${jamId}/participants`, null, memberToken);
  assert(r.status === 201, 'member joins -> 201');
  r = await req('GET', `/api/jams/${jamId}/participants/me`, null, memberToken);
  assert(r.status === 200 && r.body?.isMember === true, 'membership check true after join');
  r = await req('GET', `/api/jams/${jamId}/participants`, null, memberToken);
  assert(r.status === 200 && r.body?.participants?.some((p) => String(p.userId || p.id) === String(memberId)), 'member listed');
  // Duplicate join is idempotent, not an integrity error
  r = await req('POST', `/api/jams/${jamId}/participants`, null, memberToken);
  assert(r.status === 200 && r.body?.alreadyMember === true, 'duplicate join idempotent');
  const dupCount = (await query(
    `SELECT COUNT(*)::int AS n FROM jam_participants WHERE jam_id = $1 AND user_id = $2`,
    [jamId, memberId])).rows[0].n;
  assert(dupCount === 1, 'DB uniqueness holds (exactly one membership row)');

  // Contributions (member + open jam required)
  console.log('\ncontributions');
  r = await req('POST', `/api/jams/${jamId}/contributions`, { type: 'post', textContent: 'My entry' }, memberToken);
  assert(r.status === 201, 'member contributes -> 201');
  assert(r.body?.contribution?.userId === memberId, 'contribution attributed to sender');
  r = await req('POST', `/api/jams/${jamId}/contributions`, { type: 'post', textContent: 'x' }, outsiderToken);
  assert(r.status === 403, 'non-member contribute -> 403');
  r = await req('POST', `/api/jams/${jamId}/contributions`, {}, memberToken);
  assert(r.status === 400, 'empty contribution -> 400');
  r = await req('GET', `/api/jams/${jamId}/contributions`, null, memberToken);
  assert(r.status === 200 && r.body?.contributions?.length === 1, 'contribution listed');

  // Leaderboard reflects real counts
  r = await req('GET', `/api/jams/${jamId}/leaderboard`);
  assert(r.status === 200, 'leaderboard -> 200');
  assert(r.body?.leaderboard?.[0]?.userId === memberId && r.body.leaderboard[0].contributionCount === 1, 'leaderboard ranks real counts');

  // JAM-06 unauthorized mutation cut
  console.log('\nJAM-06 authorization');
  r = await req('POST', `/api/jams/${jamId}/contributions`, { type: 'post', textContent: 'forged' }, outsiderToken);
  assert(r.status === 403, 'outsider cannot contribute (tested twice for determinism)');

  // JAM-07 leave
  console.log('\nJAM-07 leave');
  r = await req('DELETE', `/api/jams/${jamId}/participants`, null, memberToken);
  assert(r.status === 200, 'member leaves -> 200');
  r = await req('GET', `/api/jams/${jamId}/participants/me`, null, memberToken);
  assert(r.status === 200 && r.body?.isMember === false, 'membership gone after leave');
  r = await req('DELETE', `/api/jams/${jamId}/participants`, null, memberToken);
  assert(r.status === 404, 'duplicate leave -> 404');

  // JAM-08 owner semantics: creator auto-member; ownership from creator_id
  console.log('\nJAM-08 owner semantics');
  r = await req('GET', `/api/jams/${jamId}/participants/me`, null, ownerToken);
  assert(r.status === 200 && r.body?.isMember === true, 'creator is auto-member');
  const ownRow = (await query(`SELECT creator_id FROM jams WHERE id = $1`, [jamId])).rows[0];
  assert(String(ownRow.creator_id) === String(ownerId), 'ownership pinned to creator id');

  // JAM-09 lifecycle: create forces draft (no transition endpoint by design)
  console.log('\nJAM-09 lifecycle ground truth');
  const statusRow = (await query(`SELECT status FROM jams WHERE id = $1`, [jamId])).rows[0];
  assert(statusRow.status === 'draft', 'persisted status is draft');

  // JAM-10 reload preserves state (fresh GETs, identical state)
  console.log('\nJAM-10 reload preserves state');
  const g1 = await req('GET', `/api/jams/${jamId}`);
  const g2 = await req('GET', `/api/jams/${jamId}`);
  assert(JSON.stringify(g1.body) === JSON.stringify(g2.body), 'two fresh GETs return identical state');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`jam test server listening on ${BASE}`);
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
      console.log('✅ All jam tests passed');
    }
  }
}

run();
