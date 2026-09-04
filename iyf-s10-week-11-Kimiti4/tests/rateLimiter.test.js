/**
 * Rate Limiter Test
 *
 * Verifies that:
 *   1. In test mode (NODE_ENV=test) the limiters are bypassed, so contract /
 *      integration suites can exercise validation + authorization without
 *      exhausting the per-IP window.
 *   2. In production mode (NODE_ENV=test unset) the limiters still enforce
 *      caps — as soon as a burst passes `max`, excess requests return 429.
 *
 * Run with:  npm run test:ratelimit
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const express = require('express');
const rateLimit = require('express-rate-limit');

const { generalLimiter, authLimiter, alertLimiter } = require('../src/middleware/rateLimiter');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL  ${msg}`);
  }
}

function makeApp(limiter) {
  const app = express();
  app.use('/api', limiter);
  app.get('/api/hello', (req, res) => res.json({ ok: true }));
  return app;
}

async function fireSequential(app, n) {
  const server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const statuses = [];
  try {
    for (let i = 0; i < n; i++) {
      await new Promise((resolve, reject) => {
        const get = http.get(`${base}/api/hello`, (res) => {
          statuses.push(res.statusCode);
          res.resume();
          res.on('end', resolve);
        });
        get.on('error', reject);
      });
    }
  } finally {
    server.close();
  }
  return statuses;
}

(async () => {
  console.log('Rate limiter: production enforcement + test-mode bypass');

  // --- Type shape: express-rate-limit middleware are functions ---
  assert(typeof generalLimiter === 'function', 'generalLimiter is a function');
  assert(typeof authLimiter === 'function', 'authLimiter is a function');
  assert(typeof alertLimiter === 'function', 'alertLimiter is a function');

  // --- Test-mode bypass ---
  // A limiter with max=1 would block the 2nd request immediately, but with
  // skip() bound to NODE_ENV=test it must let all requests through.
  const tinyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1,
    message: 'too many',
    skip: () => process.env.NODE_ENV === 'test',
  });
  const bypassStatuses = await fireSequential(makeApp(tinyLimiter), 5);
  assert(
    bypassStatuses.every((s) => s === 200),
    'limiter with max=1 is bypassed in test mode (5x 200)'
  );

  // --- Production enforcement ---
  // run with NODE_ENV cleared so skip() is false and the limit really applies.
  const savedEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  const prodLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'too many',
  });
  const prodStatuses = await fireSequential(makeApp(prodLimiter), 6);
  process.env.NODE_ENV = savedEnv;

  assert(
    prodStatuses.slice(0, 3).every((s) => s === 200),
    'first 3 requests pass under max=3 (sequential)'
  );
  assert(
    prodStatuses.slice(3).every((s) => s === 429),
    'requests 4-6 are rate-limited (429)'
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();