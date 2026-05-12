/**
 *  Achievement Badges Component
 * Celebrates user milestones with fun animations
 */

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import './AchievementBadge.css';

const BADGES = {
  first_post: { emoji: '', name: 'First Post!', color: '#22c55e', description: 'Welcome to the community!' },
  century_club: { emoji: '💯', name: 'Century Club', color: '#f59e0b', description: '100 likes received!' },
  top_contributor: { emoji: '🏆', name: 'Top Contributor', color: '#eab308', description: 'Most active member!' },
  verified: { emoji: '✓', name: 'Verified', color: '#3b82f6', description: 'Identity verified' },
  helper: { emoji: '🤝', name: 'Community Helper', color: '#8b5cf6', description: 'Helped 10 users!' },
  streak: { emoji: '', name: 'On Fire!', color: '#ef4444', description: '7-day posting streak!' },
  founder: { emoji: '', name: 'Founder', color: '#fbbf24', description: 'Platform creator' },
};

export default function AchievementBadge({ badge, size = 'medium', showCelebration = false }) {
  const badgeData = BADGES[badge.type] || BADGES.first_post;

  const handleEarned = () => {
    if (showCelebration && badge.earned) {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [badgeData.color, '#ffffff', '#ffd700']
      });
    }
  };

  return (
    <motion.div
      className={`achievement-badge badge-${size} ${badge.earned ? 'earned' : 'locked'}`}
      onClick={handleEarned}
      whileHover={{ scale: badge.earned ? 1.05 : 1 }}
      whileTap={{ scale: badge.earned ? 0.95 : 1 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="badge-icon" style={{ 
        backgroundColor: badge.earned ? badgeData.color : 'rgba(148, 163, 184, 0.2)',
        color: badge.earned ? '#ffffff' : '#94a3b8'
      }}>
        {badgeData.emoji}
      </div>

      <div className="badge-info">
        <h4 className="badge-name">{badgeData.name}</h4>
        <p className="badge-description">{badgeData.description}</p>
      </div>

      {badge.earned && (
        <motion.div
          className="badge-earned-indicator"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          ✓
        </motion.div>
      )}

      {/* Glow effect for earned badges */}
      {badge.earned && (
        <motion.div
          className="badge-glow"
          animate={{
            boxShadow: [
              `0 0 5px ${badgeData.color}`,
              `0 0 20px ${badgeData.color}`,
              `0 0 5px ${badgeData.color}`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

export function BadgeGrid({ badges, columns = 3 }) {
  return (
    <div className="badge-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {badges.map((badge, index) => (
        <motion.div
          key={badge.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AchievementBadge badge={badge} />
        </motion.div>
      ))}
    </div>
  );
}
