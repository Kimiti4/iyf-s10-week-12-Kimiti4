import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import SkillMatchCard from '../components/SkillMatchCard';
import { useToast } from '../components/Toast';
import './SkillExchange.css';

export default function SkillExchange() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [profile, setProfile] = useState({ offering: [], seeking: [] });
  const [loading, setLoading] = useState(true);

  const [newOffer, setNewOffer] = useState('');
  const [newSeek, setNewSeek] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, matchRes] = await Promise.all([
        api.skills.getProfile(),
        api.skills.getMatches()
      ]);
      if (profRes.data) setProfile(profRes.data);
      if (matchRes.data) setMatches(matchRes.data);
    } catch {
      // Fetch data failed silently
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
      toast.success('Profile updated! We will recalculate your matches.');
      fetchData();
    } catch {
      // Save profile failed silently
    }
  };

  const addOffer = () => {
    if (newOffer.trim()) {
      setProfile({ ...profile, offering: [...profile.offering, { skill: newOffer.trim() }] });
      setNewOffer('');
    }
  };

  const addSeek = () => {
    if (newSeek.trim()) {
      setProfile({ ...profile, seeking: [...profile.seeking, { skill: newSeek.trim() }] });
      setNewSeek('');
    }
  };

  return (
    <div className="skill-exchange-page">
      <div className="header-section">
        <h1>🤝 #DevSwapKE</h1>
        <p>Exchange skills. Build reputation. Grow together.</p>
        
        <div className="tabs">
          <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>
            Smart Matches
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            My Profile
          </button>
        </div>
      </div>

      <div className="content-section">
        {loading ? (
          <div>Loading...</div>
        ) : activeTab === 'matches' ? (
          <div className="matches-grid">
            {matches.length === 0 ? (
              <p>No perfect matches right now. Try updating your profile or seeking more generic skills like 'React' or 'Design'.</p>
            ) : (
              matches.map(match => (
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
              <h3>I can offer:</h3>
              <div className="input-group">
                <input 
                  value={newOffer} 
                  onChange={(e) => setNewOffer(e.target.value)} 
                  placeholder="e.g. React, UX Design"
                />
                <button onClick={addOffer}>Add</button>
              </div>
              <ul className="skill-list">
                {profile.offering.map((item, idx) => (
                  <li key={idx}>
                    {item.skill} 
                    <button onClick={() => setProfile({...profile, offering: profile.offering.filter((_, i) => i !== idx)})}>x</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="editor-column">
              <h3>I am seeking:</h3>
              <div className="input-group">
                <input 
                  value={newSeek} 
                  onChange={(e) => setNewSeek(e.target.value)} 
                  placeholder="e.g. Backend API, Marketing"
                />
                <button onClick={addSeek}>Add</button>
              </div>
              <ul className="skill-list">
                {profile.seeking.map((item, idx) => (
                  <li key={idx}>
                    {item.skill}
                    <button onClick={() => setProfile({...profile, seeking: profile.seeking.filter((_, i) => i !== idx)})}>x</button>
                  </li>
                ))}
              </ul>
            </div>

            <button className="btn-primary save-btn" onClick={handleSaveProfile}>Save Profile</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
