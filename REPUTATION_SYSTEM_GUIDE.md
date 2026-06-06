# 🏆 Reputation System - Complete Implementation Guide

## Overview

The reputation system is a **contribution-weighted scoring system** that tracks user value to the community through:

- **Reputation Scores** (0-100): Helpfulness, Reliability, Quality, Community Contribution
- **Badge Tiers**: Bronze → Silver → Gold → Platinum → Legend
- **Contribution Ledger**: Complete history of contributions and impact
- **Feedback System**: Community verification of quality
- **Leaderboards**: Recognition and gamification

---

## 🗄️ Database Schema

### ReputationScore Collection
Stores user's overall reputation metrics

```javascript
{
  user_id: ObjectId,
  
  // Component scores (0-100 each)
  helpfulness: Number,       // Do they help? (30% weight)
  reliability: Number,       // Do they follow through? (25% weight)
  quality: Number,          // Is the work good? (25% weight)
  community_contribution: Number, // Do they contribute? (20% weight)
  
  // Overall metrics
  overall_score: Number,     // Weighted average of above
  badge_tier: String,        // bronze|silver|gold|platinum|legend
  percentile: Number,        // Ranking (0-100)
  
  // Activity tracking
  total_contributions: Number,
  total_help_requests_fulfilled: Number,
  total_marketplace_transactions: Number,
  positive_feedback: Number,
  negative_feedback: Number,
  active_streak: Number,
  best_streak: Number,
  last_activity_date: Date,
  
  // Badges earned
  badges_earned: {
    bronze_earned_at: Date,
    silver_earned_at: Date,
    gold_earned_at: Date,
    platinum_earned_at: Date,
    legend_earned_at: Date
  }
}
```

### ReputationEvent Collection
Complete ledger of reputation events

```javascript
{
  user_id: ObjectId,
  event_type: String, // help_request_fulfilled, marketplace_transaction, positive_feedback_received, etc
  reference_id: ObjectId, // Reference to post/transaction/feedback
  points_awarded: Number,
  description: String,
  triggered_by: ObjectId, // Who/what triggered this
  
  score_impact: {
    helpfulness: Number,
    reliability: Number,
    quality: Number,
    community_contribution: Number
  },
  
  created_at: Date
}
```

### Badge Collection
Earned badges

```javascript
{
  user_id: ObjectId,
  badge_type: String, // bronze_helper, silver_champion, gold_leader, etc
  badge_tier: String, // bronze|silver|gold|platinum|legend
  title: String,
  description: String,
  earned_at: Date,
  is_active: Boolean
}
```

### ContributionLedger Collection
Complete contribution history

```javascript
{
  user_id: ObjectId,
  contribution_type: String, // help_request_fulfilled, marketplace_sale, skill_shared, etc
  reference_id: ObjectId,
  
  impact_metrics: {
    people_helped: Number,
    value_exchanged: Number, // KES
    time_invested: Number,   // hours
    positive_feedback_count: Number,
    negative_feedback_count: Number
  },
  
  points: {
    base_points: Number,
    quality_bonus: Number,
    speed_bonus: Number,
    community_bonus: Number,
    total: Number
  },
  
  created_at: Date,
  completed_at: Date
}
```

### Feedback Collection
Community feedback for each user

```javascript
{
  from_user_id: ObjectId,
  to_user_id: ObjectId,
  reference_type: String, // help_request, marketplace_transaction, skill_exchange
  reference_id: ObjectId,
  
  reliability_rating: Number, // 1-5
  quality_rating: Number,     // 1-5
  helpfulness_rating: Number, // 1-5
  overall_rating: Number,     // 1-5
  
  comment: String,
  sentiment: String, // positive|neutral|negative (auto-calculated)
  is_verified: Boolean,
  
  created_at: Date
}
```

---

## 📡 API Endpoints

### Public Endpoints

#### GET `/api/reputation/:userId`
Get user's reputation profile

**Response:**
```json
{
  "reputation": {
    "_id": "...",
    "user_id": "...",
    "helpfulness": 85,
    "reliability": 90,
    "quality": 88,
    "community_contribution": 92,
    "overall_score": 88,
    "badge_tier": "gold",
    "percentile": 92,
    "total_contributions": 42,
    "total_help_requests_fulfilled": 18,
    "total_marketplace_transactions": 15,
    "active_streak": 7,
    "best_streak": 30
  },
  "badges": [...],
  "recent_events": [...],
  "recent_contributions": [...]
}
```

#### GET `/api/reputation/:userId/badges`
Get user's earned badges

#### GET `/api/reputation/:userId/feedback`
Get feedback received by user with stats

