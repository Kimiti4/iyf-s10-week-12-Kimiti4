/**
 * R5 [P0-7] Refresh Session Repository.
 *
 * Server-side state for rotating opaque refresh tokens. Only the SHA-256
 * hash of a refresh token is ever persisted — never the raw token — so a
 * database read does not yield usable credentials.
 *
 * Lifecycle:
 *   create()  : insert a new live session, return { id, rawToken }
 *   verify()  : hash the presented token; return the live session row or
 *               null (unknown / expired / revoked). A presented token whose
 *               hash matches a ROTATED (rotated_at set, revoked_at null) row
 *               is reported as { reused: true } so the caller can revoke the
 *               whole family (reuse detection).
 *   rotate()  : atomically mark old row rotated + insert successor in one
 *               transaction; returns { id, rawToken } of the successor.
 *   revoke()  : revoke one session by id.
 *   revokeAllForUser(): revoke every live session of a user (logout-all /
 *               password-change semantics).
 */
const crypto = require('crypto');
const { query, getClient } = require('../../config/postgres');

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function sha256Hex(raw) {
  return crypto.createHash('sha256').update(String(raw), 'utf8').digest('hex');
}

function newRawToken() {
  return crypto.randomBytes(48).toString('hex'); // 384-bit entropy
}

class SessionRepository {
  static hash(raw) {
    return sha256Hex(raw);
  }

  static async create({ userId, ttlSeconds = REFRESH_TTL_SECONDS, userAgent = null, ip = null }) {
    const rawToken = newRawToken();
    const result = await query(
      `INSERT INTO refresh_sessions (user_id, token_hash, expires_at, user_agent, ip)
       VALUES ($1, $2, NOW() + ($3 || ' seconds')::interval, $4, $5)
       RETURNING id, user_id, expires_at, created_at`,
      [userId, sha256Hex(rawToken), String(ttlSeconds), userAgent, ip]
    );
    return { id: result.rows[0].id, rawToken, expires_at: result.rows[0].expires_at };
  }

  /**
   * Verify a presented refresh token.
   * Returns { status: 'live', session } | { status: 'reused', session } | { status: 'dead' }.
   * 'reused' means the token was already rotated: possible theft -> caller
   * must revoke the family.
   */
  static async verify(rawToken) {
    const h = sha256Hex(rawToken);
    const result = await query(
      `SELECT id, user_id, expires_at, rotated_at, revoked_at
         FROM refresh_sessions WHERE token_hash = $1`,
      [h]
    );
    const row = result.rows[0];
    if (!row) return { status: 'dead' };
    if (row.revoked_at) return { status: 'dead' };
    if (new Date(row.expires_at) <= new Date()) return { status: 'dead' };
    if (row.rotated_at) return { status: 'reused', session: row };
    return { status: 'live', session: row };
  }

  /**
   * Rotate: mark the old session rotated and insert its successor atomically.
   */
  static async rotate(oldSessionId, { userId, ttlSeconds = REFRESH_TTL_SECONDS, userAgent = null, ip = null }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const upd = await client.query(
        `UPDATE refresh_sessions SET rotated_at = NOW()
          WHERE id = $1 AND revoked_at IS NULL AND rotated_at IS NULL
          RETURNING id, user_id`,
        [oldSessionId]
      );
      if (upd.rows.length === 0) {
        await client.query('ROLLBACK');
        return null; // lost a race: already rotated/revoked
      }
      const rawToken = newRawToken();
      const ins = await client.query(
        `INSERT INTO refresh_sessions (user_id, token_hash, expires_at, user_agent, ip)
         VALUES ($1, $2, NOW() + ($3 || ' seconds')::interval, $4, $5)
         RETURNING id, expires_at`,
        [userId, sha256Hex(rawToken), String(ttlSeconds), userAgent, ip]
      );
      await client.query('COMMIT');
      return { id: ins.rows[0].id, rawToken, expires_at: ins.rows[0].expires_at };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  static async revoke(sessionId) {
    const result = await query(
      `UPDATE refresh_sessions SET revoked_at = NOW()
        WHERE id = $1 AND revoked_at IS NULL
        RETURNING id`,
      [sessionId]
    );
    return result.rows.length > 0;
  }

  static async revokeAllForUser(userId) {
    const result = await query(
      `UPDATE refresh_sessions SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL
        RETURNING id`,
      [userId]
    );
    return result.rows.length;
  }
}

module.exports = SessionRepository;
module.exports.REFRESH_TTL_SECONDS = REFRESH_TTL_SECONDS;
