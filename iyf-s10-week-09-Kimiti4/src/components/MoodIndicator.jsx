/**
 *  User Mood/Status Indicator
 * Allows users to share their current mood with fun animated emojis
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '../utils/logger';
import './MoodIndicator.css';

const MOODS = [
  { emoji: '😊', name: 'Happy', color: '#22c55e' },
  { emoji: '', name: 'Excited', color: '#f59e0b' },
  { emoji: '😎', name: 'Cool', color: '#3b82f6' },
  { emoji: '😴', name: 'Sleepy', color: '#64748b' },
  { emoji: '', name: 'Grateful', color: '#8b5cf6' },
  { emoji: '😤', name: 'Determined', color: '#ef4444' },
  { emoji: '🥳', name: 'Celebrating', color: '#ec4899' },
  { emoji: '😌', name: 'Peaceful', color: '#14b8a6' },
];

export default function MoodIndicator({ currentUser, mood: initialMood }) {
  const [mood, setMood] = useState(initialMood || null);
  const [showPicker, setShowPicker] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleSelectMood = async (selectedMood) => {
    setMood(selectedMood);
    setShowCelebration(true);
    
    // Trigger celebration animation
    setTimeout(() => setShowCelebration(false), 2000);

    // API call to update user mood
    try {
      await fetch(`/api/users/${currentUser._id}/mood`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood.name })
      });
    } catch (error) {
      logger.error('Error updating mood:', error);
    }
  };

  return (
    <div className="mood-indicator-container">
      {/* Current Mood Display */}
      <div className="mood-display">
        <span className="mood-label">Current Mood:</span>
        <AnimatePresence mode="wait">
          {mood ? (
            <motion.div
              key={mood.name}
              className="mood-badge"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              style={{ backgroundColor: mood.color + '20', borderColor: mood.color }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-name">{mood.name}</span>
            </motion.div>
          ) : (
            <motion.span
              className="mood-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              How are you feeling?
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          className="mood-change-btn"
          onClick={() => setShowPicker(!showPicker)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mood ? 'Change' : 'Set Mood'}
        </motion.button>
      </div>

      {/* Mood Picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            className="mood-picker"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mood-grid">
              {MOODS.map((moodOption, index) => (
                <motion.button
                  key={moodOption.name}
                  className={`mood-option ${mood?.name === moodOption.name ? 'selected' : ''}`}
                  onClick={() => {
                    handleSelectMood(moodOption);
                    setShowPicker(false);
                  }}
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="mood-option-emoji">{moodOption.emoji}</span>
                  <span className="mood-option-name">{moodOption.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && mood && (
          <motion.div
            className="mood-celebration"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <span className="celebration-emoji">{mood.emoji}</span>
            <p className="celebration-text">Feeling {mood.name}!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
