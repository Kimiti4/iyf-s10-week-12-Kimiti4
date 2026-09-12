/**
 * 🔹 Authentication Controller - PostgreSQL Version
 *
 * R2 changes (P0-6, P1-12, P1-13, P2-1/P2-2, Math.random -> crypto.randomInt):
 *   - verification_codes persisted in DB (no more new Map())
 *   - codes generated with crypto.randomInt (no more Math.random)
 *   - email sends via emailService abstraction (fail-closed in production)
 *   - login lockout with bounded backoff, reset on success
 *   - structured deliveryStatus returned to the caller (no silent "sent")
 */
const crypto = require('crypto');
const { UserRepository } = require('../database');
const VerificationCodeRepository = require('../database/repositories/VerificationCodeRepository');
const SessionRepository = require('../database/repositories/SessionRepository');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { query } = require('../config/postgres');

const MAX_FAILED_ATTEMPTS = 5;
const BACKOFFS_MS = [30_000, 120_000, 600_000, 1_800_000, 7_200_000];
const CODE_TTL_SECONDS = 600;
const CODE_MAX_ATTEMPTS = 5;

// R5 [P0-7] session constants.
const JWT_ISSUER = 'jamiilink';
const JWT_AUDIENCE = 'jamiilink-api';
// Fixed 15-minute access lifetime. Deliberately NOT overridable via
// JWT_EXPIRES_IN: a longer lifetime would silently restore the P0-7
// replay window the refresh architecture exists to bound.
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_COOKIE_NAME = 'jid_rt';

function backoffFor(attempts) {
  const idx = Math.min(attempts - MAX_FAILED_ATTEMPTS, BACKOFFS_MS.length - 1);
  return BACKOFFS_MS[Math.max(0, idx)];
}

function generateNumericCode() {
  // 6-digit code, cryptographically secure
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * R5: short-lived access token with explicit iss/aud/jti.
 * Strict enforcement in authPG means pre-R5 tokens (no iss/aud) are
 * rejected after deploy: all clients re-authenticate once. Intended.
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: crypto.randomUUID()
    }
  );
};

/**
 * R5: refresh-cookie attributes. SameSite=None+Secure in production
 * (cross-site Vercel->Railway); Lax + non-Secure elsewhere so
 * same-origin dev/test works over plain HTTP.
 */
function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function setRefreshCookie(res, rawToken) {
  const o = refreshCookieOptions();
  // Express response.cookie is available; fall back to manual header.
  if (typeof res.cookie === 'function') {
    res.cookie(REFRESH_COOKIE_NAME, rawToken, o);
  } else {
    let header = `${REFRESH_COOKIE_NAME}=${rawToken}; Path=${o.path}; HttpOnly; Max-Age=${Math.floor(o.maxAge / 1000)}; SameSite=${o.sameSite === 'none' ? 'None' : 'Lax'}`;
    if (o.secure) header += '; Secure';
    res.setHeader('Set-Cookie', header);
  }
}

function clearRefreshCookie(res) {
  const o = refreshCookieOptions();
  if (typeof res.clearCookie === 'function') {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: o.path });
  } else {
    res.setHeader('Set-Cookie', `${REFRESH_COOKIE_NAME}=; Path=${o.path}; HttpOnly; Max-Age=0`);
  }
}

function readRefreshCookie(req) {
  // Minimal cookie parse (no new dependency): exact-name match only.
  const header = req.headers && req.headers.cookie;
  if (!header) return null;
  const parts = String(header).split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === REFRESH_COOKIE_NAME) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

/**
 * R5: CSRF guard for cookie-authenticated state-changing endpoints
 * (refresh, logout). When the client sends Origin/Referer, it must match
 * the CORS allowlist; requests without either header (curl, same-origin
 * navigations, tests) pass through to the session checks.
 */
function allowedOrigins() {
  return [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://jamii-link.ke.vercel.app',
    'https://jamii-link.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);
}

function checkSameOrigin(req, res) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const candidate = origin || (referer ? (() => { try { return new URL(referer).origin; } catch { return null; } })() : null);
  if (!candidate) return true; // no signal: rely on session checks
  if (!allowedOrigins().includes(candidate)) {
    res.status(403).json({ success: false, error: 'Cross-origin request forbidden', code: 'CSRF_BLOCKED' });
    return false;
  }
  return true;
}

