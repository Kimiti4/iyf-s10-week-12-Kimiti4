/**
 * 🏆 Reputation Controller
 * Manages reputation scoring, badges, and contribution tracking
 */

const { ReputationScore, ReputationEvent, Badge, ContributionLedger, Feedback } = require('../models/Reputation');

// ============================================
// REPUTATION CALCULATION LOGIC
// ============================================

/**
 * Calculate overall reputation score from component scores
 * Weighted average:
 * - Helpfulness: 30%
 * - Reliability: 25%
 * - Quality: 25%
 * - Community Contribution: 20%
 */
const calculateOverallScore = (scores) => {
  return Math.round(
    scores.helpfulness * 0.3 +
      scores.reliability * 0.25 +
      scores.quality * 0.25 +
      scores.community_contribution * 0.2
  );
};

/**
 * Determine badge tier based on score
 */
const determineBadgeTier = (score) => {
  if (score >= 90) return 'legend';
  if (score >= 75) return 'platinum';
  if (score >= 60) return 'gold';
  if (score >= 40) return 'silver';
  return 'bronze';
};

/**
 * Calculate percentile ranking (0-100)
 * Shows where user ranks among all users
 */
const calculatePercentile = async (userId, score) => {
  const totalUsers = await ReputationScore.countDocuments();
  const usersAbove = await ReputationScore.countDocuments({ overall_score: { $gt: score } });
  return Math.round((100 * (totalUsers - usersAbove)) / totalUsers);
};

// ============================================
// REPUTATION UPDATES
// ============================================

/**
 * Track reputation event and update scores
 * Called when: help fulfilled, transaction completed, feedback received, etc
 */
