/**
 * 🔹 Tiannara AI Moderation Service
 * Integrates with Tiannara Core for content moderation
 * Provides graceful degradation if service is unavailable
 */

const TIANNARA_API_URL = process.env.TIANNARA_API_URL || 'http://localhost:8000';

class TiannaraService {
  /**
   * Moderate content before publication
   * @param {string} content - Text content to analyze
   * @returns {Promise<Object>} Moderation result
   */
  async moderateContent(content) {
    try {
      const response = await fetch(`${TIANNARA_API_URL}/api/v1/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error(`Moderation API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Log moderation decision
      console.log('[TIANNARA MODERATION]', {
        safe: result.safe,
        toxicity: result.toxicity_score,
        spam: result.spam_probability,
        scam: result.scam_probability,
        categories: result.categories_flagged,
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      console.error('Tiannara moderation failed:', error.message);
      
      // Graceful degradation: allow content if service is down
      // In production, you might want to queue for later review
      return {
        safe: true,
        toxicity_score: 0,
        spam_probability: 0,
        scam_probability: 0,
        categories_flagged: [],
        confidence: 0,
        explanation: 'Moderation service unavailable, using fallback'
      };
    }
  }

  /**
   * Check if content should be allowed based on moderation result
   * @param {Object} moderationResult - Result from moderateContent()
   * @returns {boolean} True if content is safe
   */
  isContentSafe(moderationResult) {
    return moderationResult.safe;
  }

  /**
   * Get human-readable reason why content was flagged
   * @param {Object} moderationResult - Result from moderateContent()
   * @returns {string} Explanation
   */
  getFlagReason(moderationResult) {
    if (moderationResult.safe) {
      return 'Content is safe';
    }
    return moderationResult.explanation;
  }

  /**
   * Moderate multiple pieces of content (batch processing)
   * @param {Array<string>} contents - Array of text content to analyze
   * @returns {Promise<Array<Object>>} Array of moderation results
   */
  async moderateBatch(contents) {
    try {
      const response = await fetch(`${TIANNARA_API_URL}/api/v1/moderate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        throw new Error(`Batch moderation API error: ${response.status}`);
      }

      const result = await response.json();
      return result.results || [];
    } catch (error) {
      console.error('Tiannara batch moderation failed:', error.message);
      
      // Fallback: mark all as safe
      return contents.map(content => ({
        safe: true,
        toxicity_score: 0,
        spam_probability: 0,
        scam_probability: 0,
        categories_flagged: [],
        confidence: 0,
        explanation: 'Batch moderation service unavailable'
      }));
    }
  }

  /**
   * Check service health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${TIANNARA_API_URL}/api/v1/moderate/health`);
      
      if (!response.ok) {
        return { status: 'unhealthy', error: `HTTP ${response.status}` };
      }

      const health = await response.json();
      return health;
    } catch (error) {
      return { 
        status: 'unreachable', 
        error: error.message 
      };
    }
  }
}

module.exports = new TiannaraService();
