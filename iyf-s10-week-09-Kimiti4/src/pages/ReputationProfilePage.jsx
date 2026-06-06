/**
 * 🏆 Reputation Profile Page
 * Display full reputation, badges, and feedback
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  ReputationBadge,
  ReputationMeter,
  ReputationLeaderboard,
  FeedbackForm,
  FeedbackList,
} from '../components/ReputationComponents';

export const ReputationProfilePage = () => {
  const { userId } = useParams();
  const [reputation, setReputation] = useState(null);
  const [badges, setBadges] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const response = await api.get(`/api/reputation/${userId}`);
        setReputation(response.data.reputation);
        setBadges(response.data.badges);
        setEvents(response.data.recent_events);
      } catch (error) {
        console.error('Error fetching reputation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReputation();
  }, [userId]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading reputation profile...</div>;
  }

  if (!reputation) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Reputation profile not found</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>Reputation Profile</h1>
          <p style={{ margin: 0, color: '#999' }}>
            Badge Tier: <strong>{reputation.badge_tier.toUpperCase()}</strong>
          </p>
        </div>
        <button
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          style={{
            padding: '12px 24px',
            background: '#22C55E',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {showFeedbackForm ? 'Cancel' : 'Leave Feedback'}
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
        {/* Left Column */}
        <div>
          {/* Reputation Meter */}
          <ReputationMeter reputation={reputation} />

          {/* Recent Events */}
          <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
            <div>
              {events.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>No recent activity</p>
              ) : (
                events.map((event) => (
                  <div key={event._id} style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ margin: '0 0 6px 0', fontWeight: '500', fontSize: '14px' }}>
                      {event.description || event.event_type}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      +{event.points_awarded} points • {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Badge Display */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ marginTop: 0 }}>Badges ({badges.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {badges.map((badge) => (
                <div key={badge._id} style={{ textAlign: 'center' }}>
                  <ReputationBadge tier={badge.badge_tier} size="md" />
                  <p style={{ margin: '8px 0 4px 0', fontSize: '12px', fontWeight: '600' }}>{badge.title}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#999' }}>
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ marginTop: '24px' }}>
            <ReputationLeaderboard />
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {showFeedbackForm && (
          <FeedbackForm toUserId={userId} onSubmit={() => setShowFeedbackForm(false)} />
        )}
        <FeedbackList userId={userId} />
      </div>
    </div>
  );
};

export default ReputationProfilePage;
