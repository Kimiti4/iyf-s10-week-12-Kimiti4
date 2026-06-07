/**
 * 🎯 Skill Match Card - Show recommended skill partners
 */

import { motion } from 'framer-motion'
import { SKILL_CATEGORIES } from '../models/SkillMatch'

const SkillMatchCard = ({ match, onConnect }) => {
  const category = SKILL_CATEGORIES.find(c => c.id === match.offering?.[0]?.category) || 
    { emoji: '🎯', label: 'General' }

  return (
    <motion.div
      className="skill-match-card"
      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)' }}
    >
      <div className="match-header">
        <div className="match-avatar">
          {match.offering?.[0]?.skill?.charAt(0) || '🎯'}
        </div>
        <div className="match-info">
          <h4>{match.offering?.map(s => s.skill).join(', ') || 'Skills Available'}</h4>
          <p>Matches your need: {match.seeking?.map(s => s.skill).join(', ') || 'Your skills'}</p>
        </div>
        <div className="match-score">
          <span>{Math.round(match.matchScore * 100)}%</span>
        </div>
      </div>

      <div className="match-skills">
        <div className="offer-section">
          <strong>They offer:</strong>
          {match.offering?.map((skill, idx) => (
            <span key={idx} className="skill-tag">{skill.skill} ⭐{skill.proficiency}</span>
          ))}
        </div>
        <div className="seek-section">
          <strong>You offer:</strong>
          {match.seeking?.map((skill, idx) => (
            <span key={idx} className="skill-tag your-skill">{skill.skill} ⭐{skill.proficiency}</span>
          ))}
        </div>
      </div>

      <div className="match-footer">
        <span>💌 {match.testimonials} testimonials</span>
        <motion.button
          className="btn-connect"
          onClick={() => onConnect(match.userId)}
          whileHover={{ scale: 1.05 }}
        >
          Connect 🤝
        </motion.button>
      </div>
    </motion.div>
  )
}

export default SkillMatchCard