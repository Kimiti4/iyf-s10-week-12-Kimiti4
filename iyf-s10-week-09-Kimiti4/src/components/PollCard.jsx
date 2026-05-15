/**
 *  Interactive Poll Component
 * Allows users to vote on polls within posts
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import logger from '../utils/logger';
import './PollCard.css';

export default function PollCard({ poll, postId, currentUser }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(
    poll.options.reduce((sum, opt) => sum + opt.votes, 0)
  );

  const handleVote = async (optionId) => {
    if (hasVoted) return;

    try {
      // Optimistic update
      setSelectedOption(optionId);
      setHasVoted(true);
      setTotalVotes(prev => prev + 1);

      // API call
      const response = await fetch(`/api/posts/${postId}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });

      if (!response.ok) {
        throw new Error('Vote failed');
      }
    } catch (error) {
      logger.error('Error voting:', error);
      setSelectedOption(null);
      setHasVoted(false);
    }
  };

  const getVotePercentage = (option) => {
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * 100);
  };

  return (
    <div className="poll-card">
      <div className="poll-header">
        <span className="poll-icon"></span>
        <h3 className="poll-question">{poll.question}</h3>
        <span className="poll-badge">Poll</span>
      </div>

      <div className="poll-options">
        {poll.options.map((option, index) => {
          const percentage = hasVoted ? getVotePercentage(option) : 0;
          const isSelected = selectedOption === option._id || option.selectedByUser;

          return (
            <motion.button
              key={option._id}
              className={`poll-option ${hasVoted ? 'voted' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleVote(option._id)}
              disabled={hasVoted}
              whileHover={!hasVoted ? { scale: 1.02 } : {}}
              whileTap={!hasVoted ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <motion.div
                  className="poll-progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' 
                      : 'rgba(59, 130, 246, 0.1)'
                  }}
                />
              )}

              {/* Option Content */}
              <div className="poll-option-content">
                <span className="poll-option-text">{option.text}</span>
                {hasVoted && (
                  <motion.span
                    className="poll-percentage"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {percentage}%
                  </motion.span>
                )}
              </div>

              {/* Vote Count */}
              {hasVoted && (
                <motion.span
                  className="poll-votes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {option.votes + (isSelected ? 1 : 0)} votes
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="poll-footer">
        <span className="poll-total-votes">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
        </span>
        {hasVoted && (
          <span className="poll-voted-badge">
            ✓ Voted
          </span>
        )}
      </div>
    </div>
  );
}
