import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '../utils/logger';
import './TiannaraAssistant.css';

/**
 *  Tiannara AI Assistant Component
 * Provides mental health support, fact-checking, and content moderation
 */

const FEATURES = [
  {
    id: 'mental_health',
    icon: '',
    name: 'Mental Health Support',
    description: '24/7 emotional support and crisis resources',
    color: '#8b5cf6'
  },
  {
    id: 'fact_check',
    icon: '',
    name: 'Fact Checking',
    description: 'Verify information and detect misinformation',
    color: '#3b82f6'
  },
  {
    id: 'content_moderation',
    icon: '',
    name: 'Content Moderation',
    description: 'AI-powered safety and community guidelines',
    color: '#10b981'
  },
  {
    id: 'crisis_support',
    icon: '',
    name: 'Crisis Intervention',
    description: 'Immediate help for urgent situations',
    color: '#ef4444'
  }
];

export default function TiannaraAssistant({ currentUser }) {
  const [activeFeature, setActiveFeature] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    try {
      const apiEndpoint = activeFeature === 'mental_health' 
        ? '/api/tiannara/mental-health'
        : activeFeature === 'fact_check'
        ? '/api/tiannara/fact-check'
        : '/api/tiannara/moderate';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: currentUser?._id })
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      logger.error('Tiannara error:', error);
      setResponse({
        success: false,
        message: 'Unable to connect. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tiannara-assistant">
      {/* Header */}
      <motion.div 
        className="tiannara-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="tiannara-logo">
          <span className="logo-icon"></span>
          <h2>Tiannara AI</h2>
          <span className="ai-badge">AI Powered</span>
        </div>
        <p className="tagline">Your trusted companion for a safer, healthier community</p>
      </motion.div>

      {/* Feature Selection */}
      <div className="features-grid">
        {FEATURES.map((feature) => (
          <motion.button
            key={feature.id}
            className={`feature-card ${activeFeature === feature.id ? 'active' : ''}`}
            onClick={() => setActiveFeature(feature.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              borderColor: activeFeature === feature.id ? feature.color : 'transparent'
            }}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.name}</h3>
            <p>{feature.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Chat Interface */}
      <AnimatePresence>
        {activeFeature && (
          <motion.div
            className="chat-interface"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="chat-messages">
              {response && (
                <motion.div
                  className="message ai-message"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="message-avatar"></span>
                  <div className="message-content">
                    <p>{response.message}</p>
                    {response.resources && (
                      <div className="resources">
                        <h4>Helpful Resources:</h4>
                        <ul>
                          {response.resources.map((resource, idx) => (
                            <li key={idx}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {response.factCheck && (
                      <div className={`fact-check-result ${response.factCheck.verdict}`}>
                        <strong>Verdict:</strong> {response.factCheck.verdict}
                        <p>{response.factCheck.explanation}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="chat-input-area">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  activeFeature === 'mental_health'
                    ? "How are you feeling today? Share your thoughts..."
                    : activeFeature === 'fact_check'
                    ? "Paste text or claim to verify..."
                    : "Describe content to moderate..."
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <motion.button
                className="send-button"
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  ''
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crisis Hotline Banner */}
      <motion.div
        className="crisis-banner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="crisis-icon"></span>
        <div className="crisis-info">
          <strong>Need Immediate Help?</strong>
          <p>National Suicide Prevention Hotline: <a href="tel:1199">1199</a></p>
          <p>Mental Health Foundation Kenya: <a href="tel:+254722444555">+254 722 444 555</a></p>
        </div>
      </motion.div>
    </div>
  );
}
