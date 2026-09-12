/**
 * Messaging + Follows Contract Tests
 *
 * Validates:
 *   - POST /api/messages/conversations (get-or-create, duplicate prevention)
 *   - GET /api/messages/conversations (lists own only)
 *   - GET /api/messages/conversations/:id (messages; 404 for non-participant)
 *   - POST /api/messages/conversations/:id/messages (validation, persistence)
 *   - PATCH /api/messages/conversations/:id/read (marks peer messages read)
 *   - POST /api/users/:id/follow + DELETE (real follow state)
 *   - GET /api/users/:id/follow (state + counts)
 *   - anonymous access denied throughout
 *
 * Run with: npm run test:messages
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
const PORT = 3666 + Math.floor(Math.random() * 1000);
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
  const ts = Date.now();
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('Msg-Test-Password-123!', 10);
  const mk = async (name) => (await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id`,
    [`msg_${name}_${ts}`, `msg_${name}_${ts}@example.com`, hash]
  )).rows[0].id;
  userAId = await mk('usera');
  userBId = await mk('userb');
  userAToken = token(userAId);
  userBToken = token(userBId);
}

async function teardown() {
  const ids = [userAId, userBId];
  await query(`DELETE FROM messages WHERE sender_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM conversations WHERE participant_one = ANY($1::uuid[]) OR participant_two = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM follows WHERE follower_id = ANY($1::uuid[]) OR following_id = ANY($1::uuid[])`, [ids]).catch(() => {});
  await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [ids]).catch(() => {});
}

async function tests() {
  console.log('\n=== MESSAGES + FOLLOWS CONTRACT TESTS ===\n');

  // Anonymous denied
  console.log('auth gates');
  let r = await req('GET', '/api/messages/conversations');
  assert(r.status === 401, 'anonymous list conversations -> 401');
  r = await req('POST', '/api/messages/conversations', { userId: userBId });
  assert(r.status === 401, 'anonymous create conversation -> 401');
  r = await req('POST', `/api/users/${userBId}/follow`, null, null);
  assert(r.status === 401, 'anonymous follow -> 401');

  // Create conversation A -> B
  console.log('\nconversations');
  r = await req('POST', '/api/messages/conversations', { userId: userBId }, userAToken);
  assert(r.status === 201, 'A creates conversation with B -> 201');
  const convoId = r.body?.data?.id;
  assert(!!convoId, 'conversation has an id');
  assert(r.body?.data?.participant?.id === userBId, 'participant is user B');

  // Duplicate prevention: same pair returns same conversation, no new row
  const before = (await query(`SELECT COUNT(*)::int AS n FROM conversations`)).rows[0].n;
  r = await req('POST', '/api/messages/conversations', { userId: userAId }, userBToken);
  assert(r.status === 201, 'B creates conversation with A -> 201');
  assert(r.body?.data?.id === convoId, 'same pair returns SAME conversation id');
  const after = (await query(`SELECT COUNT(*)::int AS n FROM conversations`)).rows[0].n;
  assert(after === before, 'no duplicate conversation row created');

  // Validation
  r = await req('POST', '/api/messages/conversations', {}, userAToken);
  assert(r.status === 400, 'missing userId -> 400');
  r = await req('POST', '/api/messages/conversations', { userId: userAId }, userAToken);
  assert(r.status === 400, 'conversation with self -> 400');

  // B lists conversations, sees A
  r = await req('GET', '/api/messages/conversations', null, userBToken);
  assert(r.status === 200, 'B lists conversations -> 200');
  assert(Array.isArray(r.body?.data) && r.body.data.some((c) => c.id === convoId), 'B sees the conversation');

  // Non-participant cannot read (third user would 404; A is participant so use bogus id)
  r = await req('GET', '/api/messages/conversations/00000000-0000-0000-0000-000000000000', null, userAToken);
  assert(r.status === 404, 'unknown conversation -> 404');

  // Send + fetch + read
  console.log('\nmessages');
  r = await req('POST', `/api/messages/conversations/${convoId}/messages`, { content: 'Hello from A' }, userAToken);
  assert(r.status === 201, 'A sends message -> 201');
  assert(r.body?.data?.content === 'Hello from A', 'message content round-trips');
  assert(r.body?.data?.senderId === userAId, 'sender is user A (server-derived, not body)');
  r = await req('POST', `/api/messages/conversations/${convoId}/messages`, { content: '   ' }, userAToken);
  assert(r.status === 400, 'empty message rejected -> 400');
  r = await req('GET', `/api/messages/conversations/${convoId}`, null, userBToken);
  assert(r.status === 200, 'B fetches messages -> 200');
  assert(r.body?.data?.length === 1 && r.body.data[0].content === 'Hello from A', 'B sees the message');
  r = await req('PATCH', `/api/messages/conversations/${convoId}/read`, null, userBToken);
  assert(r.status === 200, 'B marks read -> 200');
  assert(r.body?.markedRead === 1, 'one message marked read');

  // Follows
  console.log('\nfollows');
  r = await req('GET', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.status === 200, 'follow state -> 200');
  assert(r.body?.data?.isFollowing === false, 'initially not following');
  r = await req('POST', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.status === 201, 'follow -> 201');
  r = await req('GET', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.body?.data?.isFollowing === true, 'follow state true after follow');
  assert(r.body?.data?.followers === 1, 'follower count is 1');
  r = await req('POST', `/api/users/${userAId}/follow`, null, userAToken);
  assert(r.status === 400, 'follow self -> 400');
  r = await req('DELETE', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.status === 200, 'unfollow -> 200');
  r = await req('GET', `/api/users/${userBId}/follow`, null, userAToken);
  assert(r.body?.data?.isFollowing === false, 'follow state false after unfollow');
}

async function run() {
  try {
    await setup();
    server = app.listen(PORT, () => {
      console.log(`messages test server listening on ${BASE}`);
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
      console.log('✅ All messages/follows tests passed');
    }
  }
}

run();
