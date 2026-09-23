/**
 * 🏆 Reputation Controller
 * PostgreSQL implementation for reputation system
 */

const { query } = require('../config/postgres');
const UserRepository = require('../database/repositories/UserRepository');

// ============================================
// PUBLIC API
// ============================================

/**
 * Get user reputation profile
 */
exports.getUserReputation = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user score
    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine level based on score
    const score = user.reputation.score;
    let level = 1;
    if (score > 100) level = Math.floor(score / 100);
    
    // Get rank (position among all users)
    const rankQuery = await query(`
      SELECT COUNT(*) + 1 AS rank
      FROM users
      WHERE reputation_score > $1
    `, [score]);
    const rank = `#${rankQuery.rows[0].rank}`;

    // Get basic stats from posts and comments
    const postsQuery = await query(`SELECT COUNT(*) FROM posts WHERE author_id = $1`, [userId]);
    const commentsQuery = await query(`SELECT COUNT(*) FROM comments WHERE author_id = $1`, [userId]);

    const activity = [
      { type: 'post', count: parseInt(postsQuery.rows[0].count), points: parseInt(postsQuery.rows[0].count) * 10, label: 'Posts Created' },
      { type: 'reply', count: parseInt(commentsQuery.rows[0].count), points: parseInt(commentsQuery.rows[0].count) * 5, label: 'Helpful Replies' }
    ];

    // Determine basic badges
    const badges = [];
    if (activity[0].count > 0) badges.push({ id: 1, name: 'First Post', icon: '📝', earned: true, description: 'Created your first post', earnedDate: user.createdAt });
    if (activity[1].count >= 10) badges.push({ id: 2, name: 'Helper', icon: '🤝', earned: true, description: 'Helped 10 community members' });
    if (activity[0].count >= 20) badges.push({ id: 3, name: 'Content Creator', icon: '🎨', earned: true, description: 'Published 20 posts' });

    res.json({
      success: true,
      data: {
        score,
        level,
        rank,
        nextLevel: {
          level: level + 1,
          requiredScore: (level + 1) * 100,
          progress: Math.min(100, ((score % 100) / 100) * 100)
        },
        badges,
        activity
      }
    });
  } catch (error) {
    console.error('Error getting reputation:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const result = await query(`
      SELECT id, username, reputation_score, avatar_icon
      FROM users
      ORDER BY reputation_score DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user badges
 *
 * R3 [P1-7]: explicitly unavailable. The previous `[]` implied "no badges",
 * which is a fabricated fact. Per the MOCK DATA RULE this returns 501.
 */
exports.getUserBadges = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'User badges are not available',
    code: 'NOT_IMPLEMENTED'
  });
};

/**
 * Get reputation ledger
 *
 * R3 [P1-7]: explicitly unavailable (same rationale as getUserBadges).
 */
exports.getReputationLedger = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Reputation ledger is not available',
    code: 'NOT_IMPLEMENTED'
  });
};

/**
 * Get user feedback
 *
 * R3 [P1-7]: explicitly unavailable (same rationale as getUserBadges).
 */
exports.getUserFeedback = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'User feedback is not available',
    code: 'NOT_IMPLEMENTED'
  });
};

/**
 * Submit feedback
 *
 * R3 [P1-7]: explicitly unavailable. The previous implementation returned
 * fake success with no persistence. No synthetic success is manufactured.
 */
exports.submitFeedback = async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Feedback submission is not available',
    code: 'NOT_IMPLEMENTED'
  });
};

const crypto = require('crypto');
const { generatePassportPDF } = require('../utils/pdfGenerator');

/**
 * Deep key-sorted JSON for deterministic digests (arrays keep order).
 */
function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value === undefined ? null : value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

/**
 * Export Reputation Passport (Phase 3)
 *
 * Server-authoritative artifact only:
 *   - canonical identity / reputation / impact / skills from DB
 *   - deterministic deep-sorted canonical JSON + SHA-256 digest
 *   - evidence + provenance for every claim
 *   - issuance metadata (issuer, schema version, generated_at)
 *   - graceful incompleteness (null + missing[] — never fabricated)
 *   - no client-supplied claims, no signature, no unverifiable fields
 */
