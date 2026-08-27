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
 * Get user badges (Mock)
 */
exports.getUserBadges = async (req, res) => {
  res.json({ success: true, data: [] });
};

/**
 * Get reputation ledger (Mock)
 */
exports.getReputationLedger = async (req, res) => {
  res.json({ success: true, data: [] });
};

/**
 * Get user feedback (Mock)
 */
exports.getUserFeedback = async (req, res) => {
  res.json({ success: true, data: [] });
};

/**
 * Submit feedback
 */
exports.submitFeedback = async (req, res) => {
  res.json({ success: true, message: "Feedback submitted" });
};

/**
 * Export Reputation Passport
 */
exports.exportPassport = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const score = user.reputation.score;
    let level = 1;
    if (score > 100) level = Math.floor(score / 100);

    const rankQuery = await query(`
      SELECT COUNT(*) + 1 AS rank
      FROM users
      WHERE reputation_score > $1
    `, [score]);
    const rank = `#${rankQuery.rows[0].rank}`;

    const postsQuery = await query(`SELECT COUNT(*) FROM posts WHERE author_id = $1`, [userId]);
    const commentsQuery = await query(`SELECT COUNT(*) FROM comments WHERE author_id = $1`, [userId]);

    const activity = [
      { label: 'Posts Created', count: parseInt(postsQuery.rows[0].count) },
      { label: 'Helpful Replies', count: parseInt(commentsQuery.rows[0].count) }
    ];

    const badges = [];
    if (activity[0].count > 0) badges.push({ title: 'First Post', description: 'Created your first post', earned: user.createdAt });
    if (activity[1].count >= 10) badges.push({ title: 'Helper', description: 'Helped 10 community members', earned: user.createdAt });

    const passport = {
      creator_id: user.id,
      name: user.username,
      verified_since: user.createdAt,
      metrics: {
        total_score: score,
        level: level,
        rank: rank
      },
      badges,
      works: activity,
      export_date: new Date().toISOString(),
      signature: `JAMII-VERIFIED-${userId.substring(0,8)}-${Date.now()}` // Mock signature for now
    };

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
