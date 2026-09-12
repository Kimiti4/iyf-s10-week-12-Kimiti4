/**
 * R4 — Route/API Contract Tests
 *
 * Pins the R4-A findings (M1/M5/M6/M7 + F1-F6):
 *   - M1: GET /api/posts list shape is coherent (data[] + pagination)
 *   - F4: POST /api/posts works WITHOUT body.author (server JWT authoritative)
 *   - F5: POST comment works WITHOUT body.author
 *   - M6: DELETE comment -> 204 empty (client 204-guard is frontend-side)
 *   - F6: tiannara with admin auth -> 501 (truthful, not 401)
 *   - F7(a): no-backend prefixes 404 truthfully (never fake 200)
 *   - R3 501 subset re-pinned
 *
 * Run: npm run test:r4
 */
process.env.NODE_ENV = 'test';
const STUB_PORT = 4911 + Math.floor(Math.random() * 500);
process.env.TIANNARA_API_URL = `http://127.0.0.1:${STUB_PORT}`;
require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const jwt = require('jsonwebtoken');

let server;
let stubServer;
const PORT = 4111 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;

let userAId; let userAToken;
let adminId; let adminToken;

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
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed, rawLength: data.length });
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
  stubServer = http.createServer((sreq, sres) => {
    let b = ''; sreq.on('data', (c) => (b += c));
    sreq.on('end', () => {
      sres.writeHead(200, { 'Content-Type': 'application/json' });
      sres.end(JSON.stringify({ safe: true, toxicity_score: 0, spam_probability: 0,
        scam_probability: 0, categories_flagged: [], confidence: 0.99 }));
    });
  });
  await new Promise((r) => stubServer.listen(STUB_PORT, r));
  const ts = Date.now();
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('R4-Correct-Password-123!', 10);
  const mk = async (name, role) => (await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id`,
    [`r4_${name}_${ts}`, `r4_${name}_${ts}@example.com`, hash, role]
  )).rows[0].id;
  userAId = await mk('usera', 'user');
  adminId = await mk('admin', 'admin');
  userAToken = token(userAId);
  adminToken = token(adminId);
}

async function teardown() {
  const ids = [userAId, adminId];
  await query(`DELETE FROM comments WHERE author_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM posts WHERE author_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [ids]).catch(() => {});
}

