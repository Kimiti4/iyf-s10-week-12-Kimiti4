/**
 * R3 — Capability Reality Test Suite
 *
 * Validates the P1-1..P1-9 dispositions (MOCK DATA RULE):
 *   - P1-1 locations -> 501 UNAVAILABLE, no fabricated list
 *   - P1-2 market    -> 501 UNAVAILABLE, no fabricated prices
 *   - P1-3 tiannara  -> 501 UNAVAILABLE bodies (R1 auth gate intact)
 *   - P1-4 fail-closed moderation (503, no post) + success path (201)
 *   - P1-5 impact    -> raw-only dashboard (no KES/hours/badges)
 *   - P1-6 skills    -> no match_score/testimonials; completeExchange 501
 *   - P1-7 reputation-> no signature; badges/ledger/feedback/submit 501
 *   - P1-8 mounted routers respond; comments.js deleted; nested comment-like works
 *   - P1-9 engage like/unlike real; repost/save/saved/distribution 501
 *
 * Run: npm run test:r3
 */
process.env.NODE_ENV = 'test';
// Point the moderation client at our stub server (started below) BEFORE app load.
const STUB_PORT = 4888 + Math.floor(Math.random() * 500);
process.env.TIANNARA_API_URL = `http://127.0.0.1:${STUB_PORT}`;
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const jwt = require('jsonwebtoken');

let server;
let stubServer;
let stubMode = 'up'; // 'up' | 'down'
const PORT = 3999 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;

let userAId; let userAToken;
let userBId; let userBToken;
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