exports.trackReputationEvent = async (userId, eventType, data) => {
  try {
    // Get or create reputation score
    let repScore = await ReputationScore.findOne({ user_id: userId });
    if (!repScore) {
      repScore = new ReputationScore({ user_id: userId });
    }

    // Determine points based on event type
    let pointsAwarded = 0;
    let scoreImpact = {
      helpfulness: 0,
      reliability: 0,
      quality: 0,
      community_contribution: 0,
    };

    switch (eventType) {
      case 'help_request_fulfilled': {
        // Base points: 5
        // Quality bonus: +5 if high rating
        // Speed bonus: +3 if completed within 24h
        pointsAwarded = 5;
        scoreImpact.helpfulness = 8;
        scoreImpact.reliability = 5;
        scoreImpact.community_contribution = 10;
        repScore.total_help_requests_fulfilled += 1;
        break;
      }

      case 'marketplace_transaction': {
        // Base points: 3
        // Value bonus: +1 per 1000 KES
        pointsAwarded = 3;
        if (data.transaction_value) {
          pointsAwarded += Math.floor(data.transaction_value / 1000);
        }
        scoreImpact.reliability = 5;
        scoreImpact.quality = 3;
        repScore.total_marketplace_transactions += 1;
        break;
      }

      case 'positive_feedback_received': {
        // Base points: 10
        // Rating bonus: +rating (1-5)
        pointsAwarded = 10;
        const rating = data.rating || 5;
        pointsAwarded += rating;

        scoreImpact.helpfulness = rating * 2;
        scoreImpact.quality = rating * 2;
        scoreImpact.reliability = rating;
        repScore.positive_feedback += 1;
        break;
      }

      case 'negative_feedback_received': {
        // Negative points: -15
        // Penalty: -rating * 3
        pointsAwarded = -15;
        const rating = data.rating || 1;
        pointsAwarded -= rating * 3;

        scoreImpact.helpfulness = -rating * 3;
        scoreImpact.quality = -rating * 3;
        scoreImpact.reliability = -rating * 2;
        repScore.negative_feedback += 1;
        break;
      }

      case 'contribution_made': {
        // Variable based on contribution type
        const contributionPoints = {
          skill_shared: 5,
          community_moderation: 8,
          content_created: 6,
        };
        pointsAwarded = contributionPoints[data.contribution_type] || 3;
        scoreImpact.community_contribution = 10;
        repScore.total_contributions += 1;
        break;
      }

      case 'streak_milestone': {
        // Bonus for maintaining streak
        const streakBonus = {
          7: 20,
          30: 50,
          100: 100,
        };
        pointsAwarded = streakBonus[data.streak_length] || 10;
        scoreImpact.reliability = 15;
        scoreImpact.community_contribution = 15;
        break;
      }
    }

    // Update individual scores (with bounds 0-100)
    const updateScore = (current, delta) => {
      return Math.max(0, Math.min(100, current + delta));
    };

    repScore.helpfulness = updateScore(repScore.helpfulness, scoreImpact.helpfulness);
    repScore.reliability = updateScore(repScore.reliability, scoreImpact.reliability);
    repScore.quality = updateScore(repScore.quality, scoreImpact.quality);
    repScore.community_contribution = updateScore(repScore.community_contribution, scoreImpact.community_contribution);

    // Calculate new overall score
    repScore.overall_score = calculateOverallScore({
      helpfulness: repScore.helpfulness,
      reliability: repScore.reliability,
      quality: repScore.quality,
      community_contribution: repScore.community_contribution,
    });

    // Update badge tier
    const oldBadge = repScore.badge_tier;
    repScore.badge_tier = determineBadgeTier(repScore.overall_score);

    // Calculate percentile
    repScore.percentile = await calculatePercentile(userId, repScore.overall_score);

    // Update streak
    repScore.last_activity_date = new Date();
    repScore.active_streak = (repScore.active_streak || 0) + 1;
    repScore.best_streak = Math.max(repScore.best_streak || 0, repScore.active_streak);

    // Check for badge unlock
    if (oldBadge !== repScore.badge_tier) {
      const badgeEarnFields = {
        bronze: 'badges_earned.bronze_earned_at',
        silver: 'badges_earned.silver_earned_at',
        gold: 'badges_earned.gold_earned_at',
        platinum: 'badges_earned.platinum_earned_at',
        legend: 'badges_earned.legend_earned_at',
      };
      repScore.set(badgeEarnFields[repScore.badge_tier], new Date());
    }

    repScore.updated_at = new Date();
    await repScore.save();

    // Create event ledger entry
    const event = new ReputationEvent({
      user_id: userId,
      event_type: eventType,
      reference_id: data.reference_id,
      points_awarded: pointsAwarded,
      description: data.description,
      triggered_by: data.triggered_by,
      metadata: data.metadata,
      score_impact: scoreImpact,
    });
    await event.save();

    // Create badge if tier changed
    if (oldBadge !== repScore.badge_tier) {
      await createBadge(userId, repScore.badge_tier, oldBadge);
    }

    return {
      success: true,
      reputation: repScore,
      event,
      tier_changed: oldBadge !== repScore.badge_tier,
    };
  } catch (error) {
    console.error('Error tracking reputation event:', error);
    throw error;
  }
};

/**
 * Create badge for user when tier unlocked
 */
