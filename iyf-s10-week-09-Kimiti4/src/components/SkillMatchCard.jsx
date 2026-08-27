import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from './Toast';
import './SkillMatchCard.css';

export default function SkillMatchCard({ match, onComplete }) {
  const toast = useToast();

  const handleConnect = async () => {
    try {
      // Mock initiating a chat/connection
      toast.success(`Connection request sent to ${match.user.name}!`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplete = async () => {
    try {
      await api.skills.completeExchange(match.match_id, {
        quality_rating: 5,
        testimonial: "Great exchange!"
      });
      toast.success('Exchange completed!');
      if (onComplete) onComplete(match.match_id);
    } catch (error) {
      console.error('Failed to complete exchange:', error);
      toast.error('Failed to complete exchange');
    }
  };

  return (
    <motion.div 
      className="skill-match-card"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="match-header">
        <div className="match-user-info">
          <div className="avatar">{match.user.avatar || '👤'}</div>
          <div>
            <h4>{match.user.name}</h4>
            <span className="match-score">{(match.match_score * 100).toFixed(0)}% Match</span>
          </div>
        </div>
      </div>

      <div className="match-details">
        <div className="skill-group">
          <strong>They need:</strong>
          <div className="tags">
            {match.your_skills_they_need.map(skill => (
              <span key={skill} className="skill-tag match-tag">{skill}</span>
            ))}
          </div>
        </div>
        
        <div className="skill-group">
          <strong>They offer:</strong>
          <div className="tags">
            {match.their_skills.map(skill => (
              <span key={skill} className="skill-tag offer-tag">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="match-actions">
        <button className="btn-secondary" onClick={handleConnect}>Connect</button>
        <button className="btn-primary" onClick={handleComplete}>Mark Completed</button>
      </div>
    </motion.div>
  );
}