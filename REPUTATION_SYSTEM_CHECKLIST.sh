#!/bin/bash

# 🏆 Reputation System - Implementation Checklist
# Complete production-ready reputation system for JamiiLink

echo "==============================================="
echo "🏆 REPUTATION SYSTEM IMPLEMENTATION CHECKLIST"
echo "==============================================="
echo ""

# ============================================
# BACKEND SETUP
# ============================================
echo "📦 BACKEND SETUP"
echo ""

echo "✓ Models created:"
echo "  - src/models/Reputation.js"
echo "    Contains: ReputationScore, ReputationEvent, Badge, ContributionLedger, Feedback"
echo ""

echo "✓ Controllers created:"
echo "  - src/controllers/reputationController.js"
echo "    Functions: trackReputationEvent, getUserReputation, getLeaderboard, etc"
echo ""

echo "✓ Routes created:"
echo "  - src/routes/reputation.js"
echo "    Endpoints: GET /reputation/:userId, POST /feedback/submit, etc"
echo ""

# ============================================
# INTEGRATION STEPS
# ============================================
echo "🔌 INTEGRATION STEPS"
echo ""

echo "[ ] 1. Register routes in app.js"
echo "      const reputationRoutes = require('./routes/reputation');"
echo "      app.use('/api/reputation', reputationRoutes);"
echo ""

echo "[ ] 2. Add reputation tracking to AlertController (help requests)"
echo "      When request is marked fulfilled:"
echo "      await trackReputationEvent(userId, 'help_request_fulfilled', {...})"
echo ""

echo "[ ] 3. Add reputation tracking to MarketplaceController (transactions)"
echo "      When transaction completes:"
echo "      await trackReputationEvent(sellerId, 'marketplace_transaction', {...})"
echo ""

echo "[ ] 4. Update User schema with reputation fields"
echo "      Add: reputation_id, reputation_tier, reputation_score"
echo ""

echo "[ ] 5. Initialize ReputationScore for all existing users"
echo "      Migration script to create ReputationScore docs"
echo ""

# ============================================
# FRONTEND SETUP
# ============================================
echo ""
echo "🎨 FRONTEND SETUP"
echo ""

echo "✓ Components created:"
echo "  - src/components/ReputationComponents.jsx"
echo "    Components: ReputationBadge, ReputationMeter, ReputationLeaderboard, FeedbackForm, FeedbackList"
echo ""

echo "✓ Pages created:"
echo "  - src/pages/ReputationProfilePage.jsx"
echo "    Complete reputation profile display"
echo ""

# ============================================
# DISPLAY INTEGRATION
# ============================================
echo ""
echo "🖼️ DISPLAY INTEGRATION"
echo ""

echo "[ ] 1. Add ReputationBadge to ProfilePage"
echo "      Shows user's current badge tier"
echo ""

echo "[ ] 2. Add ReputationMeter to ProfilePage"
echo "      Shows detailed reputation breakdown"
echo ""

echo "[ ] 3. Add FeedbackForm to marketplace/help components"
echo "      Allow users to leave feedback after transactions"
echo ""

echo "[ ] 4. Add FeedbackList to ProfilePage"
echo "      Show all feedback received"
echo ""

echo "[ ] 5. Add ReputationLeaderboard to discover/community page"
echo "      Show top contributors globally or by tier"
echo ""

echo "[ ] 6. Add route for /reputation/:userId"
echo "      Direct access to user's reputation profile"
echo ""

# ============================================
# DATABASE SETUP
# ============================================
echo ""
echo "🗄️ DATABASE SETUP"
echo ""

echo "[ ] 1. Connect MongoDB collections"
echo "      ReputationScore, ReputationEvent, Badge, ContributionLedger, Feedback"
echo ""

echo "[ ] 2. Create indexes for performance"
echo "      Index on user_id, created_at, overall_score, badge_tier"
echo ""

echo "[ ] 3. Initialize ReputationScore for all users"
echo "      Migration: db.reputation_scores.insertMany([{user_id, defaults...}])"
echo ""

# ============================================
# TESTING
# ============================================
echo ""
echo "✅ TESTING"
echo ""