const createBadge = async (userId, newTier, oldTier) => {
  const badgeConfig = {
    bronze_helper: {
      tier: 'bronze',
      title: 'Helper',
      description: 'Starting your contribution journey',
      unlock_criteria: { min_score: 0 },
    },
    silver_champion: {
      tier: 'silver',
      title: 'Community Champion',
      description: 'Making real impact in the community',
      unlock_criteria: { min_score: 40 },
    },
    gold_leader: {
      tier: 'gold',
      title: 'Impact Leader',
      description: 'Leading by example and contributing consistently',
      unlock_criteria: { min_score: 60 },
    },
    platinum_legend: {
      tier: 'platinum',
      title: 'Community Legend',
      description: 'Legendary contributor and trusted community member',
      unlock_criteria: { min_score: 75 },
    },
    legend_elite: {
      tier: 'legend',
      title: 'Elite Member',
      description: 'Extraordinary impact and unwavering commitment',
      unlock_criteria: { min_score: 90 },
    },
  };

  const tierToBadge = {
    bronze: 'bronze_helper',
    silver: 'silver_champion',
    gold: 'gold_leader',
    platinum: 'platinum_legend',
    legend: 'legend_elite',
  };

  const badgeType = tierToBadge[newTier];
  const config = badgeConfig[badgeType];

  const badge = new Badge({
    user_id: userId,
    badge_type: badgeType,
    badge_tier: newTier,
    title: config.title,
    description: config.description,
    unlock_criteria: config.unlock_criteria,
  });

  return badge.save();
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Get user reputation profile
 */
exports.getUserReputation = async (req, res) => {
  try {
    const { userId } = req.params;

    const reputation = await ReputationScore.findOne({ user_id: userId });
    const badges = await Badge.find({ user_id: userId, is_active: true });
    const recentEvents = await ReputationEvent.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(10);
    const contribution = await ContributionLedger.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(5);

    if (!reputation) {
      return res.status(404).json({ message: 'Reputation not found' });
    }

    res.json({
      reputation,
      badges,
      recent_events: recentEvents,
      recent_contributions: contribution,
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
    const { limit = 20, tier = null, timeframe = 'all' } = req.query;

    const query = {};
    if (tier) query.badge_tier = tier;

    const users = await ReputationScore.find(query)
      .sort({ overall_score: -1, percentile: -1 })
      .limit(parseInt(limit))
      .populate('user_id', 'name avatar location');

    res.json(users);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get reputation events (ledger)
 */
exports.getReputationLedger = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const events = await ReputationEvent.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ReputationEvent.countDocuments({ user_id: userId });

    res.json({
      events,
      total,
      pagination: { limit: parseInt(limit), skip: parseInt(skip) },
    });
  } catch (error) {
    console.error('Error getting ledger:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user badges
 */
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const badges = await Badge.find({ user_id: userId, is_active: true }).sort({
      earned_at: -1,
    });

    res.json(badges);
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Submit feedback for a user
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { from_user_id } = req.user;
    const { to_user_id, reference_type, reference_id, ratings, comment } = req.body;

    if (!to_user_id || !reference_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create feedback record
    const feedback = new Feedback({
      from_user_id,
      to_user_id,
      reference_type,
      reference_id,
      reliability_rating: ratings.reliability,
      quality_rating: ratings.quality,
      helpfulness_rating: ratings.helpfulness,
      overall_rating: ratings.overall,
      comment,
      sentiment: ratings.overall >= 4 ? 'positive' : ratings.overall === 3 ? 'neutral' : 'negative',
      is_verified: true,
    });

    await feedback.save();

    // Track reputation event
    const result = await exports.trackReputationEvent(to_user_id, 'positive_feedback_received', {
      rating: ratings.overall,
      reference_id: feedback._id,
      description: `Received ${ratings.overall}-star feedback`,
    });

    res.json({
      feedback,
      reputation_update: result,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's feedback received
 */
exports.getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const feedback = await Feedback.find({ to_user_id: userId })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .populate('from_user_id', 'name avatar');

    const stats = {
      average_rating: 0,
      total_feedback: feedback.length,
      positive: feedback.filter((f) => f.sentiment === 'positive').length,
      neutral: feedback.filter((f) => f.sentiment === 'neutral').length,
      negative: feedback.filter((f) => f.sentiment === 'negative').length,
    };

    if (feedback.length > 0) {
      const sum = feedback.reduce((acc, f) => acc + f.overall_rating, 0);
      stats.average_rating = (sum / feedback.length).toFixed(1);
    }

    res.json({
      feedback,
      stats,
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Log contribution
 */
exports.logContribution = async (req, res) => {
  try {
    const { userId } = req.user;
    const { contribution_type, reference_id, impact_metrics, category, description } = req.body;

    const contribution = new ContributionLedger({
      user_id: userId,
      contribution_type,
      reference_id,
      impact_metrics,
      category,
      description,
      points: {
        base_points: 5,
        quality_bonus: 0,
        speed_bonus: 0,
        community_bonus: 5,
        total: 10,
      },
    });

    await contribution.save();

    // Track as reputation event
    const result = await exports.trackReputationEvent(userId, 'contribution_made', {
      reference_id: contribution._id,
      contribution_type,
      description,
    });

    res.json({
      contribution,
      reputation_update: result,
    });
  } catch (error) {
    console.error('Error logging contribution:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports.trackReputationEvent = exports.trackReputationEvent;