async function tests() {
  console.log('\n=== R4 ROUTE/API CONTRACT TESTS ===\n');

  // ===== M1: posts list shape =====
  console.log('M1: posts list shape coherence');
  const list = await req('GET', '/api/posts?limit=2');
  assert(list.status === 200, 'GET /api/posts -> 200');
  assert(list.body && Array.isArray(list.body.data), 'body.data is an array (canonical list key)');
  // Frontend-equivalent projection (mirrors postApi.getAll fallbacks).
  const projected = list.body.data ?? list.body.posts ?? [];
  assert(Array.isArray(projected), 'frontend projection yields an array (feed no longer throws)');
  assert(typeof list.body.total === 'number', 'body.total present');
  assert(typeof (list.body.page ?? list.body.currentPage) === 'number', 'page/currentPage present');

  // ===== F4: post create without author =====
  console.log('\nF4: post creation without body.author');
  const created = await req('POST', '/api/posts',
    { title: 'R4 contract post', content: 'sufficiently long content here', category: 'mtaani' },
    userAToken);
  assert(created.status === 201, 'POST /api/posts without author -> 201 (was 400)');
  const postId = created.body && created.body.data && created.body.data.id;
  assert(!!postId, 'created post has an id');
  if (postId) {
    assert(created.body.data.author && created.body.data.author.id === userAId,
      'post author derived from JWT, not body');
  }

  // ===== F5 + M6: comments =====
  console.log('\nF5/M6: comments without author; delete 204');
  const cc = await req('POST', `/api/posts/${postId}/comments`,
    { content: 'r4 comment content' }, userAToken);
  assert(cc.status === 201, 'POST comment without author -> 201 (was 400)');
  const cmtId = cc.body && cc.body.data && cc.body.data.id;
  assert(!!cmtId, 'created comment has an id');
  const del = await req('DELETE', `/api/posts/${postId}/comments/${cmtId}`, null, userAToken);
  assert(del.status === 204, 'DELETE comment -> 204');
  assert(del.rawLength === 0, 'DELETE comment body is empty (client 204-guard covers this)');

  // ===== F6 backend side: tiannara with admin auth -> 501 =====
  console.log('\nF6: tiannara privileged truthful 501');
  const tm = await req('POST', '/api/tiannara/moderate', { content: 'hello' }, adminToken);
  assert(tm.status === 501, 'admin POST /tiannara/moderate -> 501');
  assert(tm.body && tm.body.code === 'TIANNARA_UNAVAILABLE', 'body carries TIANNARA_UNAVAILABLE');

  // ===== F7(a): no-backend prefixes 404 truthfully =====
  // NOTE (Jam implementation): GET /api/jams is now REAL, so it was removed
  // from this dead-prefix list (see tests/jams.contract.test.js for the live
  // contract). The assertion below is stronger, not weaker.
  // NOTE (notifications implementation): GET /api/notifications is now REAL,
  // so it was removed from this dead-prefix list (see
  // tests/social.contract.test.js for the live contract). The assertion
  // below is stronger, not weaker.
  console.log('\nF7(a): no-backend prefixes are truthful 404s (never fake 200)');
  const dead = [
    ['GET', '/api/reels'],
    ['POST', '/api/social/follow/some-id'],
    ['GET', '/api/analytics/platform/trends'],
    ['GET', '/api/discover/search?q=x'],
    ['GET', '/api/creator/dashboard'],
    ['GET', '/api/moderation/stats'],
    ['GET', '/api/safety/blocked'],
    ['GET', '/api/contributions/some-id/reactions'],
  ];
  for (const [method, p] of dead) {
    const r = await req(method, p, method === 'POST' ? {} : null, userAToken);
    assert(r.status === 404, `${method} ${p} -> 404 (UI-ONLY/UNAVAILABLE, documented)`);
  }
  const jamList = await req('GET', '/api/jams?limit=5', null, userAToken);
  assert(jamList.status === 200, 'GET /api/jams -> 200 (Jam backend live)');
  assert(Array.isArray(jamList.body?.jams), 'jam list carries jams array');
  const notifAnon = await req('GET', '/api/notifications');
  assert(notifAnon.status === 401, 'GET /api/notifications anonymous -> 401 (real auth gate)');

  // ===== R3 501 subset re-pin =====
  console.log('\nR3 501 subset re-pin');
  const pins = [
    ['GET', '/api/locations', null],
    ['GET', '/api/market/prices', null],
    ['POST', '/api/distribution/repost', { sourceType: 'post', sourceId: postId }],
    ['POST', '/api/skills/complete/whatever', { quality_rating: 5 }],
    ['GET', '/api/reputation/leaderboard/all', null],
  ];
  const expectStatus = [501, 501, 501, 501, 200];
  for (let i = 0; i < pins.length; i++) {
    const [method, p, body] = pins[i];
    const r = await req(method, p, body, userAToken);
    assert(r.status === expectStatus[i], `${method} ${p} -> ${expectStatus[i]} (R3 preserved)`);
  }

  // ===== Shape fallbacks (M7): getById envelope =====
  console.log('\nM7: single-resource envelope shape');
  const one = await req('GET', `/api/posts/${postId}`);
  assert(one.status === 200, 'GET /api/posts/:id -> 200');
  assert(one.body && (one.body.data || one.body.post), 'body carries data (frontend reads data.data first)');

  // ===== Malformed identifiers -> 404, never 500 =====
  console.log('\nMalformed identifiers (R4 adversarial)');
  const badUser = await req('GET', '/api/users/verified', null, userAToken);
  assert(badUser.status === 404, 'GET /api/users/verified -> 404 (not 500)');
  const badPost = await req('GET', '/api/posts/not-a-uuid');
  assert(badPost.status === 404, 'GET /api/posts/not-a-uuid -> 404 (not 500)');
  const badAlert = await req('GET', '/api/alerts/not-a-uuid');
  assert(badAlert.status === 404, 'GET /api/alerts/not-a-uuid -> 404 (not 500)');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`R4 test server listening on ${BASE}`);
    });
    await new Promise((r) => setTimeout(r, 250));
    await tests();
  } catch (err) {
    console.error('Test runner error:', err.message);
    console.error(err.stack);
    process.exitCode = 2;
  } finally {
    if (server) await new Promise((r) => server.close(r));
    if (stubServer) await new Promise((r) => stubServer.close(r));
    await teardown();
    await pool.end();
    console.log(`\n============================================================`);
    console.log(`RESULTS: ${results.passed} passed, ${results.failed} failed`);
    if (results.failed > 0) {
      console.log('Failures:');
      for (const e of results.errors) console.log(`  - ${e}`);
      process.exitCode = 1;
    } else {
      console.log('\u2705 All R4 tests passed');
    }
  }
}

run();
