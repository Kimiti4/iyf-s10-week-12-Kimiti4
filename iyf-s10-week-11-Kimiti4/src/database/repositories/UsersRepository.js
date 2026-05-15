/**
 * 🔹 User Queries - PostgreSQL
 * Extended UserRepository with admin/user management functions
 */
const { query } = require('../../config/postgres');

class UsersRepository {
  /**
   * Get all users with filters
   */
  async findAll(filters = {}) {
    const { role, county, skill, search } = filters;
    
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Role filter
    if (role) {
      conditions.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    // County filter
    if (county) {
      conditions.push(`location_county ILIKE $${paramIndex++}`);
      params.push(`%${county}%`);
    }

    // Skill filter (search in skills array)
    if (skill) {
      conditions.push(`skills @> ARRAY[$${paramIndex++}]::varchar[]`);
      params.push(skill);
    }

    // Search filter
    if (search) {
      conditions.push(`(username ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++})`);
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        id,
        username,
        email,
        role,
        is_founder,
        bio,
        location_county,
        location_settlement,
        skills,
        avatar_url,
        avatar_icon,
        verification_is_verified,
        verification_badge_level,
        verification_badge_color,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
    `, params);

    return result.rows;
  }

  /**
   * Find user by ID
   */
  async findById(userId) {
    const result = await query(`
      SELECT 
        id,
        username,
        email,
        role,
        is_founder,
        bio,
        location_county,
        location_settlement,
        location_ward,
        skills,
        avatar_url,
        avatar_icon,
        verification_is_verified,
        verification_badge_level,
        verification_badge_color,
        verification_notes,
        mfa_enabled,
        mfa_recovery_codes,
        login_streak,
        last_login_at,
        reputation_score,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `, [userId]);

    return result.rows[0] || null;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const {
      bio,
      location_county,
      location_settlement,
      location_ward,
      skills,
      avatar_url,
      avatar_icon
    } = updates;

    const setClauses = [];
    const params = [userId];
    let paramIndex = 2;

    if (bio !== undefined) {
      setClauses.push(`bio = $${paramIndex++}`);
      params.push(bio);
    }
    if (location_county !== undefined) {
      setClauses.push(`location_county = $${paramIndex++}`);
      params.push(location_county);
    }
    if (location_settlement !== undefined) {
      setClauses.push(`location_settlement = $${paramIndex++}`);
      params.push(location_settlement);
    }
    if (location_ward !== undefined) {
      setClauses.push(`location_ward = $${paramIndex++}`);
      params.push(location_ward);
    }
    if (skills !== undefined) {
      setClauses.push(`skills = $${paramIndex++}`);
      params.push(skills);
    }
    if (avatar_url !== undefined) {
      setClauses.push(`avatar_url = $${paramIndex++}`);
      params.push(avatar_url);
    }
    if (avatar_icon !== undefined) {
      setClauses.push(`avatar_icon = $${paramIndex++}`);
      params.push(avatar_icon);
    }

    if (setClauses.length === 0) {
      return await this.findById(userId);
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(userId);

    const result = await query(`
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    return result.rows[0] || null;
  }

  /**
   * Update user reputation score
   */
  async updateReputation(userId, scoreChange) {
    const result = await query(`
      UPDATE users
      SET reputation_score = COALESCE(reputation_score, 0) + $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING reputation_score
    `, [scoreChange, userId]);

    return result.rows[0] || null;
  }

  /**
   * Update user login streak
   */
  async updateLoginStreak(userId, streak) {
    const result = await query(`
      UPDATE users
      SET login_streak = $1,
          last_login_at = NOW(),
          updated_at = NOW()
      WHERE id = $2
      RETURNING login_streak, last_login_at
    `, [streak, userId]);

    return result.rows[0] || null;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    const result = await query(`
      SELECT
        u.id,
        u.username,
        u.reputation_score,
        u.login_streak,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT o.id) as organization_count
      FROM users u
      LEFT JOIN posts p ON p.author_id = u.id
      LEFT JOIN comments c ON c.author_id = u.id
      LEFT JOIN memberships m ON m.user_id = u.id AND m.status = 'accepted'
      LEFT JOIN organizations o ON o.id = m.organization_id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.reputation_score, u.login_streak
    `, [userId]);

    return result.rows[0] || null;
  }

  /**
   * Deactivate user account
   */
  async deactivate(userId) {
    const result = await query(`
      UPDATE users
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [userId]);

    return result.rows[0] || null;
  }

  /**
   * Activate user account
   */
  async activate(userId) {
    const result = await query(`
      UPDATE users
      SET is_active = TRUE,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [userId]);

    return result.rows[0] || null;
  }

  /**
   * Ban user (by admin)
   */
  async banUser(userId, reason, bannedBy) {
    const result = await query(`
      UPDATE users
      SET 
        is_banned = TRUE,
        ban_reason = $1,
        banned_at = NOW(),
        banned_by = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [reason, bannedBy, userId]);

    return result.rows[0] || null;
  }

  /**
   * Unban user
   */
  async unbanUser(userId) {
    const result = await query(`
      UPDATE users
      SET 
        is_banned = FALSE,
        ban_reason = NULL,
        banned_at = NULL,
        banned_by = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [userId]);

    return result.rows[0] || null;
  }
}

module.exports = new UsersRepository();
