/**
 * 🔹 Tiannara AI Moderation Service
 * Integrates with Tiannara Core for content moderation.
 *
 * R3 [P1-4]: FAIL-CLOSED. A moderation-service failure (transport error,
 * non-2xx, malformed payload) THROWS a typed error instead of returning a
 * fabricated `{ safe: true }`. Callers must handle the throw explicitly
 * (postsControllerPG.createPost returns 503 without creating the post).
 * No synthetic success is ever manufactured here.
 */

const TIANNARA_API_URL = process.env.TIANNARA_API_URL || 'http://localhost:8000';

class TiannaraUnavailableError extends Error {
  constructor(message, cause = null) {
    super(message);
    this.name = 'TiannaraUnavailableError';
    this.code = 'MODERATION_UNAVAILABLE';
    this.statusCode = 503;
    if (cause) this.cause = cause;
  }
}

class TiannaraService {
  /**
   * Moderate content before publication
   * @param {string} content - Text content to analyze
   * @returns {Promise<Object>} Moderation result
   * @throws {TiannaraUnavailableError} when the service cannot be reached,
   *   returns non-2xx, or returns a malformed payload
   */
  async moderateContent(content) {
    let response;
    try {
      response = await fetch(`${TIANNARA_API_URL}/api/v1/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
    } catch (error) {
      throw new TiannaraUnavailableError(
        'Moderation service unreachable', error.message);
    }

    if (!response.ok) {
      throw new TiannaraUnavailableError(
        `Moderation API error: ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new TiannaraUnavailableError(
        'Moderation API returned malformed data', error.message);
    }

    if (typeof result.safe !== 'boolean') {
      throw new TiannaraUnavailableError(
        'Moderation API returned malformed data: missing safe flag');
    }

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
    let response;
    try {
      response = await fetch(`${TIANNARA_API_URL}/api/v1/moderate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents })
      });
    } catch (error) {
      throw new TiannaraUnavailableError(
        'Batch moderation service unreachable', error.message);
    }

    if (!response.ok) {
      throw new TiannaraUnavailableError(
        `Batch moderation API error: ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new TiannaraUnavailableError(
        'Batch moderation API returned malformed data', error.message);
    }
    return result.results || [];
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
module.exports.TiannaraUnavailableError = TiannaraUnavailableError;
