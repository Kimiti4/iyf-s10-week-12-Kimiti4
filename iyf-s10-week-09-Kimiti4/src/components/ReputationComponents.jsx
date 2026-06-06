/**
 * 🏆 Reputation Components
 * Display reputation, badges, and feedback
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// ============================================
// REPUTATION BADGE COMPONENT
// ============================================
export const ReputationBadge = ({ tier = 'bronze', size = 'md' }) => {
  const badgeConfig = {
    bronze: {
      color: '#CD7F32',
      label: 'Helper',
      icon: '🥉',
      description: 'Getting started',
    },
    silver: {
      color: '#C0C0C0',
      label: 'Champion',
      icon: '🥈',
      description: 'Making impact',
    },
    gold: {
      color: '#FFD700',
      label: 'Leader',
      icon: '🥇',
      description: 'Leading by example',
    },
    platinum: {
      color: '#E5E4E2',
      label: 'Legend',
      icon: '👑',
      description: 'Legendary contributor',
    },
    legend: {
      color: '#00D4FF',
      label: 'Elite',
      icon: '⭐',
      description: 'Extraordinary impact',
    },
  };

  const config = badgeConfig[tier] || badgeConfig.bronze;
  const sizeMap = { sm: '32px', md: '48px', lg: '64px' };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
      title={config.description}
    >
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          borderRadius: '50%',
          background: `radial-gradient(circle, ${config.color}, ${config.color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px',
          border: `3px solid white`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
        }}
      >
        {config.icon}
      </div>
      {size !== 'sm' && (
        <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: config.color }}>
          {config.label}
        </p>
      )}
    </div>
  );
};

// ============================================
// REPUTATION METER COMPONENT
// ============================================
export const ReputationMeter = ({ reputation }) => {
  if (!reputation) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ marginTop: 0 }}>Reputation Score</h3>

      {/* Overall Score Circle */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `conic-gradient(#22C55E 0deg ${reputation.overall_score * 3.6}deg, #e5e5e5 ${reputation.overall_score * 3.6}deg)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: '12px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#22C55E' }}>
              {Math.round(reputation.overall_score)}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>/ 100</div>
          </div>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
          Rank: #{reputation.percentile}
        </p>
      </div>

      {/* Score Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ScoreBar label="Helpfulness" value={reputation.helpfulness} />
        <ScoreBar label="Reliability" value={reputation.reliability} />
        <ScoreBar label="Quality" value={reputation.quality} />
        <ScoreBar label="Community" value={reputation.community_contribution} />
      </div>

      {/* Stats */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <StatBox label="Contributions" value={reputation.total_contributions} />
          <StatBox label="Help Given" value={reputation.total_help_requests_fulfilled} />
          <StatBox label="Transactions" value={reputation.total_marketplace_transactions} />
          <StatBox label="Active Streak" value={`${reputation.active_streak} days`} />
        </div>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, value }) => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
        fontSize: '12px',
      }}
    >
      <span style={{ fontWeight: '500' }}>{label}</span>
      <span style={{ color: '#22C55E', fontWeight: '600' }}>{Math.round(value)}</span>
    </div>
    <div
      style={{
        width: '100%',
        height: '8px',
        background: '#e5e5e5',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          background: '#22C55E',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  </div>
);

const StatBox = ({ label, value }) => (
  <div style={{ background: 'white', padding: '12px', borderRadius: '8px' }}>
    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#999' }}>{label}</p>
    <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#22C55E' }}>{value}</p>
  </div>
);

// ============================================
// REPUTATION LEADERBOARD
// ============================================
export const ReputationLeaderboard = ({ tier = null }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const endpoint = tier ? `/api/reputation/leaderboard/${tier}` : `/api/reputation/leaderboard/all`;
        const response = await api.get(endpoint + '?limit=10');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tier]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading leaderboard...</div>;
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
        <h3 style={{ margin: 0 }}>🏆 Top Contributors</h3>
      </div>

      <div>
        {users.map((user, index) => (
          <div
            key={user._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: index < users.length - 1 ? '1px solid #f0f0f0' : 'none',
              gap: '12px',
            }}
          >
            {/* Rank */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: index < 3 ? 'white' : '#666',
              }}
            >
              {index + 1}
            </div>

            {/* Badge */}
            <ReputationBadge tier={user.badge_tier} size="sm" />

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>
                {user.user_id?.name || 'Unknown'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                Score: {Math.round(user.overall_score)} • Rank: #{user.percentile}
              </p>
            </div>

            {/* Score */}
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#22C55E',
                textAlign: 'right',
              }}
            >
              {Math.round(user.overall_score)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// FEEDBACK COMPONENT
// ============================================
export const FeedbackForm = ({ toUserId, onSubmit }) => {
  const [ratings, setRatings] = useState({
    reliability: 5,
    quality: 5,
    helpfulness: 5,
    overall: 5,
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/reputation/feedback/submit', {
        to_user_id: toUserId,
        reference_type: 'marketplace_transaction',
        ratings,
        comment,
      });

      // Reset form
      setRatings({ reliability: 5, quality: 5, helpfulness: 5, overall: 5 });
      setComment('');
      onSubmit?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
      <h3 style={{ marginTop: 0 }}>Leave Feedback</h3>

      {/* Ratings */}
      <div style={{ marginBottom: '20px' }}>
        {['reliability', 'quality', 'helpfulness', 'overall'].map((key) => (
          <div key={key} style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', textTransform: 'capitalize', fontWeight: '500' }}>
              {key}
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings({ ...ratings, [key]: star })}
                  style={{
                    padding: '8px 12px',
                    border: `2px solid ${ratings[key] >= star ? '#22C55E' : '#e5e5e5'}`,
                    background: ratings[key] >= star ? '#22C55E' : 'white',
                    color: ratings[key] >= star ? 'white' : '#999',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comment */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Comments</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            fontFamily: 'inherit',
            fontSize: '14px',
            minHeight: '100px',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#22C55E',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

// ============================================
// FEEDBACK DISPLAY
// ============================================
export const FeedbackList = ({ userId }) => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.get(`/api/reputation/${userId}/feedback`);
        setFeedback(response.data.feedback);
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [userId]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading feedback...</div>;
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ marginTop: 0 }}>Feedback ({stats?.total_feedback || 0})</h3>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#f0f0f0', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#999' }}>Avg Rating</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#22C55E' }}>
              {stats.average_rating}★
            </p>
          </div>
          <div style={{ background: '#f0f0f0', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#999' }}>Positive</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#22C55E' }}>
              {stats.positive}
            </p>
          </div>
          <div style={{ background: '#f0f0f0', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#999' }}>Neutral</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FBBF24' }}>
              {stats.neutral}
            </p>
          </div>
          <div style={{ background: '#f0f0f0', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#999' }}>Negative</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#EF4444' }}>
              {stats.negative}
            </p>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div>
        {feedback.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No feedback yet</p>
        ) : (
          feedback.map((item) => (
            <div
              key={item._id}
              style={{
                padding: '12px',
                borderBottom: '1px solid #f0f0f0',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>
                  {item.from_user_id?.name || 'Anonymous'}
                </p>
                <div style={{ color: '#FBBF24', fontSize: '14px' }}>
                  {'★'.repeat(item.overall_rating)}{'☆'.repeat(5 - item.overall_rating)}
                </div>
              </div>
              {item.comment && (
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                  "{item.comment}"
                </p>
              )}
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default {
  ReputationBadge,
  ReputationMeter,
  ReputationLeaderboard,
  FeedbackForm,
  FeedbackList,
};
