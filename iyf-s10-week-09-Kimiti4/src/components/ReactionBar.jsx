/**
 *  Post Reactions Component
 * Facebook-style reaction emojis (❤️😂😮😢😡) with counters and animations
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReactionBar.css';

const REACTIONS = [
  { emoji: '❤️', name: 'love', color: '#ff4757' },
  { emoji: '😂', name: 'haha', color: '#ffa502' },
  { emoji: '😮', name: 'wow', color: '#7bed9f' },
  { emoji: '😢', name: 'sad', color: '#70a1ff' },
  { emoji: '😡', name: 'angry', color: '#ff4757' }
];

export default function ReactionBar({ post, currentUser }) {
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState(post.reactions || {});
  const [totalReactions, setTotalReactions] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Calculate total reactions and find user's reaction
    const counts = {};
    let total = 0;
    let myReaction = null;

    Object.entries(reactionCounts).forEach(([name, data]) => {
      counts[name] = data.count;
      total += data.count;
      if (data.users?.includes(currentUser?._id)) {
        myReaction = name;
      }
    });

    setReactionCounts(counts);
    setTotalReactions(total);
    setUserReaction(myReaction);
  }, [reactionCounts, currentUser]);

  const handleReactionClick = async (reactionName) => {
    // If clicking the same reaction, remove it
    if (userReaction === reactionName) {
      await removeReaction(reactionName);
    } else {
      // Remove old reaction if exists
      if (userReaction) {
        await removeReaction(userReaction);
      }
      // Add new reaction
      await addReaction(reactionName);
    }
    setShowReactions(false);
  };

  const addReaction = async (reactionName) => {
    try {
      // Optimistic update
      setReactionCounts(prev => ({
        ...prev,
        [reactionName]: (prev[reactionName] || 0) + 1
      }));
      setTotalReactions(prev => prev + 1);
      setUserReaction(reactionName);

      // API call to backend
      const response = await fetch(`/api/posts/${post._id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: reactionName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      // Revert on error
      setReactionCounts(prev => ({
        ...prev,
        [reactionName]: Math.max(0, (prev[reactionName] || 1) - 1)
      }));
    }
  };

  const removeReaction = async (reactionName) => {
    try {
      // Optimistic update
      setReactionCounts(prev => {
        const newCounts = { ...prev };
        newCounts[reactionName] = Math.max(0, (newCounts[reactionName] || 1) - 1);
        if (newCounts[reactionName] === 0) delete newCounts[reactionName];
        return newCounts;
      });
      setTotalReactions(prev => Math.max(0, prev - 1));
      setUserReaction(null);

      // API call to backend
      const response = await fetch(`/api/posts/${post._id}/reactions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: reactionName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove reaction');
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 300);
  };

  const getReactionSummary = () => {
    if (totalReactions === 0) return null;

    const activeReactions = Object.entries(reactionCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return activeReactions.map(([name]) => {
      const reaction = REACTIONS.find(r => r.name === name);
      return reaction?.emoji;
    }).join(' ');
  };

  return (
    <div className="reaction-bar-container" ref={containerRef}>
      {/* Reaction Summary */}
      {totalReactions > 0 && (
        <div className="reaction-summary">
          <span className="reaction-emojis">{getReactionSummary()}</span>
          <span className="reaction-count">{totalReactions}</span>
        </div>
      )}

      {/* Reaction Button */}
      <div className="reaction-trigger">
        <motion.button
          className={`reaction-button ${userReaction ? 'has-reaction' : ''}`}
          onDoubleClick={handleMouseEnter}
          onMouseEnter={handleMouseEnter}
          whileTap={{ scale: 0.9 }}
        >
          {userReaction ? (
            REACTIONS.find(r => r.name === userReaction)?.emoji
          ) : (
            '👍'
          )}
          <span className="reaction-label">
            {userReaction ? 'Reacted' : 'Like'}
          </span>
        </motion.button>

        {/* Reaction Picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              className="reaction-picker"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {REACTIONS.map((reaction, index) => (
                <motion.button
                  key={reaction.name}
                  className={`reaction-option ${userReaction === reaction.name ? 'selected' : ''}`}
                  onClick={() => handleReactionClick(reaction.name)}
                  whileHover={{ scale: 1.4, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  title={reaction.name}
                >
                  <span className="reaction-emoji">{reaction.emoji}</span>
                  <motion.div 
                    className="reaction-count-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: reactionCounts[reaction.name] > 0 ? 1 : 0 }}
                  >
                    {reactionCounts[reaction.name] || 0}
                  </motion.div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reaction Count Display */}
      {totalReactions > 0 && (
        <div className="reaction-breakdown">
          {Object.entries(reactionCounts)
            .filter(([_, count]) => count > 0)
            .map(([name, count]) => {
              const reaction = REACTIONS.find(r => r.name === name);
              return (
                <motion.span
                  key={name}
                  className={`reaction-breakdown-item ${userReaction === name ? 'active' : ''}`}
                  whileHover={{ scale: 1.05 }}
                >
                  {reaction?.emoji} {count}
                </motion.span>
              );
            })}
        </div>
      )}
    </div>
  );
}