async function issueSession(req, res, userId) {
  const session = await SessionRepository.create({
    userId,
    userAgent: (req.headers['user-agent'] || '').slice(0, 255) || null,
    ip: (req.ip || '').slice(0, 64) || null
  });
  setRefreshCookie(res, session.rawToken);
  return session;
}

/**
 * Register new user with enhanced validation
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, profile } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username, email, and password are required'
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }

  const existingByEmail = await UserRepository.findByEmail(email.toLowerCase());
  const existingByUsername = await UserRepository.findByUsername(username.trim());
  if (existingByEmail) {
    return res.status(400).json({ success: false, error: 'Email is already registered' });
  }
  if (existingByUsername) {
    return res.status(400).json({ success: false, error: 'Username is already taken' });
  }

  const user = await UserRepository.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password,
    profile: profile || {}
  });
  const token = generateToken(user.id);
  // R5: registration opens a refresh session (HttpOnly cookie).
  await issueSession(req, res, user.id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    user: {
      id: user.id, username: user.username, email: user.email,
      role: user.role, profile: user.profile, createdAt: user.createdAt
    }
  });
});

/**
 * Login user with bounded-backoff lockout (R2 [P1-13]).
 * Lockout state is server-side and persistent (mfa_failed_attempts, mfa_locked_until).
 * Successful authentication resets the failure state.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  // Look up user.
  const user = await UserRepository.findByEmail(email.toLowerCase());
  if (!user) {
    // Do not reveal whether the email exists.
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Lockout check.
  const r = await query(
    `SELECT mfa_failed_attempts, mfa_locked_until FROM users WHERE id = $1`,
    [user.id]
  );
  const u = r.rows[0];
  if (u?.mfa_locked_until && new Date(u.mfa_locked_until) > new Date()) {
    const retryAfter = Math.ceil((new Date(u.mfa_locked_until).getTime() - Date.now()) / 1000);
    res.set('Retry-After', String(Math.max(retryAfter, 1)));
    return res.status(423).json({
      success: false,
      error: 'Account temporarily locked due to repeated failed attempts',
      lockedUntil: u.mfa_locked_until
    });
  }

  // Bcrypt compare.
  const result = await query('SELECT * FROM users WHERE id = $1', [user.id]);
  const fullUser = result.rows[0];
  const isMatch = await UserRepository.comparePassword(fullUser, password);

  if (!isMatch) {
    // Increment failures; if threshold reached, set mfa_locked_until.
    const inc = await query(
      `UPDATE users
          SET mfa_failed_attempts = COALESCE(mfa_failed_attempts, 0) + 1
        WHERE id = $1
        RETURNING mfa_failed_attempts`,
      [user.id]
    );
    const attempts = inc.rows[0]?.mfa_failed_attempts || 0;
    let lockedUntil = null;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockMs = backoffFor(attempts);
      lockedUntil = new Date(Date.now() + lockMs);
      await query(
        `UPDATE users SET mfa_locked_until = $1 WHERE id = $2`,
        [lockedUntil, user.id]
      );
      res.set('Retry-After', String(Math.ceil(lockMs / 1000)));
      return res.status(423).json({
        success: false,
        error: 'Account temporarily locked due to repeated failed attempts',
        lockedUntil: lockedUntil.toISOString()
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Success: reset failure state.
  await query(
    `UPDATE users SET mfa_failed_attempts = 0, mfa_locked_until = NULL WHERE id = $1`,
    [user.id]
  );

  const token = generateToken(user.id);
  // R5: login opens a refresh session (HttpOnly cookie).
  await issueSession(req, res, user.id);
  res.json({
    success: true,
    message: 'Login successful',
    token,
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    user: {
      id: user.id, username: user.username, email: user.email,
      role: user.role, profile: user.profile, isFounder: user.isFounder,
      verification: user.verification
    }
  });
});

/**
 * R5 [P0-7] Refresh: rotate the refresh session and issue a new short-lived
 * access token. Reuse of an already-rotated token revokes the whole family.
 */
