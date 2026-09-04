/**
 * 🏆 Reputation System Models
 * Contribution-weighted reputation with badges and ledger
 */

const mongoose = require('mongoose');

// ============================================
// REPUTATION SCORE SCHEMA
// ============================================
const ReputationScoreSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  
  // Core scores (0-100 each)
  helpfulness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  reliability: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  quality: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  community_contribution: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // Overall reputation score (weighted average)
  overall_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    index: true,
  },
  
  // Totals for calculation
  total_contributions: {
    type: Number,
    default: 0,
  },
  total_help_requests_fulfilled: {
    type: Number,
    default: 0,
  },
  total_marketplace_transactions: {
    type: Number,
    default: 0,
  },
  positive_feedback: {
    type: Number,
    default: 0,
  },
  negative_feedback: {
    type: Number,
    default: 0,
  },
  
  // Badge tier (calculated based on score)
  badge_tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'legend'],
    default: 'bronze',
    index: true,
  },
  
  // Percentile ranking
  percentile: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // Streak tracking
  active_streak: {
    type: Number,
    default: 0,
  },
  best_streak: {
    type: Number,
    default: 0,
  },
  last_activity_date: {
    type: Date,
    default: Date.now,
  },
  
  // Badge earned dates
  badges_earned: {
    bronze_earned_at: Date,
    silver_earned_at: Date,
    gold_earned_at: Date,
    platinum_earned_at: Date,
    legend_earned_at: Date,
  },
  
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// ============================================
// REPUTATION EVENT SCHEMA (LEDGER)
// ============================================
const ReputationEventSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Event type
  event_type: {
    type: String,
    enum: [
      'help_request_fulfilled',
      'marketplace_transaction',
      'positive_feedback_received',
      'negative_feedback_received',
      'contribution_made',
      'streak_milestone',
      'badge_earned',
    ],
    required: true,
    index: true,
  },
  
  // Event details
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    description: 'ID of post, transaction, feedback, etc',
  },
  
  points_awarded: {
    type: Number,
    default: 0,
  },
  
  description: {
    type: String,
  },
  
  // Who triggered it (can be system or another user)
  triggered_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  metadata: {
    category: String, // 'help', 'marketplace', 'feedback', etc
    amount_value: Number, // KES exchanged, etc
    transaction_id: mongoose.Schema.Types.ObjectId,
  },
  
  score_impact: {
    helpfulness: Number,
    reliability: Number,
    quality: Number,
    community_contribution: Number,
  },
  
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// ============================================
// BADGE SCHEMA
// ============================================
const BadgeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  badge_type: {
    type: String,
    enum: [
      'bronze_helper',
      'silver_champion',
      'gold_leader',
      'platinum_legend',
      'streak_7',
      'streak_30',
      'streak_100',
      'market_master',
      'community_voice',
      'verified_expert',
      'top_tier',
    ],
    required: true,
  },
  
  badge_tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'legend'],
  },
  
  title: String,
  description: String,
  icon: String,
  
  unlock_criteria: {
    min_score: Number,
    min_contributions: Number,
    min_streak: Number,
    special_condition: String,
  },
  
  earned_at: {
    type: Date,
    default: Date.now,
  },
  
  is_active: {
    type: Boolean,
    default: true,
  },
});

// ============================================
// CONTRIBUTION LEDGER SCHEMA
// ============================================
const ContributionLedgerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Contribution details
  contribution_type: {
    type: String,
    enum: [
      'help_request_fulfilled',
      'marketplace_sale',
      'skill_shared',
      'community_moderation',
      'content_created',
    ],
    required: true,
  },
  
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  
  // Impact metrics
  impact_metrics: {
    people_helped: Number,
    value_exchanged: Number, // KES
    time_invested: Number, // hours
    positive_feedback_count: Number,
    negative_feedback_count: Number,
  },
  
  // Points breakdown
  points: {
    base_points: Number,
    quality_bonus: Number,
    speed_bonus: Number, // Faster = more points
    community_bonus: Number,
    total: Number,
  },
  
  // Context
  category: String,
  description: String,
  location: String,
  
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  completed_at: Date,
});

// ============================================
// FEEDBACK SCHEMA (for others to rate)
// ============================================
const FeedbackSchema = new mongoose.Schema({
  from_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  to_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Feedback context
  reference_type: {
    type: String,
    enum: ['help_request', 'marketplace_transaction', 'skill_exchange'],
    required: true,
  },
  
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  
  // Ratings (1-5)
  reliability_rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  quality_rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  helpfulness_rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  overall_rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  // Text feedback
  comment: String,
  
  // Sentiment (auto-calculated)
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
  },
  
  // Verification
  is_verified: {
    type: Boolean,
    default: false,
  },
  
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create indexes for performance
ReputationScoreSchema.index({ overall_score: -1, created_at: -1 });
ReputationScoreSchema.index({ badge_tier: 1, percentile: -1 });
ReputationEventSchema.index({ user_id: 1, created_at: -1 });
ContributionLedgerSchema.index({ user_id: 1, created_at: -1 });
ContributionLedgerSchema.index({ contribution_type: 1, created_at: -1 });
FeedbackSchema.index({ to_user_id: 1, created_at: -1 });
FeedbackSchema.index({ from_user_id: 1, created_at: -1 });

// Create models
module.exports = {
  ReputationScore: mongoose.model('ReputationScore', ReputationScoreSchema),
  ReputationEvent: mongoose.model('ReputationEvent', ReputationEventSchema),
  Badge: mongoose.model('Badge', BadgeSchema),
  ContributionLedger: mongoose.model('ContributionLedger', ContributionLedgerSchema),
  Feedback: mongoose.model('Feedback', FeedbackSchema),
};