exports.exportPassport = async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || 'json';
    const generatedAt = new Date().toISOString();

    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const score = user.reputation?.score ?? 0;
    let level = 1;
    if (score > 100) level = Math.floor(score / 100);

    const evidence = [];
    const missing = [];

    let rank = null;
    try {
      const rankQuery = await query(`
        SELECT COUNT(*) + 1 AS rank
        FROM users
        WHERE reputation_score > $1
      `, [score]);
      rank = `#${rankQuery.rows[0].rank}`;
      evidence.push({ field: 'reputation.rank', source: 'users.reputation_score', as_of: generatedAt });
    } catch {
      missing.push('reputation.rank');
    }

    let activity = null;
    try {
      const postsQuery = await query(`SELECT COUNT(*) FROM posts WHERE author_id = $1`, [userId]);
      const commentsQuery = await query(`SELECT COUNT(*) FROM comments WHERE author_id = $1`, [userId]);
      activity = [
        { label: 'Posts Created', count: parseInt(postsQuery.rows[0].count, 10), source: 'posts.author_id' },
        { label: 'Helpful Replies', count: parseInt(commentsQuery.rows[0].count, 10), source: 'comments.author_id' }
      ];
      evidence.push({ field: 'impact.activity', source: 'posts, comments', as_of: generatedAt });
    } catch {
      missing.push('impact.activity');
    }

    let skills = [];
    try {
      const skillsQuery = await query(`
        SELECT skill_name, proficiency, is_offering, is_seeking
        FROM user_skills
        WHERE user_id = $1
        ORDER BY LOWER(skill_name), is_offering DESC, is_seeking DESC
      `, [userId]);
      skills = skillsQuery.rows.map((r) => ({
        name: r.skill_name,
        proficiency: r.proficiency,
        role: r.is_offering ? 'offering' : (r.is_seeking ? 'seeking' : 'unknown')
      }));
      evidence.push({ field: 'skills', source: 'user_skills', as_of: generatedAt });
    } catch {
      missing.push('skills');
    }

    evidence.push({ field: 'reputation.total_score', source: 'users.reputation_score', as_of: generatedAt });
    evidence.push({ field: 'identity', source: 'users.username, users.created_at', as_of: generatedAt });

    // Achievements only from verified server-side activity thresholds.
    const badges = [];
    if (activity) {
      if (activity[0].count > 0) {
        badges.push({ title: 'First Post', earned: user.createdAt, basis: 'posts_count > 0' });
      }
      if (activity[1].count >= 10) {
        badges.push({ title: 'Helper', earned: user.createdAt, basis: 'comments_count >= 10' });
      }
    }

    // Deterministic passport_id: stable per user + schema (not random).
    const passportId = `jamii_${crypto.createHash('sha256').update(`${userId}:reputation_passport:v1`).digest('hex').slice(0, 16)}`;

    const canonicalPayload = {
      schema_version: '1.1',
      passport_id: passportId,
      passport_type: 'reputation_passport',
      user_id: user.id,
      issuer: 'JamiiLink',
      issued_at: generatedAt,
      generated_at: generatedAt,
      identity: {
        username: user.username,
        verified_since: user.createdAt,
        verification_status: user.verification?.isVerified ? 'verified' : 'unverified',
        badge_level: user.verification?.badgeLevel ?? null
      },
      reputation: {
        total_score: score,
        level,
        rank,
        score_band: user.reputation?.level ?? null
      },
      impact: {
        activity,
        badges
      },
      skills,
      achievements: { badges },
      evidence,
      completeness: {
        complete: missing.length === 0,
        missing
      },
      provenance: {
        authority: 'server_database',
        client_claims_accepted: false,
        generated_by: 'reputationController.exportPassport'
      }
    };

    const canonicalString = stableStringify(canonicalPayload);
    const digest = crypto.createHash('sha256').update(canonicalString).digest('hex');

    const passport = {
      ...canonicalPayload,
      integrity: {
        algorithm: 'SHA-256',
        digest,
        canonicalization: 'sorted-keys-json'
      },
      digest_algorithm: 'SHA-256',
      digest
    };

    if (format === 'pdf') {
      return generatePassportPDF(passport, res);
    }

    res.json({
      success: true,
      data: passport
    });
  } catch (error) {
    console.error('Error exporting passport:', error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Log contribution
 */
exports.logContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    // Basic logic to add 10 points per contribution
    await query(`
      UPDATE users 
      SET reputation_score = reputation_score + 10 
      WHERE id = $1
    `, [userId]);
    
    res.json({ success: true, message: "Contribution logged" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