const refresh = asyncHandler(async (req, res) => {
  if (!checkSameOrigin(req, res)) return;
  const raw = readRefreshCookie(req);
  if (!raw) {
    return res.status(401).json({ success: false, error: 'No refresh session', code: 'NO_REFRESH' });
  }
  const verdict = await SessionRepository.verify(raw);
  if (verdict.status === 'reused') {
    // Possible theft: kill every session of the affected user.
    await SessionRepository.revokeAllForUser(verdict.session.user_id);
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, error: 'Session revoked', code: 'REFRESH_REUSE' });
  }
  if (verdict.status !== 'live') {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, error: 'Session expired or revoked', code: 'REFRESH_DEAD' });
  }
  const next = await SessionRepository.rotate(verdict.session.id, {
    userId: verdict.session.user_id,
    userAgent: (req.headers['user-agent'] || '').slice(0, 255) || null,
    ip: (req.ip || '').slice(0, 64) || null
  });
  if (!next) {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, error: 'Session expired or revoked', code: 'REFRESH_DEAD' });
  }
  setRefreshCookie(res, next.rawToken);
  const token = generateToken(verdict.session.user_id);
  res.json({ success: true, token, tokenType: 'Bearer', expiresIn: ACCESS_TOKEN_TTL_SECONDS });
});

/**
 * R5 [P0-7] Logout now has server semantics: the presented refresh session
 * is revoked and the cookie cleared. Outstanding access tokens expire on
 * their own within the short access lifetime (documented residual).
 */
const logout = asyncHandler(async (req, res) => {
  if (!checkSameOrigin(req, res)) return;
  const raw = readRefreshCookie(req);
  if (raw) {
    const verdict = await SessionRepository.verify(raw);
    if (verdict.status === 'live') {
      await SessionRepository.revoke(verdict.session.id);
    }
  }
  clearRefreshCookie(res);
  res.json({
    success: true,
    message: 'Logout successful. This session has been revoked.'
  });
});

/**
 * Get current user profile
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user.id);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  const organizations = await UserRepository.getUserOrganizations(user.id);
  res.json({
    success: true,
    user: { ...user, organizations, stats: { memberSince: user.createdAt } }
  });
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { bio, location, skills, avatarIcon } = req.body;
  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (location?.county !== undefined) updates.locationCounty = location.county;
  if (location?.settlement !== undefined) updates.locationSettlement = location.settlement;
  if (location?.ward !== undefined) updates.locationWard = location.ward;
  if (skills !== undefined) updates.skills = `{${skills.join(',')}}`;
  if (avatarIcon !== undefined) updates.avatarIcon = avatarIcon;
  const user = await UserRepository.update(req.user.id, updates);
  res.json({ success: true, message: 'Profile updated successfully', user });
});

/**
 * R2 [P0-6, P1-12, P2-1]
 * Send Verification Code
 *
 * - body: { method: 'email' | 'phone', contact, purpose? }
 * - Generates a 6-digit code with crypto.randomInt
 * - Persists the bcrypt-hashed code in verification_codes (durable)
 * - Sends via emailService (fail-closed in production)
 * - Returns the delivery status; controller never claims "sent" if delivery failed
 */
