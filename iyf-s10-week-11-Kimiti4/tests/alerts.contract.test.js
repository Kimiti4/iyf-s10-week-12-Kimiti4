/**
 * Alerts API Contract Tests
 *
 * Validates:
 *   - GET /api/alerts (pagination, filters)
 *   - GET /api/alerts/:id
 *   - POST /api/alerts (validation, ownership)
 *   - PUT /api/alerts/:id (authorization matrix)
 *   - DELETE /api/alerts/:id (authorization matrix)
 *   - POST /api/alerts/:id/confirm (duplicate handling)
 *   - DELETE /api/alerts/:id/confirm
 *   - PUT /api/alerts/:id/verify (role + level validation)
 *   - GET /api/alerts/stats (summary structure)
 *   - Database CHECK constraint enforcement
 *
 * Run with:  npm run test:alerts
 *
 * Requires:  DATABASE_URL pointing to a test database
 *
 * The test sets NODE_ENV=test so the rate limiter middleware
 * is bypassed. This lets the suite exercise the full validation
 * + authorization contract in a single run. Rate limiter
 * behavior itself is verified by a separate test.
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const AlertRepository = require('../src/database/repositories/AlertRepository');
const { connectDB, pool, query } = require('../src/config/postgres');
const jwt = require('jsonwebtoken');

let server;
const PORT = 3333 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}`;

let testUserId;
let testUserToken;
let otherUserId;
let otherUserToken;
let moderatorId;
let moderatorToken;
let testAlertId;

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

function token(userId, role = 'user') {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
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
  // Create a test user
  const userRes = await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    [`testuser_${Date.now()}`, `test_${Date.now()}@example.com`, 'x', 'user']
  );
  testUserId = userRes.rows[0].id;
  testUserToken = token(testUserId, 'user');

  const otherRes = await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    [`otheruser_${Date.now()}`, `other_${Date.now()}@example.com`, 'x', 'user']
  );
  otherUserId = otherRes.rows[0].id;
  otherUserToken = token(otherUserId, 'user');

  const modRes = await query(
    `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    [`mod_${Date.now()}`, `mod_${Date.now()}@example.com`, 'x', 'moderator']
  );
  moderatorId = modRes.rows[0].id;
  moderatorToken = token(moderatorId, 'moderator');
}

async function teardown() {
  // Clean up alerts we created (cascade handles confirmations)
  await query(`DELETE FROM alerts WHERE author_id IN ($1, $2, $3)`, [testUserId, otherUserId, moderatorId]);
  await query(`DELETE FROM users WHERE id IN ($1, $2, $3)`, [testUserId, otherUserId, moderatorId]);
}

async function tests() {
  console.log('\n=== ALERTS CONTRACT TESTS ===\n');

  // 1. DTO purity (no author_id leak)
  console.log('1. DTO purity');
  const created = await AlertRepository.create({
    title: 'Contract Test Alert',
    description: 'Test description for contract validation',
    category: 'security',
    severity: 'warning',
    location: 'Westlands, Nairobi',
    county: 'Nairobi',
    settlement: 'Westlands',
    ward: 'Westlands Ward',
    coordinates: [36.8, -1.3],
    radius: 1.5,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    tags: ['test'],
    authorId: testUserId,
  });
  testAlertId = created.id;
  assert(created.id, 'created.id is present');
  assert(!('author_id' in created), 'author_id is NOT leaked in DTO');
  assert(created.author && created.author.id === testUserId, 'author.id matches owner');
  assert(created.author.username, 'author.username present');
  assert(created.author.avatarIcon !== undefined, 'author.avatarIcon present (not avatar)');
  assert(created.severity === 'warning', 'severity round-trips');
  assert(created.verificationLevel === 'unverified', 'verificationLevel = unverified');
  assert(typeof created.createdAt === 'string' || created.createdAt instanceof Date, 'createdAt present');
  assert(typeof created.coordinates[0] === 'number', 'coordinates[0] is number');
  assert(typeof created.radius === 'number' && Math.abs(created.radius - 1.5) < 0.001, 'radius persisted as decimal (1.5)');
  assert(created.expiresAt !== null, 'expiresAt persisted');
  assert(created.county === 'Nairobi', 'county persisted');
  assert(created.settlement === 'Westlands', 'settlement persisted');
  assert(created.ward === 'Westlands Ward', 'ward persisted');

  // 2. GET list (pagination, filters)
  console.log('\n2. GET /api/alerts');
  const list = await req('GET', '/api/alerts?page=1&limit=10');
  assert(list.status === 200, 'returns 200');
  assert(Array.isArray(list.body.data), 'data is array');
  assert(typeof list.body.total === 'number', 'total present');
  assert(typeof list.body.page === 'number', 'page present');
  assert(typeof list.body.pages === 'number', 'pages present');

  const filtered = await req('GET', '/api/alerts?severity=warning&limit=5');
  assert(filtered.status === 200, 'severity filter returns 200');

  const searched = await req('GET', '/api/alerts?search=Contract&limit=5');
  assert(searched.status === 200, 'search filter returns 200');
  assert(searched.body.data.some(a => a.id === testAlertId), 'search finds created alert');

  // 2b. Structured geographic filters (semantic — verify returned data matches the filter)
  console.log('\n2b. Structured geographic filters (semantic)');
  // Create two more alerts with distinct settlement/ward so we can verify
  // the filter narrows the result set, not just returns 200.
  const siblingA = await AlertRepository.create({
    title: 'Sibling A — Karen',
    description: 'Distinct alert in a different settlement for filter testing',
    category: 'security',
    severity: 'info',
    location: 'Karen, Nairobi',
    county: 'Nairobi',
    settlement: 'Karen',
    ward: 'Karen Ward',
    authorId: testUserId,
  });
  const siblingB = await AlertRepository.create({
    title: 'Sibling B — Kileleshwa',
    description: 'Another distinct alert in a third settlement for filter testing',
    category: 'security',
    severity: 'info',
    location: 'Kileleshwa, Nairobi',
    county: 'Nairobi',
    settlement: 'Kileleshwa',
    ward: 'Kileleshwa Ward',
    authorId: testUserId,
  });

  // county filter — must include Westlands + Karen + Kileleshwa, but not (e.g.) Mombasa
  const byCounty = await req('GET', '/api/alerts?county=Nairobi&limit=100');
  assert(byCounty.status === 200, 'county filter returns 200');
  const countyRows = byCounty.body.data;
  assert(countyRows.some(a => a.id === testAlertId), 'county=Nairobi includes Westlands alert');
  assert(countyRows.some(a => a.id === siblingA.id), 'county=Nairobi includes Karen alert');
  assert(countyRows.some(a => a.id === siblingB.id), 'county=Nairobi includes Kileleshwa alert');

  // settlement filter — only Westlands alert should match
  const bySettlement = await req('GET', '/api/alerts?settlement=Westlands&limit=100');
  assert(bySettlement.status === 200, 'settlement filter returns 200');
  const settlementRows = bySettlement.body.data;
  assert(settlementRows.some(a => a.id === testAlertId), 'settlement=Westlands includes Westlands alert');
  assert(!settlementRows.some(a => a.id === siblingA.id), 'settlement=Westlands excludes Karen alert');
  assert(!settlementRows.some(a => a.id === siblingB.id), 'settlement=Westlands excludes Kileleshwa alert');

  // ward filter — only Westlands Ward alert should match
  const byWard = await req('GET', '/api/alerts?ward=Westlands&limit=100');
  assert(byWard.status === 200, 'ward filter returns 200');
  const wardRows = byWard.body.data;
  assert(wardRows.some(a => a.id === testAlertId), 'ward=Westlands includes Westlands alert');
  assert(!wardRows.some(a => a.id === siblingA.id), 'ward=Westlands excludes Karen alert');
  assert(!wardRows.some(a => a.id === siblingB.id), 'ward=Westlands excludes Kileleshwa alert');

  // Cleanup the sibling alerts so they don't interfere with later tests
  await AlertRepository.remove(siblingA.id);
  await AlertRepository.remove(siblingB.id);

  // 2c. Full-text search on title (FTS path)
  console.log('\n2c. Full-text search');
  const ftsSearch = await req('GET', '/api/alerts?search=Contract&limit=5');
  assert(ftsSearch.status === 200, 'FTS search returns 200');
  assert(ftsSearch.body.data.some(a => a.id === testAlertId), 'FTS finds created alert by title word');

  // 2d. FTS schema detection + fallback
  console.log('\n2d. FTS schema detection');
  const ftsAvailable = await AlertRepository._detectFts();
  assert(typeof ftsAvailable === 'boolean', '_detectFts() returns boolean');
  if (ftsAvailable) {
    // Verify cached result
    const ftsCached = await AlertRepository._detectFts();
    assert(ftsAvailable === ftsCached, '_detectFts() is cached');
    console.log('    (search_vector column present — FTS path active)');
  } else {
    // Verify the ILIKE-only fallback path still works
    const ilikeSearch = await req('GET', '/api/alerts?search=Contract&limit=5');
    assert(ilikeSearch.status === 200, 'ILIKE fallback search returns 200');
    assert(ilikeSearch.body.data.some(a => a.id === testAlertId), 'ILIKE fallback finds created alert');
    console.log('    (search_vector column missing — ILIKE fallback path active)');
  }

  // 3. GET by id
  console.log('\n3. GET /api/alerts/:id');
  const byId = await req('GET', `/api/alerts/${testAlertId}`);
  assert(byId.status === 200, 'returns 200');
  assert(byId.body.data.id === testAlertId, 'id matches');
  assert(!('author_id' in byId.body.data), 'no author_id in GET response');

  const notFound = await req('GET', `/api/alerts/00000000-0000-0000-0000-000000000000`);
  assert(notFound.status === 404, 'unknown id returns 404');

  // 4. POST validation
  console.log('\n4. POST /api/alerts');
  const noAuth = await req('POST', '/api/alerts', { title: 'x', description: 'y', category: 'security', severity: 'info' });
  assert(noAuth.status === 401, 'POST without auth returns 401');

  const missingFields = await req('POST', '/api/alerts', { title: 'x' }, testUserToken);
  assert(missingFields.status === 400, 'POST missing fields returns 400');

  // 5. CHECK constraint enforcement
  console.log('\n5. Database CHECK constraints');
  const invalidSeverity = await req('POST', '/api/alerts', {
    title: 'Invalid', description: 'test', category: 'security', severity: 'low',
  }, testUserToken);
  assert(invalidSeverity.status === 400 || invalidSeverity.status === 500, 'invalid severity rejected');

  const invalidVerification = await query(
    `INSERT INTO alerts (title, description, category, severity, verification_level, author_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    ['bad verify', 'desc', 'security', 'info', 'invalid_level', testUserId]
  ).then(() => null).catch((e) => e);
  assert(invalidVerification && invalidVerification.code === '23514', 'invalid verification_level rejected by CHECK constraint');

  // 6. PUT authorization
  console.log('\n6. PUT /api/alerts/:id authorization');
  const otherUserEdit = await req('PUT', `/api/alerts/${testAlertId}`, { title: 'Hacked' }, otherUserToken);
  assert(otherUserEdit.status === 403, 'non-owner non-mod cannot edit (403)');

  const ownerEdit = await req('PUT', `/api/alerts/${testAlertId}`, { title: 'Updated by owner' }, testUserToken);
  assert(ownerEdit.status === 200, 'owner can edit (200)');
  assert(ownerEdit.body.data.title === 'Updated by owner', 'title updated');

  const modEdit = await req('PUT', `/api/alerts/${testAlertId}`, { title: 'Mod updated' }, moderatorToken);
  assert(modEdit.status === 200, 'moderator can edit (200)');

  // 7. DELETE authorization
  console.log('\n7. DELETE /api/alerts/:id authorization');
  const otherUserDelete = await req('DELETE', `/api/alerts/${testAlertId}`, null, otherUserToken);
  assert(otherUserDelete.status === 403, 'non-owner non-mod cannot delete (403)');

  // 8. Confirm
  console.log('\n8. POST /api/alerts/:id/confirm');
  const confirm = await req('POST', `/api/alerts/${testAlertId}/confirm`, {}, otherUserToken);
  assert(confirm.status === 200, 'confirm returns 200');
  assert(confirm.body.data.confirmationCount === 1, 'confirmationCount = 1');

  const dupConfirm = await req('POST', `/api/alerts/${testAlertId}/confirm`, {}, otherUserToken);
  assert(dupConfirm.status === 400, 'duplicate confirm returns 400');

  // 9. Unconfirm
  console.log('\n9. DELETE /api/alerts/:id/confirm');
  const unconfirm = await req('DELETE', `/api/alerts/${testAlertId}/confirm`, {}, otherUserToken);
  assert(unconfirm.status === 200, 'unconfirm returns 200');
  assert(unconfirm.body.data.confirmationCount === 0, 'confirmationCount = 0');

  // 10. Verify
  console.log('\n10. PUT /api/alerts/:id/verify');
  const userVerify = await req('PUT', `/api/alerts/${testAlertId}/verify`,
    { verificationLevel: 'official' }, testUserToken);
  assert(userVerify.status === 403, 'regular user cannot verify (403)');

  const modVerify = await req('PUT', `/api/alerts/${testAlertId}/verify`,
    { verificationLevel: 'mod_verified' }, moderatorToken);
  assert(modVerify.status === 200, 'moderator can verify (200)');
  assert(modVerify.body.data.verificationLevel === 'mod_verified', 'verificationLevel updated');

  const badVerify = await req('PUT', `/api/alerts/${testAlertId}/verify`,
    { verificationLevel: 'invalid' }, moderatorToken);
  assert(badVerify.status === 400, 'invalid verification level returns 400');

  // 11. Stats endpoint
  console.log('\n11. GET /api/alerts/stats');
  const stats = await req('GET', '/api/alerts/stats');
  assert(stats.status === 200, 'returns 200');
  assert(stats.body.data.summary, 'has summary metrics');
  assert(typeof stats.body.data.summary.active === 'number', 'summary.active is number');
  assert(typeof stats.body.data.summary.critical === 'number', 'summary.critical is number');
  assert(typeof stats.body.data.summary.warning === 'number', 'summary.warning is number');
  assert(typeof stats.body.data.summary.info === 'number', 'summary.info is number');
  assert(typeof stats.body.data.summary.verified === 'number', 'summary.verified is number');
  assert(typeof stats.body.data.summary.expiringSoon === 'number', 'summary.expiringSoon is number');

  // 12. Mod can delete
  console.log('\n12. Mod delete');
  const modDelete = await req('DELETE', `/api/alerts/${testAlertId}`, null, moderatorToken);
  assert(modDelete.status === 200, 'moderator can delete (200)');
}

async function run() {
  server = app.listen(PORT, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  try {
    await setup();
    await tests();
  } catch (err) {
    console.error('Test run error:', err);
    results.failed++;
    results.errors.push(`Test framework error: ${err.message}`);
  } finally {
    await teardown();
    server.close();
    await pool.end();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`RESULTS: ${results.passed} passed, ${results.failed} failed`);
  if (results.failed > 0) {
    console.log('\nFailures:');
    results.errors.forEach((e) => console.log(`  - ${e}`));
    process.exitCode = 1;
  } else {
    console.log('✅ All contract tests passed');
  }
}

run();
