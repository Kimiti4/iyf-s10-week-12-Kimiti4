/**
 * Reputation — score, badges, passport export (no fabricated leaderboard).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ImpactMeterWidget from '../components/ImpactMeterWidget';
import { useToast } from '../components/Toast';
import PageHeader from '../components/primitives/PageHeader';
import ErrorState from '../components/primitives/ErrorState';
import EmptyState from '../components/primitives/EmptyState';
import './ReputationSystem.css';

const ReputationSystem = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reputationData, setReputationData] = useState({
    score: 0,
    level: 1,
    rank: '—',
    nextLevel: { level: 2, requiredScore: 100, progress: 0 },
    badges: [],
    activity: [],
  });

  const fetchReputation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (user?.id) {
        const res = await api.reputation.getProfile(user.id);
        if (res.data) setReputationData(res.data);
      }
    } catch {
      setError('Failed to load reputation data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

  const getLevelEmoji = (level) => {
    if (level >= 30) return '👑';
    if (level >= 25) return '🌟';
    if (level >= 20) return '🏅';
    if (level >= 15) return '🔷';
    if (level >= 10) return '💎';
    return '🌱';
  };

  const exportPassport = async (format = 'json') => {
    try {
      const res = await api.reputation.exportPassport(format);
      const passport = res.data;

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(passport, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reputation-passport-${(user?.name || user?.username || 'user')
          .replace(/\s+/g, '-')
          .toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        await generatePDFPassport(passport);
      }
    } catch {
      toast.error('Failed to generate export');
    }
  };

  const generatePDFPassport = async (passport) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const html = `
      <div style="font-family: system-ui, sans-serif; padding: 40px; max-width: 600px;">
        <h1>JamiiLink Reputation Passport</h1>
        <p><strong>Name:</strong> ${passport.name || ''}</p>
        <p><strong>Score:</strong> ${passport.metrics?.total_score ?? ''} (Level ${passport.metrics?.level ?? ''})</p>
        <p><strong>Rank:</strong> ${passport.metrics?.rank ?? ''}</p>
      </div>
    `;
    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);
    await html2pdf()
      .from(element)
      .save(`reputation-passport-${(passport.name || 'user').replace(/\s+/g, '-').toLowerCase()}.pdf`);
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="reputation-loading" role="status">
        <div className="loading-spinner" aria-hidden="true" />
        <p>Loading reputation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="reputation-system" role="main">
        <PageHeader title="Reputation" subtitle="Your community standing" />
        <ErrorState error={error} onRetry={fetchReputation} />
      </main>
    );
  }

  const earnedBadges = (reputationData.badges || []).filter((b) => b.earned);

  return (
    <main className="reputation-system" role="main" aria-label="Reputation">
      <PageHeader
        eyebrow="Standing"
        title="Reputation"
        subtitle="Your contributions and achievements"
      />

      {user?.id && <ImpactMeterWidget userId={user.id} />}

      <div className="level-display">
        <div className="level-badge">
          <span className="level-emoji" aria-hidden="true">
            {getLevelEmoji(reputationData.level)}
          </span>
          <span className="level-number">{reputationData.level}</span>
          <span className="level-rank">{reputationData.rank}</span>
        </div>
      </div>

      <div className="score-display">
        <span className="score-value">{Number(reputationData.score).toFixed(0)}</span>
        <span className="score-label">Reputation points</span>
      </div>

      <div className="reputation-tabs" role="tablist">
        {['overview', 'badges', 'passport'].map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'badges' && 'Badges'}
            {tab === 'passport' && 'Passport'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            className="overview-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            role="tabpanel"
          >
            <div className="progress-section">
              <div className="progress-info">
                <span>
                  Level {reputationData.level} → {reputationData.nextLevel?.level}
                </span>
                <span>{reputationData.nextLevel?.progress ?? 0}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, Number(reputationData.nextLevel?.progress) || 0)}%`,
                  }}
                />
              </div>
            </div>

            <div className="activity-grid">
              {(reputationData.activity || []).length === 0 ? (
                <EmptyState
                  icon="📊"
                  title="No activity yet"
                  message="Posts, replies, and events will show up here"
                />
              ) : (
                reputationData.activity.map((item) => (
                  <div key={item.type} className="activity-card">
                    <div className="activity-icon" aria-hidden="true">
                      {item.type === 'post' && '📝'}
                      {item.type === 'reply' && '💬'}
                      {item.type === 'event' && '🎪'}
                      {!['post', 'reply', 'event'].includes(item.type) && '📌'}
                    </div>
                    <div>
                      <strong>{item.count}</strong>
                      <span>{item.label}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            className="badges-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            role="tabpanel"
          >
            {(reputationData.badges || []).length === 0 ? (
              <EmptyState
                icon="🎖️"
                title="No badges yet"
                message="Keep contributing to unlock badges"
              />
            ) : (
              <div className="badges-grid">
                {reputationData.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`badge-card ${badge.earned ? '' : 'locked'}`}
                  >
                    <div className="badge-icon" aria-hidden="true">
                      {badge.icon}
                    </div>
                    <h3>{badge.name}</h3>
                    <p>{badge.description}</p>
                    {badge.earned && badge.earnedDate && (
                      <small>
                        Earned {new Date(badge.earnedDate).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'passport' && (
          <motion.div
            key="passport"
            className="passport-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            role="tabpanel"
          >
            <div className="passport-preview">
              <h3>Reputation passport</h3>
              <p>Export achievements for portfolios or applications.</p>
              <div className="passport-stats">
                <div className="passport-stat">
                  <span>{Number(reputationData.score).toFixed(0)} points</span>
                </div>
                <div className="passport-stat">
                  <span>Level {reputationData.level}</span>
                </div>
                <div className="passport-stat">
                  <span>{earnedBadges.length} badges earned</span>
                </div>
              </div>
              <div className="passport-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => exportPassport('json')}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => exportPassport('pdf')}
                >
                  Export PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ReputationSystem;