**Response:**
```json
{
  "feedback": [...],
  "stats": {
    "average_rating": 4.8,
    "total_feedback": 23,
    "positive": 21,
    "neutral": 2,
    "negative": 0
  }
}
```

#### GET `/api/reputation/:userId/ledger`
Get reputation events ledger (paginated)

**Query params:**
- `limit`: Results per page (default: 50)
- `skip`: Pagination offset (default: 0)

#### GET `/api/reputation/leaderboard/all`
Get global leaderboard

**Query params:**
- `limit`: Top N users (default: 20)

**Response:**
```json
[
  {
    "user_id": {"name": "Sarah", "avatar": "..."},
    "overall_score": 92,
    "badge_tier": "gold",
    "percentile": 95,
    "total_contributions": 45
  },
  ...
]
```

#### GET `/api/reputation/leaderboard/:tier`
Get leaderboard filtered by tier (bronze|silver|gold|platinum|legend)

### Protected Endpoints (require auth)

#### POST `/api/reputation/feedback/submit`
Submit feedback for a user

**Request:**
```json
{
  "to_user_id": "user_id",
  "reference_type": "marketplace_transaction",
  "ratings": {
    "reliability": 5,
    "quality": 5,
    "helpfulness": 4,
    "overall": 5
  },
  "comment": "Great seller, highly recommended!"
}
```

**Response:**
```json
{
  "feedback": {...},
  "reputation_update": {
    "reputation": {...},
    "tier_changed": false
  }
}
```

#### POST `/api/reputation/contribution/log`
Log a contribution

**Request:**
```json
{
  "contribution_type": "help_request_fulfilled",
  "reference_id": "post_id",
  "impact_metrics": {
    "people_helped": 1,
    "value_exchanged": 0,
    "time_invested": 2
  },
  "category": "help",
  "description": "Fixed user's React code issue"
}
```

---

## 🔌 Backend Integration

### 1. Register Routes in `app.js`

```javascript
const reputationRoutes = require('./routes/reputation');
app.use('/api/reputation', reputationRoutes);
```

### 2. Track Events When Actions Complete

#### When help request is fulfilled:

```javascript
const reputationController = require('./controllers/reputationController');

// In your help request completion handler
await reputationController.trackReputationEvent(
  fulfillerId,
  'help_request_fulfilled',
  {
    reference_id: requestId,
    description: 'Helped user fix code issue',
    triggered_by: userId
  }
);
```

#### When marketplace transaction completes:

```javascript
await reputationController.trackReputationEvent(
  sellerId,
  'marketplace_transaction',
  {
    reference_id: transactionId,
    transaction_value: 5000, // KES
    description: 'Sold farm produce',
    metadata: {
      category: 'marketplace',
      amount_value: 5000,
      transaction_id: transactionId
    }
  }
);
```

#### When feedback is received:

```javascript
// Automatically called when feedback is submitted (see feedback submission endpoint)
// Points awarded: 10 + rating bonus (1-5)
```

### 3. Integrate with Existing Models

Add fields to User model:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields
  
  // Reputation reference
  reputation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReputationScore'
  },
  
  // Quick access to tier and score
  reputation_tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'legend'],
    default: 'bronze'
  },
  
  reputation_score: {
    type: Number,
    default: 0
  }
});
```

Update user when reputation changes:

```javascript
// In reputationController after updating reputation
const user = await User.findByIdAndUpdate(userId, {
  reputation_tier: reputation.badge_tier,
  reputation_score: reputation.overall_score
});
```

---

## 🎨 Frontend Integration

### 1. Display Reputation Badge on Profile

```jsx
import { ReputationBadge } from '../components/ReputationComponents';

<ReputationBadge tier={user.reputation_tier} size="lg" />
```

### 2. Display Reputation Meter

```jsx
import { ReputationMeter } from '../components/ReputationComponents';

<ReputationMeter reputation={userReputation} />
```

### 3. Display Leaderboard

```jsx
import { ReputationLeaderboard } from '../components/ReputationComponents';

<ReputationLeaderboard />
<ReputationLeaderboard tier="gold" />
```

### 4. Add Feedback Form

```jsx
import { FeedbackForm } from '../components/ReputationComponents';

<FeedbackForm 
  toUserId={userId}
  onSubmit={() => {
    // Refresh reputation data
    fetchReputation();
  }}
/>
```

### 5. Add Feedback List

```jsx
import { FeedbackList } from '../components/ReputationComponents';

<FeedbackList userId={userId} />
```

### 6. Add Full Reputation Page

```jsx
import ReputationProfilePage from '../pages/ReputationProfilePage';