async function req(method, p, body = null, authToken = null, port = PORT) {
  return new Promise((resolve, reject) => {
    const url = new URL(p, `http://127.0.0.1:${port}`);
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
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function startStub() {
  // Minimal Tiannara stub: healthy returns { safe:true,... }; when stubMode
  // is 'down' the server is closed so connections refuse (fail-closed path).
  stubServer = http.createServer((sreq, sres) => {
    let body = '';
    sreq.on('data', (c) => (body += c));
    sreq.on('end', () => {
      sres.writeHead(200, { 'Content-Type': 'application/json' });
      sres.end(JSON.stringify({
        safe: true, toxicity_score: 0, spam_probability: 0,
        scam_probability: 0, categories_flagged: [], confidence: 0.99
      }));
    });
  });
  return new Promise((resolve) => stubServer.listen(STUB_PORT, () => resolve()));
}

function stopStub() {
  return new Promise((resolve) => {
    if (!stubServer) return resolve();
    stubServer.close(() => resolve());
    stubServer = null;
  });
}

async function setup() {
  await connectDB();
  await createTables();
  await startStub();
  const ts = Date.now();
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('R3-Correct-Password-123!', 10);
  const mk = async (name, role) => (await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id`,
    [`r3_${name}_${ts}`, `r3_${name}_${ts}@example.com`, hash, role]
  )).rows[0].id;
  userAId = await mk('usera', 'user');
  userBId = await mk('userb', 'user');
  adminId = await mk('admin', 'admin');
  userAToken = token(userAId);
  userBToken = token(userBId);
  adminToken = token(adminId);
}

async function teardown() {
  await stopStub().catch(() => {});
  const ids = [userAId, userBId, adminId];
  await query(`DELETE FROM impact_metrics WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM user_skills WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM comments WHERE author_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM posts WHERE author_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [ids]).catch(() => {});
}

async function tests() {
  console.log('\n=== R3 CAPABILITY REALITY TESTS ===\n');

  // ===== P1-1 locations -> 501 =====
  console.log('P1-1: locations UNAVAILABLE');
  const loc = await req('GET', '/api/locations');
  assert(loc.status === 501, 'GET /api/locations -> 501');
  assert(loc.body && loc.body.code === 'LOCATIONS_UNAVAILABLE', 'locations body has LOCATIONS_UNAVAILABLE code');
  assert(!(loc.body && loc.body.data && loc.body.data.settlements), 'locations body has NO settlements payload');

  // ===== P1-2 market -> 501 =====
  console.log('\nP1-2: market UNAVAILABLE');
  const mkt = await req('GET', '/api/market/prices');
  assert(mkt.status === 501, 'GET /api/market/prices -> 501');
  assert(mkt.body && mkt.body.code === 'MARKET_UNAVAILABLE', 'market body has MARKET_UNAVAILABLE code');
  assert(!(mkt.body && Array.isArray(mkt.body.data)), 'market body has NO price array');

  // ===== P1-3 tiannara -> 501 (gate intact) =====
  console.log('\nP1-3: tiannara UNAVAILABLE (R1 gate intact)');
  const tAnon = await req('POST', '/api/tiannara/moderate', { content: 'hello' });
  assert(tAnon.status === 401, 'tiannara anonymous -> 401 (R1 gate)');
  const tUser = await req('POST', '/api/tiannara/moderate', { content: 'hello' }, userAToken);
  assert(tUser.status === 403, 'tiannara ordinary user -> 403 (R1 gate)');
  for (const ep of ['mental-health', 'fact-check', 'moderate']) {
    const r = await req('POST', `/api/tiannara/${ep}`, { message: 'hello', content: 'hello' }, adminToken);
    assert(r.status === 501, `tiannara/${ep} admin -> 501`);
    assert(r.body && r.body.code === 'TIANNARA_UNAVAILABLE', `tiannara/${ep} body has TIANNARA_UNAVAILABLE`);
  }

  // ===== P1-4 fail-closed moderation =====
  console.log('\nP1-4: fail-closed moderation');
  // Success path first (stub up). validatePost requires author >= 2 chars.
  const ok = await req('POST', '/api/posts',
    { title: 'R3 real post', content: 'hello world content', category: 'mtaani', author: 'R3 Tester' }, userAToken);
  assert(ok.status === 201, 'POST /api/posts with moderation up -> 201');
  const createdPostId = ok.body && ok.body.data && ok.body.data.id;
  assert(!!createdPostId, 'created post has an id');
  // Failure path: stop the stub -> connection refused -> 503, no post.
  await stopStub();
  const before = (await query(`SELECT COUNT(*)::int AS n FROM posts WHERE author_id = $1`, [userAId])).rows[0].n;
  const fail = await req('POST', '/api/posts',
    { title: 'R3 blocked post', content: 'hello world content', category: 'mtaani', author: 'R3 Tester' }, userAToken);
  assert(fail.status === 503, 'POST /api/posts with moderation down -> 503');
  assert(fail.body && fail.body.code === 'MODERATION_UNAVAILABLE', 'failure body has MODERATION_UNAVAILABLE');
  const after = (await query(`SELECT COUNT(*)::int AS n FROM posts WHERE author_id = $1`, [userAId])).rows[0].n;
  assert(after === before, 'no post row created on moderation failure');
  const blocked = await query(
    `SELECT COUNT(*)::int AS n FROM posts WHERE title = 'R3 blocked post' AND author_id = $1`,
    [userAId]);
  assert(blocked.rows[0].n === 0, 'no false moderationChecked:true row written for the blocked post');

  // ===== P1-5 impact raw-only =====
  console.log('\nP1-5: impact raw-only dashboard');
  await query(`INSERT INTO impact_metrics (user_id, event_type, impact_value) VALUES ($1,'help_provided',3),($1,'exchange_completed',2),($1,'time_saved',4)`, [userAId]);
  const dash = await req('GET', `/api/impact/${userAId}/dashboard`, null, userAToken);
  assert(dash.status === 200, 'GET /impact/:id/dashboard -> 200 (mounted)');
  if (dash.status === 200) {
    const d = dash.body.data || {};
    const text = JSON.stringify(dash.body);
    assert(!text.includes('KES'), 'dashboard has NO fabricated KES conversion');
    assert(!text.includes('hours'), 'dashboard has NO fabricated hours conversion');
    assert(!('badges' in d), 'dashboard has NO hardcoded badges array');
    assert(d.contribution_breakdown && d.contribution_breakdown.help_provided === 3, 'raw help_provided sum present');
  }

  // ===== P1-6 skills =====
  console.log('\nP1-6: skills real matches, no fabricated score');
  await query(`INSERT INTO user_skills (user_id, skill_name, proficiency, is_offering, is_seeking) VALUES ($1,'Plumbing',4,true,false),($1,'Baking',2,false,true)`, [userAId]);
  await query(`INSERT INTO user_skills (user_id, skill_name, proficiency, is_offering, is_seeking) VALUES ($1,'Baking',5,true,false),($1,'Plumbing',3,false,true)`, [userBId]);
  const matches = await req('GET', '/api/skills/matches', null, userAToken);
  assert(matches.status === 200, 'GET /skills/matches -> 200 (mounted)');
  if (matches.status === 200) {
    const text = JSON.stringify(matches.body);
    assert(!text.includes('match_score'), 'matches have NO fabricated match_score');
    assert(!text.includes('testimonials'), 'matches have NO synthetic testimonials');
  }
  const prof = await req('GET', '/api/skills/profile', null, userAToken);
  assert(prof.status === 200, 'GET /skills/profile -> 200 (mounted, real CRUD)');
  const ce = await req('POST', '/api/skills/complete/whatever', { quality_rating: 5 }, userAToken);
  assert(ce.status === 501, 'POST /skills/complete/:id -> 501 (no fake success)');

  // ===== P1-7 reputation =====
  console.log('\nP1-7: reputation real shapes, stubs 501');
  const lb = await req('GET', '/api/reputation/leaderboard/all');
  assert(lb.status === 200, 'GET /reputation/leaderboard/all -> 200 public');
  const rep = await req('GET', `/api/reputation/${userAId}`, null, userAToken);
  assert(rep.status === 200, 'GET /reputation/:userId -> 200 (mounted, protected)');
  const passport = await req('GET', '/api/reputation/export', null, userAToken);
  assert(passport.status === 200, 'GET /reputation/export -> 200');
  if (passport.status === 200) {
    assert(!('signature' in (passport.body.data || {})), 'passport has NO mock signature');
  }
  for (const ep of [`/api/reputation/${userAId}/badges`, `/api/reputation/${userAId}/ledger`, `/api/reputation/${userAId}/feedback`]) {
    const r = await req('GET', ep, null, userAToken);
    assert(r.status === 501, `GET ${ep} -> 501`);
  }
  const sf = await req('POST', '/api/reputation/feedback/submit', { x: 1 }, userAToken);
  assert(sf.status === 501, 'POST /reputation/feedback/submit -> 501 (no fake success)');

  // ===== P1-8 mounted routers + deleted comments.js + nested comment-like =====
  console.log('\nP1-8: mounted routers, deleted comments.js, nested comment-like');
  const dashAnon = await req('GET', `/api/impact/${userAId}/dashboard`);
  assert(dashAnon.status === 401, 'impact dashboard anonymous -> 401 (protect)');
  const repAnon = await req('GET', `/api/reputation/${userAId}`);
  assert(repAnon.status === 401, 'reputation profile anonymous -> 401 (protect)');
  assert(!fs.existsSync(path.join(__dirname, '..', 'src', 'routes', 'comments.js')),
    'src/routes/comments.js does NOT exist on disk');
  // Nested comment-like round-trip.
  const post = await query(
    `INSERT INTO posts (title, content, author_id, category) VALUES ('R3 like post','body',$1,'mtaani') RETURNING id`,
    [userAId]);
  const postId = post.rows[0].id;
  const cmt = await query(
    `INSERT INTO comments (content, author_id, post_id) VALUES ('nice',$1,$2) RETURNING id`,
    [userBId, postId]);
  const cmtId = cmt.rows[0].id;
  const like = await req('PATCH', `/api/posts/${postId}/comments/${cmtId}/like`, null, userAToken);
  assert(like.status === 200, 'PATCH nested comment-like -> 200');
  if (like.status === 200) {
    assert(like.body && like.body.data && like.body.data.likes === 1, 'comment likes incremented to 1');
  }
  const likeWrongPost = await req('PATCH', `/api/posts/${createdPostId}/comments/${cmtId}/like`, null, userAToken);
  assert(likeWrongPost.status === 404, 'comment-like under wrong post -> 404');

  // ===== P1-9 engage + save/saved + distribution =====
  console.log('\nP1-9: engage REAL, save/saved/distribution 501');
  const eLike = await req('PATCH', `/api/posts/${postId}/engage?type=like`, null, userAToken);
  assert(eLike.status === 200, 'engage?type=like -> 200 (real counter)');
  const eUnlike = await req('PATCH', `/api/posts/${postId}/engage?type=unlike`, null, userAToken);
  assert(eUnlike.status === 200, 'engage?type=unlike -> 200 (real counter)');
  const eRepost = await req('PATCH', `/api/posts/${postId}/engage?type=repost`, null, userAToken);
  assert(eRepost.status === 501, 'engage?type=repost -> 501 (no storage)');
  const eBad = await req('PATCH', `/api/posts/${postId}/engage?type=bogus`, null, userAToken);
  assert(eBad.status === 400, 'engage?type=bogus -> 400');
  const eAnon = await req('PATCH', `/api/posts/${postId}/engage?type=like`);
  assert(eAnon.status === 401, 'engage anonymous -> 401');
  const sPost = await req('POST', `/api/posts/${postId}/save`, null, userAToken);
  assert(sPost.status === 501, 'POST /posts/:id/save -> 501');
  const sGet = await req('GET', '/api/posts/saved', null, userAToken);
  assert(sGet.status === 501, 'GET /posts/saved -> 501 (not swallowed by /:id)');
  const dPost = await req('POST', '/api/distribution/repost', { sourceType: 'post', sourceId: postId }, userAToken);
  assert(dPost.status === 501, 'POST /distribution/repost -> 501');
  const dAnon = await req('POST', '/api/distribution/repost', { sourceType: 'post', sourceId: postId });
  assert(dAnon.status === 401, 'distribution anonymous -> 401');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`R3 test server listening on ${BASE}`);
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
      console.log('\u2705 All R3 tests passed');
    }
  }
}

run();