echo "[ ] 1. Test API endpoints"
echo "      GET /api/reputation/userId"
echo "      GET /api/reputation/leaderboard/all"
echo "      POST /api/reputation/feedback/submit"
echo ""

echo "[ ] 2. Test reputation calculation"
echo "      Submit feedback and verify score updates"
echo "      Check badge tier changes at thresholds (40, 60, 75, 90)"
echo ""

echo "[ ] 3. Test frontend components"
echo "      Badges display correctly"
echo "      Reputation meter shows correct scores"
echo "      Leaderboard sorts by overall_score"
echo ""

echo "[ ] 4. Test end-to-end flow"
echo "      User completes help request"
echo "      → Reputation event created"
echo "      → Reputation score updates"
echo "      → Badge potentially unlocked"
echo "      → Feedback submitted"
echo "      → Leaderboard updates"
echo ""

# ============================================
# DEPLOYMENT
# ============================================
echo ""
echo "🚀 DEPLOYMENT"
echo ""

echo "[ ] 1. Test in staging environment"
echo "      Deploy models, controllers, routes"
echo "      Test with sample data"
echo ""

echo "[ ] 2. Deploy backend changes"
echo "      Update app.js with routes"
echo "      Update existing controllers with tracking calls"
echo "      Run migration for existing users"
echo ""

echo "[ ] 3. Deploy frontend changes"
echo "      Add components and pages"
echo "      Integrate into existing pages"
echo "      Update routes"
echo ""

echo "[ ] 4. Monitor in production"
echo "      Check error logs"
echo "      Monitor API performance"
echo "      Verify reputation calculations"
echo ""

# ============================================
# DOCUMENTATION
# ============================================
echo ""
echo "📚 DOCUMENTATION"
echo ""

echo "✓ Files created:"
echo "  - REPUTATION_SYSTEM_GUIDE.md (Complete implementation guide)"
echo "  - This checklist (README.md)"
echo ""

echo "Key sections in guide:"
echo "  - Database Schema"
echo "  - API Endpoints"
echo "  - Backend Integration"
echo "  - Frontend Integration"
echo "  - Scoring Formula"
echo "  - Testing"
echo "  - Maintenance"
echo ""

# ============================================
# SCORING REFERENCE
# ============================================
echo ""
echo "📊 SCORING REFERENCE"
echo ""

echo "Overall Score = (Helpfulness×0.30) + (Reliability×0.25) + (Quality×0.25) + (Community×0.20)"
echo ""

echo "Badge Tiers:"
echo "  Bronze:   0-40   (Starting tier)"
echo "  Silver:   40-60  (Making impact)"
echo "  Gold:     60-75  (Community leader)"
echo "  Platinum: 75-90  (Legendary contributor)"
echo "  Legend:   90+    (Elite member)"
echo ""

echo "Event Points:"
echo "  Help fulfilled:        5 points"
echo "  Marketplace sale:      3+ points (+ 1 per 1000 KES)"
echo "  Positive feedback:     10+ points (+ rating bonus)"
echo "  Negative feedback:    -15 points (penalty)"
echo "  Contribution made:     3-8 points"
echo "  7-day streak:         20 points"
echo "  30-day streak:        50 points"
echo "  100-day streak:      100 points"
echo ""

# ============================================
# SUMMARY
# ============================================
echo ""
echo "==============================================="
echo "✨ REPUTATION SYSTEM READY!"
echo "==============================================="
echo ""
echo "Files created: 5"
echo "  - Backend: 2 (models, controller, routes)"
echo "  - Frontend: 2 (components, page)"
echo "  - Documentation: 1 (guide)"
echo ""
echo "Implementation time: ~2-3 days"
echo "  - Setup & integration: 4-6 hours"
echo "  - Testing: 3-4 hours"
echo "  - Deployment: 2-3 hours"
echo ""
echo "Next steps:"
echo "  1. Register routes in app.js"
echo "  2. Add tracking calls to existing controllers"
echo "  3. Integrate components into existing pages"
echo "  4. Test thoroughly"
echo "  5. Deploy to production"
echo ""
echo "==============================================="
echo ""