const sendVerification = asyncHandler(async (req, res) => {
  const { method, contact, purpose: explicitPurpose } = req.body || {};
  if (!method || !contact) {
    return res.status(400).json({ success: false, error: 'Method and contact are required' });
  }
  if (method !== 'email' && method !== 'phone') {
    return res.status(400).json({ success: false, error: 'Method must be email or phone' });
  }

  const purpose = explicitPurpose || method; // 'email' | 'phone'
  const rawCode = generateNumericCode();

  // Persist the code (hash only). TTL 10 minutes.
  const record = await VerificationCodeRepository.create({
    userId: null, // pre-auth flow
    purpose,
    contact,
    rawCode,
    ttlSeconds: CODE_TTL_SECONDS
  });

  if (method === 'email') {
    const delivery = await emailService.send({
      to: contact,
      subject: 'Your JamiiLink verification code',
      text: `Your JamiiLink verification code is: ${rawCode}. It expires in ${CODE_TTL_SECONDS / 60} minutes.`,
      html: `<p>Your JamiiLink verification code is: <strong>${rawCode}</strong></p><p>It expires in ${CODE_TTL_SECONDS / 60} minutes.</p>`
    });
    res.json({
      success: delivery.status === 'delivered' || delivery.status === 'noop',
      deliveryStatus: delivery.status,
      previewUrl: delivery.previewUrl || null,
      reason: delivery.reason || null,
      message: delivery.status === 'delivered' ? 'Verification code sent via email'
        : delivery.status === 'noop' ? 'Verification code stored (test mode; no email sent)'
        : 'Verification code stored, but email delivery failed',
      expiresAt: record.expires_at
    });
    return;
  }

  // method === 'phone' : phone verification is R3 (real SMS provider).
  // R2 stores the code durably; the caller is told the code is "not yet delivered by SMS".
  res.json({
    success: false,
    deliveryStatus: 'failed',
    reason: 'phone SMS delivery is not implemented in R2 (R3 carries this)',
    message: 'Verification code stored; SMS delivery not available',
    expiresAt: record.expires_at
  });
});

/**
 * R2 [P0-6, P2-2]
 * Verify Code
 *
 * - body: { method, contact, code, purpose? }
 * - Looks up the active (un-consumed, un-expired) code for (contact, purpose)
 * - Compares the provided code against the bcrypt hash
 * - On success: atomic consume() -- DB-enforced single use
 * - On failure: incrementAttempts(); at CODE_MAX_ATTEMPTS, forceConsume()
 *   to lock the row out (defense in depth alongside the per-IP rate limiter)
 */
const verifyCode = asyncHandler(async (req, res) => {
  const { method, contact, code, purpose: explicitPurpose } = req.body || {};
  if (!method || !contact || !code) {
    return res.status(400).json({ success: false, error: 'Method, contact, and code are required' });
  }
  const purpose = explicitPurpose || method;

  // bcrypt.compare expects a stored hash; we don't have raw access here.
  // We retrieve the active code, compare the candidate against the bcrypt hash
  // via Node, and only on match invoke the atomic consume().
  const bcrypt = require('bcryptjs');
  const active = await VerificationCodeRepository.findActive({ contact, purpose });
  if (!active) {
    return res.status(400).json({ success: false, error: 'No active code for this contact/purpose (or it expired)' });
  }
  // Pull the hash directly (a tiny repository escape hatch).
  const r = await query('SELECT code_hash FROM verification_codes WHERE id = $1', [active.id]);
  const code_hash = r.rows[0].code_hash;
  const ok = await bcrypt.compare(String(code), code_hash);

  if (!ok) {
    const newCount = await VerificationCodeRepository.incrementAttempts(active.id);
    if (newCount === null) {
      // row expired between findActive and incrementAttempts
      return res.status(400).json({ success: false, error: 'Code expired during verification' });
    }
    if (newCount >= CODE_MAX_ATTEMPTS) {
      await VerificationCodeRepository.forceConsume(active.id);
    }
    return res.status(400).json({ success: false, error: 'Invalid verification code' });
  }

  // Atomic single-use consumption.
  const consumed = await VerificationCodeRepository.consume(active.id);
  if (!consumed) {
    // Race: another caller consumed first.
    return res.status(400).json({ success: false, error: 'Code already consumed' });
  }

  res.json({ success: true, message: 'Code verified successfully' });
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, error: 'Please provide current password and new password' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'New passwords do not match' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
  }
  const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  const isMatch = await UserRepository.comparePassword(user, currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Current password is incorrect' });
  }
  const bcryptjs = require('bcryptjs');
  const hashedPassword = await bcryptjs.hash(newPassword, 10);
  await query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, req.user.id]
  );
  // R5 [P0-7]: password change revokes every refresh session of this user,
  // including the caller's own (the caller must log in again).
  await SessionRepository.revokeAllForUser(req.user.id);
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Password changed successfully. All sessions revoked; please log in again.' });
});

module.exports = {
  register, login, logout, refresh, getMe, updateProfile, changePassword,
  sendVerification, verifyCode
};
