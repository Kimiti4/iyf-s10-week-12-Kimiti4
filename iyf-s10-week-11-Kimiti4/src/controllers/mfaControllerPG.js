/**
 * R2 [P0-5] MFA Controller (TOTP, server-authoritative).
 *
 * Lifecycle:
 *   ENROLL
 *     1. server generates secret (otplib.authenticator.generateSecret())
 *     2. server persists secret bound to user in mfa_methods
 *     3. server returns { qrCode, otpauth_url } -- NOT the raw secret
 *        (the QR contains the secret inside the otpauth URI; the user
 *         scans it; this is the standard TOTP enrollment pattern and
 *         does not make the secret client-authoritative for verification)
 *   VERIFY
 *     1. server reads secret from mfa_methods (NEVER from req.body)
 *     2. server validates TOTP code with otplib against the stored secret
 *     3. on first success: mark mfa_methods.verified=true and users.mfa_enabled=true
 *     4. on subsequent success: update users.mfa_last_verified, reset attempts
 *     5. on failure: increment users.mfa_failed_attempts; check lockout
 *
 * The client must NEVER supply the authoritative TOTP secret for verification.
 * Any `secret` in the request body is ignored.
 */

const otplib = require('otplib');
const qrcode = require('qrcode');
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');// Bounded temporary backoff: 30s, 2m, 10m, 30m, 2h (capped at 2h)
const BACKOFFS_MS = [30_000, 120_000, 600_000, 1_800_000, 7_200_000];
const MAX_FAILED_ATTEMPTS = 5;

function backoffFor(attempts) {
  // attempts is the value AFTER the increment; map to an index
  const idx = Math.min(attempts - MAX_FAILED_ATTEMPTS, BACKOFFS_MS.length - 1);
  return BACKOFFS_MS[Math.max(0, idx)];
}

async function isLocked(userRow) {
  if (!userRow.mfa_locked_until) return null;
  const until = new Date(userRow.mfa_locked_until);
  if (until > new Date()) return until;
  return null;
}

async function loadUserRow(userId) {
  const r = await query(
    `SELECT id, mfa_enabled, mfa_failed_attempts, mfa_locked_until
       FROM users WHERE id = $1`,
    [userId]
  );
  return r.rows[0] || null;
}

/**
 * POST /api/auth/mfa/totp/enroll
 * Server generates a new TOTP secret, persists it (un-verified) in mfa_methods.
 * Returns { qrCode, otpauth_url }.
 */
const enrollTotp = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError('Authentication required', 401);

  // Generate the secret server-side.
  const secret = otplib.generateSecret();

  // Persist bound to user, un-verified, replacing any prior pending enrollment.
  // Use a transaction-safe upsert: insert if no row exists, otherwise update.
  // We don't have a true unique index on (user_id, type='totp', verified=false);
  // but we can do a soft delete + insert within a single transaction.
  const client = await (require('../config/postgres').getClient)();
  try {
    await client.query('BEGIN');
    // Mark any prior un-verified TOTP rows for this user as used (so only one
    // pending enrollment at a time).
    await client.query(
      `UPDATE mfa_methods
          SET verified = TRUE,
              added_at = added_at  -- keep original timestamp
        WHERE user_id = $1
          AND type = 'totp'
          AND verified = FALSE`,
      [req.user.id]
    );
    const result = await client.query(
      `INSERT INTO mfa_methods (user_id, type, verified, primary_method, secret, added_at)
       VALUES ($1, 'totp', FALSE, TRUE, $2, NOW())
       RETURNING id, added_at`,
      [req.user.id, secret]
    );
    await client.query('COMMIT');

    const otpauth = otplib.generateURI({
      issuer: 'JamiiLink',
      label: req.user.email || req.user.username,
      secret
    });
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);

    // R2: never return the raw secret in the response.
    res.json({
      success: true,
      message: 'TOTP enrollment generated. Scan the QR with your authenticator app, then call /verify with a code.',
      data: {
        qrCode: qrCodeDataUrl,
        otpauth_url: otpauth,
        mfaMethodId: result.rows[0].id
      }
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
});

/**
 * POST /api/auth/mfa/totp/verify
 * Verifies a TOTP code using the server-stored secret.
 * Body: { code }. The client must NOT supply a secret; any secret in the body
 * is ignored.
 */
const verifyTotp = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError('Authentication required', 401);
  const { code } = req.body || {};
  if (!code || typeof code !== 'string') {
    throw new ApiError('A TOTP code is required', 400);
  }

  // Lockout check (server-side, persistent).
  const userRow = await loadUserRow(req.user.id);
  if (!userRow) throw new ApiError('User not found', 404);
  const lockedUntil = await isLocked(userRow);
  if (lockedUntil) {
    const retryAfter = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
    res.set('Retry-After', String(Math.max(retryAfter, 1)));
    throw new ApiError('Account temporarily locked due to repeated MFA failures', 423);
  }

  // Load the server-stored secret. The latest TOTP method (verified OR pending).
  const r = await query(
    `SELECT id, secret, verified FROM mfa_methods
      WHERE user_id = $1 AND type = 'totp'
      ORDER BY added_at DESC LIMIT 1`,
    [req.user.id]
  );
  if (r.rows.length === 0) {
    throw new ApiError('No TOTP enrollment found. Call /enroll first.', 400);
  }
  const method = r.rows[0];

  // Hard invariant: the verification decision is based ONLY on the server-stored
  // secret. Any `secret` in req.body is ignored (deliberately). This is the
  // closure for P0-5. otplib v13 verify returns { valid, ... }.
  const verifyResult = await otplib.verify({ token: code, secret: method.secret });
  const ok = !!(verifyResult && verifyResult.valid === true);

  if (!ok) {
    // Increment failures; if threshold reached, set mfa_locked_until.
    const inc = await query(
      `UPDATE users
          SET mfa_failed_attempts = mfa_failed_attempts + 1
        WHERE id = $1
        RETURNING mfa_failed_attempts`,
      [req.user.id]
    );
    const attempts = inc.rows[0]?.mfa_failed_attempts || 0;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockMs = backoffFor(attempts);
      const lockUntil = new Date(Date.now() + lockMs);
      await query(
        `UPDATE users SET mfa_locked_until = $1 WHERE id = $2`,
        [lockUntil, req.user.id]
      );
      res.set('Retry-After', String(Math.ceil(lockMs / 1000)));
      throw new ApiError('Too many failed attempts. Account temporarily locked.', 423);
    }
    throw new ApiError('Invalid TOTP code', 401);
  }

  // Success: mark verified (first time) or update last_verified (subsequent).
  if (!method.verified) {
    await query(
      `UPDATE mfa_methods SET verified = TRUE WHERE id = $1`,
      [method.id]
    );
    await query(
      `UPDATE users SET mfa_enabled = TRUE, mfa_last_verified = NOW(),
                          mfa_failed_attempts = 0, mfa_locked_until = NULL
        WHERE id = $1`,
      [req.user.id]
    );
  } else {
    await query(
      `UPDATE users SET mfa_last_verified = NOW(),
                          mfa_failed_attempts = 0, mfa_locked_until = NULL
        WHERE id = $1`,
      [req.user.id]
    );
  }

  res.json({
    success: true,
    message: method.verified ? 'TOTP verified' : 'TOTP enrollment verified and activated',
    data: { justActivated: !method.verified }
  });
});

module.exports = { enrollTotp, verifyTotp };
