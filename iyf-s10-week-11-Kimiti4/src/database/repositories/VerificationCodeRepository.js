/**
 * R2 [P0-6] Verification Code Repository.
 *
 * Provides durable, restart-safe, multi-instance-safe verification state.
 * - create()            : insert a new code (stores bcrypt hash; raw never persisted)
 * - findActive()        : locate the active (un-consumed, un-expired) code for
 *                         a (contact, purpose) pair; returns null if none
 * - incrementAttempts() : atomic increment on attempt_count
 * - consume()           : atomic single-use transition
 *                         (UPDATE ... SET used_at = NOW() WHERE id = $1
 *                          AND used_at IS NULL AND expires_at > NOW()
 *                          RETURNING ...);
 *                         if the row was already consumed/expired the
 *                         UPDATE matches zero rows and we return null.
 *                         This is the user-required atomic operation
 *                         (DB-enforced, not application-level
 *                          check-then-update race).
 * - forceConsume()      : used to lock the row out after N failed attempts
 */

const { query } = require('../../config/postgres');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;

function rowToRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    purpose: row.purpose,
    contact: row.contact,
    expires_at: row.expires_at,
    attempt_count: row.attempt_count,
    used_at: row.used_at,
    created_at: row.created_at,
    // code_hash is intentionally NEVER returned to callers
  };
}

class VerificationCodeRepository {
  /**
   * Create a new verification code. Stores the bcrypt hash; the raw code
   * is returned to the caller (one-shot) so the controller can email/SMS it.
   */
  static async create({ userId = null, purpose, contact, rawCode, ttlSeconds = 600 }) {
    if (!purpose || !contact || !rawCode) {
      throw new Error('VerificationCodeRepository.create: purpose, contact, rawCode are required');
    }
    const code_hash = await bcrypt.hash(String(rawCode), BCRYPT_ROUNDS);
    const expires_at = new Date(Date.now() + ttlSeconds * 1000);
    const result = await query(
      `INSERT INTO verification_codes
         (user_id, purpose, contact, code_hash, expires_at, attempt_count, used_at)
       VALUES ($1, $2, $3, $4, $5, 0, NULL)
       RETURNING id, user_id, purpose, contact, expires_at, attempt_count, used_at, created_at`,
      [userId, purpose, contact, code_hash, expires_at]
    );
    return rowToRecord(result.rows[0]);
  }

  static async findActive({ contact, purpose }) {
    const result = await query(
      `SELECT id, user_id, purpose, contact, expires_at, attempt_count, used_at, created_at
         FROM verification_codes
        WHERE contact = $1
          AND purpose = $2
          AND used_at IS NULL
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1`,
      [contact, purpose]
    );
    return rowToRecord(result.rows[0]);
  }

  /**
   * Atomic increment. Returns the new attempt_count, or null if the row is
   * no longer active (already consumed or expired between findActive() and
   * this call).
   */
  static async incrementAttempts(id) {
    const result = await query(
      `UPDATE verification_codes
          SET attempt_count = attempt_count + 1
        WHERE id = $1
          AND used_at IS NULL
          AND expires_at > NOW()
        RETURNING id, attempt_count`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0].attempt_count;
  }

  /**
   * Atomic single-use consumption. The WHERE clause is the race winner.
   * Returns the consumed record on success, null if the row was not in an
   * active state (already consumed / expired).
   */
  static async consume(id) {
    const result = await query(
      `UPDATE verification_codes
          SET used_at = NOW()
        WHERE id = $1
          AND used_at IS NULL
          AND expires_at > NOW()
        RETURNING id, user_id, purpose, contact, expires_at, attempt_count, used_at, created_at`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToRecord(result.rows[0]);
  }

  /**
   * Force-consume (used to lock a code out after N failed attempts).
   * Same atomic semantics as consume().
   */
  static async forceConsume(id) {
    const result = await query(
      `UPDATE verification_codes
          SET used_at = NOW()
        WHERE id = $1
          AND used_at IS NULL
        RETURNING id`,
      [id]
    );
    return result.rows.length > 0;
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, user_id, purpose, contact, expires_at, attempt_count, used_at, created_at
         FROM verification_codes WHERE id = $1`,
      [id]
    );
    return rowToRecord(result.rows[0]);
  }
}

module.exports = VerificationCodeRepository;
