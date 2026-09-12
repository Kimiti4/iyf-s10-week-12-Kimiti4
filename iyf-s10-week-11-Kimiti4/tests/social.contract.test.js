/**
 * Social Contract Tests (follows-on work: notifications, activity,
 * stories, likes, profile views)
 *
 * Validates:
 *   - GET /api/notifications (own only) + unread-count + read + read-all
 *   - follow creates a persisted notification for the recipient
 *   - GET /api/activity/me aggregates real actions (no mocks)
 *   - POST/GET/DELETE /api/stories lifecycle + 24h expiry filter + validation
 *   - like/unlike records post_likes; GET /api/users/likes/me returns them
 *   - profile views recorded on GET /api/users/:id; counts in follow-state
 *   - anonymous access denied throughout
 *
 * Run with: npm run test:social
 * Requires: DATABASE_URL pointing to a test database
 */
process.env.NODE_ENV = 'test';
const STUB_PORT = 4877 + Math.floor(Math.random() * 500);
process.env.TIANNARA_API_URL = `http://127.0.0.1:${STUB_PORT}`;
require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const { connectDB, pool, query } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const jwt = require('jsonwebtoken');

let server;
let stubServer;
const PORT = 3555 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}`;

let userAId; let userAToken;
let userBId; let userBToken;

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
  // Stub moderation service (P1-4 fail-closed requires it for post creation)
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
  const hash = await bcrypt.hash('Social-Test-Password-123!', 10);
  const mk = async (name) => (await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id`,
    [`soc_${name}_${ts}`, `soc_${name}_${ts}@example.com`, hash]
  )).rows[0].id;
  userAId = await mk('usera');
  userBId = await mk('userb');
  userAToken = token(userAId);
  userBToken = token(userBId);
}

