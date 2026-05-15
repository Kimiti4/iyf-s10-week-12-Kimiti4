/**
 * 🔹 User Queries - PostgreSQL
 * Replaces Mongoose User model with SQL queries
 */
const { query, getClient } = require('../../config/postgres');
const bcrypt = require('bcryptjs');

class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    const {
      username,
      email,
      password,
      role = 'user',
      isFounder = false,
      profile = {},
      verification = {}
    } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(`
      INSERT INTO users (
        username, email, password, role, is_founder,
        bio, location_county, location_settlement, location_ward,
        skills, avatar_url, avatar_icon,
        verification_is_verified, verification_badge_level,
        verification_badge_color, verification_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      username,
      email,
      hashedPassword,
      role,
      isFounder,
      profile.bio || null,
      profile.location?.county || null,
      profile.location?.settlement || null,
      profile.location?.ward || null,
      profile.skills ? `{${profile.skills.join(',')}}` : null,
      profile.avatar || null,
      profile.avatarIcon || '🦁',
      verification.isVerified || false,
      verification.badgeLevel || 'bronze',
      verification.badgeColor || '#CD7F32',
      verification.verificationNotes || null
    ]);

    return this.formatUser(result.rows[0]);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const result = await query(`
      SELECT * FROM users WHERE email = $1
    `, [email.toLowerCase()]);

    if (!result.rows[0]) return null;
    return this.formatUser(result.rows[0]);
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    const result = await query(`
      SELECT * FROM users WHERE username = $1
    `, [username]);

    if (!result.rows[0]) return null;
    return this.formatUser(result.rows[0]);
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    const result = await query(`
      SELECT * FROM users WHERE id = $1
    `, [id]);

    if (!result.rows[0]) return null;
    return this.formatUser(result.rows[0]);
  }

  /**
   * Update user
   */
  async update(id, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    // Build dynamic UPDATE query
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${this.camelToSnake(key)} = $${index}`);
        values.push(updates[key]);
        index++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(`
      UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `, values);

    return this.formatUser(result.rows[0]);
  }

  /**
   * Compare password
   */
  async comparePassword(user, candidatePassword) {
    return await bcrypt.compare(candidatePassword, user.password);
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId) {
    const result = await query(`
      SELECT o.*, m.role as membership_role
      FROM organizations o
      JOIN memberships m ON o.id = m.organization_id
      WHERE m.user_id = $1 AND m.status = 'active'
      ORDER BY m.joined_at DESC
    `, [userId]);

    return result.rows;
  }

  /**
   * Set current organization
   */
  async setCurrentOrganization(userId, orgId) {
    await query(`
      UPDATE users SET current_organization_id = $1, updated_at = NOW()
      WHERE id = $2
    `, [orgId, userId]);

    return this.findById(userId);
  }

  /**
   * Format user object (remove sensitive data)
   */
  formatUser(row) {
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      isFounder: row.is_founder,
      profile: {
        bio: row.bio,
        location: {
          county: row.location_county,
          settlement: row.location_settlement,
          ward: row.location_ward
        },
        skills: row.skills || [],
        avatar: row.avatar_url,
        avatarIcon: row.avatar_icon
      },
      verification: {
        isVerified: row.verification_is_verified,
        verifiedAt: row.verification_verified_at,
        verificationType: row.verification_type,
        badgeLevel: row.verification_badge_level,
        badgeColor: row.verification_badge_color,
        verificationNotes: row.verification_notes,
        expiresAt: row.verification_expires_at
      },
      mfa: {
        enabled: row.mfa_enabled,
        requireAllMethods: row.mfa_require_all_methods,
        lastVerified: row.mfa_last_verified,
        failedAttempts: row.mfa_failed_attempts,
        lockedUntil: row.mfa_locked_until
      },
      currentOrganization: row.current_organization_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Convert camelCase to snake_case
   */
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = new UserRepository();
