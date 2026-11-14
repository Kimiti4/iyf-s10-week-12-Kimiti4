import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import SkillMatchCard from '../components/SkillMatchCard';
import { useToast } from '../components/Toast';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
import ErrorState from '../components/primitives/ErrorState';
import './SkillExchange.css';

export default function SkillExchange() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [profile, setProfile] = useState({ offering: [], seeking: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOffer, setNewOffer] = useState('');
  const [newSeek, setNewSeek] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profRes, matchRes] = await Promise.all([
        api.skills.getProfile(),
        api.skills.getMatches(),
      ]);
      if (profRes.data) setProfile(profRes.data);
      if (matchRes.data) setMatches(matchRes.data);
    } catch {
      setError('Failed to load skill exchange data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveProfile = async () => {
    try {
      await api.skills.saveProfile(profile);
      toast.success('Profile updated');
      fetchData();
    } catch {
      toast.error('Failed to save profile');
    }
  };

  const addOffer = () => {
    if (newOffer.trim()) {
      setProfile({
        ...profile,
        offering: [...profile.offering, { skill: newOffer.trim() }],
      });
      setNewOffer('');
    }
  };

  const addSeek = () => {
    if (newSeek.trim()) {
      setProfile({
        ...profile,
        seeking: [...profile.seeking, { skill: newSeek.trim() }],
      });
      setNewSeek('');
    }
  };

  return (
    <main className="skill-exchange-page" role="main" aria-label="Skill exchange">
      <PageHeader
        eyebrow="Skills"
        title="Skill exchange"
        subtitle="Offer what you know. Find what you need."
      />

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'matches'}
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          My profile
        </button>
      </div>

      <div className="content-section">
        {loading ? (
          <div role="status">Loading…</div>
        ) : error ? (
          <ErrorState error={error} onRetry={fetchData} />
        ) : activeTab === 'matches' ? (
          <div className="matches-grid">
            {matches.length === 0 ? (
              <EmptyState
                icon="🤝"
                title="No matches yet"
                message="Update your profile with skills you offer and seek"
                action={{ label: 'Edit profile', onClick: () => setActiveTab('profile') }}
              />
            ) : (
              matches.map((match) => (
                <SkillMatchCard
                  key={match.match_id}
                  match={match}
                  onComplete={() => fetchData()}
                />
              ))
            )}
          </div>
        ) : (
          <motion.div className="profile-editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="editor-column">
              <h3>I can offer</h3>
              <div className="input-group">
                <input
                  value={newOffer}
                  onChange={(e) => setNewOffer(e.target.value)}
                  placeholder="e.g. React, UX Design"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOffer())}
                />
                <button type="button" className="btn btn-secondary" onClick={addOffer}>
                  Add
                </button>
              </div>
              <ul className="skill-list">
                {profile.offering.map((item, idx) => (
                  <li key={`${item.skill}-${idx}`}>
                    {item.skill}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      aria-label={`Remove ${item.skill}`}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          offering: profile.offering.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="editor-column">
              <h3>I am seeking</h3>
              <div className="input-group">
                <input
                  value={newSeek}
                  onChange={(e) => setNewSeek(e.target.value)}
                  placeholder="e.g. Backend, Marketing"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSeek())}
                />
                <button type="button" className="btn btn-secondary" onClick={addSeek}>
                  Add
                </button>
              </div>
              <ul className="skill-list">
                {profile.seeking.map((item, idx) => (
                  <li key={`${item.skill}-${idx}`}>
                    {item.skill}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      aria-label={`Remove ${item.skill}`}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          seeking: profile.seeking.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" className="btn btn-primary save-btn" onClick={handleSaveProfile}>
              Save profile
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