async function teardown() {
  const ids = [userAId, userBId];
  await query(`DELETE FROM notifications WHERE user_id = ANY($1::uuid[]) OR actor_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM profile_views WHERE viewer_id = ANY($1::uuid[]) OR viewed_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM post_likes WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM stories WHERE user_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM comments WHERE author_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM posts WHERE author_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM follows WHERE follower_id = ANY($1::uuid[]) OR following_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [ids]).catch(() => {});
  // Remove the uploaded test file created by this suite (uploads dir is
  // gitignored, but keep it clean; only the exact file we created)
  try {
    if (global.__socialUploadUrl) {
      const fs = require('fs');
      const path = require('path');
      const name = path.basename(global.__socialUploadUrl);
      if (/^[0-9a-f-]+\.(png|jpg|gif|webp)$/.test(name)) {
        fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads', name));
      }
    }
  } catch { /* ignore */ }
}

async function tests() {
  console.log('\n=== SOCIAL CONTRACT TESTS ===\n');

  // Anonymous denied
  console.log('auth gates');
  let r = await req('GET', '/api/notifications');
  assert(r.status === 401, 'anonymous notifications -> 401');
  r = await req('GET', '/api/activity/me');
  assert(r.status === 401, 'anonymous activity -> 401');
  r = await req('GET', '/api/stories/me');
  assert(r.status === 401, 'anonymous stories -> 401');
  r = await req('GET', '/api/users/likes/me', null, null);
  assert(r.status === 401, 'anonymous liked posts -> 401');

  // Notifications: follow creates one for the recipient
  console.log('\nnotifications');
  r = await req('POST', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.status === 201, 'A follows B -> 201');
  r = await req('GET', '/api/notifications', null, userBToken);
  assert(r.status === 200, 'B lists notifications -> 200');
  assert(Array.isArray(r.body?.notifications) && r.body.notifications.length === 1, 'B has exactly 1 notification');
  assert(r.body.notifications[0].type === 'follow', 'notification type is follow');
  assert(r.body.notifications[0].read === false, 'notification starts unread');
  r = await req('GET', '/api/notifications/unread-count', null, userBToken);
  assert(r.status === 200 && r.body?.count === 1, 'unread count is 1');
  const noteId = (await req('GET', '/api/notifications', null, userBToken)).body.notifications[0].id;
  r = await req('PATCH', `/api/notifications/${noteId}/read`, null, userBToken);
  assert(r.status === 200, 'mark read -> 200');
  r = await req('GET', '/api/notifications/unread-count', null, userBToken);
  assert(r.body?.count === 0, 'unread count is 0 after read');
  // A cannot read B's notification
  r = await req('PATCH', `/api/notifications/${noteId}/read`, null, userAToken);
  assert(r.status === 404, 'non-owner mark read -> 404');
  // read-all
  await req('POST', `/api/users/${userBId}/follow`, null, userAToken).catch(() => {});
  await query(`INSERT INTO notifications (user_id, type) VALUES ($1, 'system')`, [userBId]);
  r = await req('PATCH', '/api/notifications/read-all', null, userBToken);
  assert(r.status === 200 && r.body?.markedRead >= 1, 'read-all marks remaining');

  // Activity: real aggregation, no mocks
  console.log('\nactivity');
  await req('POST', '/api/posts', { title: 'Activity post', content: 'content for activity feed test', category: 'mtaani', author: 'x' }, userAToken);
  r = await req('GET', '/api/activity/me', null, userAToken);
  assert(r.status === 200, 'activity -> 200');
  assert(Array.isArray(r.body?.data) && r.body.data.length >= 2, 'activity contains real actions (post + follow)');
  assert(r.body.data.every((a) => a.id && a.type && a.action && a.timestamp), 'every item has id/type/action/timestamp');
  assert(typeof r.body?.stats?.posts === 'number', 'stats.posts is a real number');

  // Stories lifecycle
  console.log('\nstories');
  r = await req('POST', '/api/stories', {}, userAToken);
  assert(r.status === 400, 'empty story rejected -> 400');
  r = await req('POST', '/api/stories', { textContent: 'Hello stories' }, userAToken);
  assert(r.status === 201, 'text story created -> 201');
  const storyId = r.body?.data?.id;
  assert(!!storyId, 'story has an id');
  r = await req('GET', '/api/stories/me', null, userAToken);
  assert(r.status === 200 && r.body?.data?.some((s) => s.id === storyId), 'own stories list it');
  r = await req('GET', `/api/stories/user/${userAId}`, null, userBToken);
  assert(r.status === 200 && r.body?.data?.some((s) => s.id === storyId), 'other user sees active story');
  // Expired stories are filtered
  await query(`UPDATE stories SET expires_at = NOW() - INTERVAL '1 hour' WHERE id = $1`, [storyId]);
  r = await req('GET', `/api/stories/user/${userAId}`, null, userBToken);
  assert(r.status === 200 && !r.body?.data?.some((s) => s.id === storyId), 'expired story filtered out');
  await query(`UPDATE stories SET expires_at = NOW() + INTERVAL '1 hour' WHERE id = $1`, [storyId]);
  r = await req('DELETE', `/api/stories/${storyId}`, null, userBToken);
  assert(r.status === 404, 'non-owner delete -> 404');
  r = await req('DELETE', `/api/stories/${storyId}`, null, userAToken);
  assert(r.status === 200, 'owner delete -> 200');

  // Likes + liked tab + views
  console.log('\nlikes + views');
  const postRes = await req('POST', '/api/posts', { title: 'Likeable post', content: 'content for like test', category: 'mtaani', author: 'x' }, userBToken);
  const postId = postRes.body?.data?.id;
  assert(!!postId, 'post created for like test');
  r = await req('PATCH', `/api/posts/${postId}/like`, null, userAToken);
  assert(r.status === 200, 'like -> 200');
  r = await req('GET', '/api/users/likes/me', null, userAToken);
  assert(r.status === 200 && r.body?.data?.some((p) => p.id === postId), 'liked tab lists the post');
  r = await req('GET', `/api/users/${userBId}`, null, userAToken);
  assert(r.status === 200, 'view B profile -> 200');
  r = await req('GET', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.body?.data?.profileViews === 1, 'profileViews counts distinct viewer');
  // Second view by same viewer does not double-count
  await req('GET', `/api/users/${userBId}`, null, userAToken);
  r = await req('GET', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.body?.data?.profileViews === 1, 'repeat view by same viewer not double-counted');

  // ===== Uploads =====
  console.log('\nuploads');
  // 1x1 transparent PNG
  const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  r = await req('POST', '/api/uploads', null, null);
  assert(r.status === 401, 'anonymous upload -> 401');
  r = await req('POST', '/api/uploads',
    { filename: 'x.png', mimeType: 'image/png', data: tinyPng }, userAToken);
  assert(r.status === 201, 'valid PNG upload -> 201');
  assert(typeof r.body?.data?.url === 'string' && r.body.data.url.startsWith('/uploads/'), 'upload returns public URL');
  // Remember the stored file so teardown removes exactly what this suite created
  global.__socialUploadUrl = r.body?.data?.url || null;
  r = await req('POST', '/api/uploads',
    { filename: 'x.txt', mimeType: 'text/plain', data: tinyPng }, userAToken);
  assert(r.status === 400, 'disallowed MIME rejected -> 400');
  r = await req('POST', '/api/uploads',
    { filename: 'x.png', mimeType: 'image/png', data: tinyPng }, userAToken);
  // MIME/content mismatch: PNG bytes declared as JPEG
  r = await req('POST', '/api/uploads',
    { filename: 'x.jpg', mimeType: 'image/jpeg', data: tinyPng }, userAToken);
  assert(r.status === 400, 'MIME/content mismatch rejected -> 400');

  // ===== Like + comment notifications =====
  console.log('\nengagement notifications');
  // Clear B's notifications to isolate this section
  await query(`DELETE FROM notifications WHERE user_id = $1`, [userBId]);
  const likePost = await req('POST', '/api/posts',
    { title: 'Notify post', content: 'content for notification test', category: 'mtaani', author: 'x' },
    userBToken);
  const likePostId = likePost.body?.data?.id;
  assert(!!likePostId, 'post created for notification test');
  await req('PATCH', `/api/posts/${likePostId}/like`, null, userAToken);
  r = await req('GET', '/api/notifications', null, userBToken);
  assert(r.status === 200 && r.body?.notifications?.some((n) => n.type === 'like'), 'like creates notification for author');
  await req('POST', `/api/posts/${likePostId}/comments`, { content: 'nice post', author: 'x' }, userAToken);
  r = await req('GET', '/api/notifications', null, userBToken);
  assert(r.body?.notifications?.some((n) => n.type === 'comment'), 'comment creates notification for author');
  // Self-like creates no notification
  const ownPost = await req('POST', '/api/posts',
    { title: 'Own post', content: 'content for self-like test', category: 'mtaani', author: 'x' },
    userAToken);
  await req('PATCH', `/api/posts/${ownPost.body?.data?.id}/like`, null, userAToken);
  const ownNotes = (await query(`SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND type = 'like'`, [userAId])).rows[0].n;
  assert(ownNotes === 0, 'self-like creates no notification');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`social test server listening on ${BASE}`);
    });
    await new Promise((r) => setTimeout(r, 250));
    await tests();
  } catch (err) {
    console.error('Test runner error:', err.message);
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
      console.log('✅ All social tests passed');
    }
  }
}

run();