// In routes
<Route path="/reputation/:userId" element={<ReputationProfilePage />} />
```

---

## 🎯 Scoring Formula

### Overall Score Calculation
```
Overall Score = (Helpfulness × 0.30) +
                (Reliability × 0.25) +
                (Quality × 0.25) +
                (Community Contribution × 0.20)
```

### Badge Tiers Based on Score
- **Bronze**: 0-40 (starting tier)
- **Silver**: 40-60 (making impact)
- **Gold**: 60-75 (community leader)
- **Platinum**: 75-90 (legendary contributor)
- **Legend**: 90+ (elite member)

### Points Awarded by Event Type

| Event | Points | Notes |
|-------|--------|-------|
| Help request fulfilled | 5 + bonuses | +5 quality, +10 community |
| Marketplace transaction | 3 + value | +1 per 1000 KES |
| Positive feedback (5★) | 10 + 5 | +10 bonus |
| Negative feedback (1★) | -15 - 3 | Penalty system |
| Contribution made | 3-8 | Depends on type |
| Streak milestone (7 days) | 20 | Bonus |
| Streak milestone (30 days) | 50 | Bonus |
| Streak milestone (100 days) | 100 | Bonus |

---

## 📊 Percentile Calculation

Percentile shows where user ranks among all users:

```
Percentile = (Users Below You / Total Users) × 100
```

Example: If there are 1000 users and 50 are above you, your percentile is (950/1000) × 100 = 95%

---

## 🧪 Testing the System

### 1. Create Test User with High Reputation

```bash
# Backend: Create multiple reputation events for testing
POST /api/reputation/feedback/submit
{
  "to_user_id": "test_user_id",
  "reference_type": "marketplace_transaction",
  "ratings": {
    "reliability": 5,
    "quality": 5,
    "helpfulness": 5,
    "overall": 5
  },
  "comment": "Excellent service!"
}

# Repeat multiple times to build up reputation
```

### 2. Verify Leaderboard

```bash
GET /api/reputation/leaderboard/all?limit=10
# Should show top contributors sorted by overall_score
```

### 3. Check User Reputation

```bash
GET /api/reputation/{userId}
# Should show complete reputation profile with badges and events
```

### 4. Test Tier Progression

```bash
# Submit 30+ positive feedback items to trigger:
# Bronze → Silver (score ≥ 40)
# Silver → Gold (score ≥ 60)
# Gold → Platinum (score ≥ 75)
# Platinum → Legend (score ≥ 90)
```

---

## 🔄 Maintenance & Updates

### Monthly Tasks

1. **Recalculate Percentiles**: Run percentile calculation for all users
2. **Archive Old Events**: Move events older than 1 year to archive collection
3. **Update Streaks**: Reset inactive streaks (no activity for 7+ days)
4. **Generate Reports**: Create community health reports

### Sample Maintenance Script

```javascript
// scripts/maintenance/updateReputation.js
const ReputationScore = require('./models/Reputation').ReputationScore;

async function updatePercentiles() {
  const users = await ReputationScore.find().sort({ overall_score: -1 });
  const total = users.length;
  
  for (let i = 0; i < users.length; i++) {
    const percentile = Math.round((100 * (total - i)) / total);
    await ReputationScore.findByIdAndUpdate(users[i]._id, { percentile });
  }
  
  console.log('Percentiles updated');
}

updatePercentiles().catch(console.error);
```

---

## 📈 Key Metrics to Monitor

1. **Average Reputation Score**: Community health indicator
2. **Badge Distribution**: How many users reach each tier?
3. **Engagement Rate**: % of users with positive reputation events
4. **Feedback Rate**: How many transactions result in feedback?
5. **Streak Participation**: How many users maintain streaks?

---

## 🚀 Next Steps (After Implementation)

1. ✅ Test all endpoints thoroughly
2. ✅ Deploy to production
3. 📊 Monitor metrics and user feedback
4. 🎁 Create achievement notifications
5. 🏆 Launch special badges for milestones
6. 🔄 Implement reputation decay for inactive users (optional)
7. 🌍 Add geographical leaderboards
8. 🎯 Create gamification challenges tied to reputation

---

## 📞 Support & Troubleshooting

### Issue: Reputation not updating after feedback

**Solution:**
- Check if `trackReputationEvent` is being called
- Verify user exists in ReputationScore collection
- Check for errors in controller logs

### Issue: Percentile always shows 0

**Solution:**
- Run percentile recalculation
- Ensure ReputationScore records exist for all users
- Check query for missing users

### Issue: Badges not appearing

**Solution:**
- Verify badge tiers match score thresholds
- Check if Badge records are being created
- Frontend should fetch badges from `/api/reputation/:userId/badges`

---

**Reputation System Ready to Deploy!** 🏆✨
