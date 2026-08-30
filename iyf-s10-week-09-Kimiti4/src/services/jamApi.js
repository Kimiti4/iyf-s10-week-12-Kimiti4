/**
 * JamiiLink Jam API Service
 *
 * Handles all Jam-related HTTP requests. Follows the existing api.js
 * pattern: each domain object is a collection of named functions that
 * return the result of the shared `request()` helper.
 *
 * @module services/jamApi
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error('Session expired. Please login again.');
  }

  if (response.status === 403) {
    throw new Error('You do not have permission to perform this action.');
  }

  if (response.status === 404) {
    throw new Error('Jam not found.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};

// ===== JAMS API =====

export const jamsAPI = {
  /**
   * Get active Jams for the discovery feed.
   * @param {Object} params - { category, location, page, limit, sort }
   */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single Jam by ID.
   * @param {string} id - Jam ID
   */
  getById: (id) => request(`/jams/${id}`),

  /**
   * Create a new Jam.
   * @param {Object} jamData - { title, description, prompt, participationTypes, category, location, deadline, coverMediaUrl, tags }
   */
  create: (jamData) =>
    request('/jams', {
      method: 'POST',
      body: JSON.stringify(jamData),
    }),

  /**
   * Update an existing Jam (host only).
   * @param {string} id - Jam ID
   * @param {Object} jamData - Fields to update
   */
  update: (id, jamData) =>
    request(`/jams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jamData),
    }),

  /**
   * Delete a Jam (host only, draft/archived only).
   * @param {string} id - Jam ID
   */
  delete: (id) =>
    request(`/jams/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Transition a Jam to a new status (host only).
   * @param {string} id - Jam ID
   * @param {string} status - Target status
   */
  transition: (id, status) =>
    request(`/jams/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  /**
   * Get Jams created by a specific user.
   * @param {string} userId - User ID
   * @param {Object} params - { status, page, limit }
   */
  getByCreator: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/creator/${userId}${query ? `?${query}` : ''}`);
  },

  /**
   * Get Jams the current user has joined.
   * @param {Object} params - { page, limit }
   */
  getMyJams: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/mine${query ? `?${query}` : ''}`);
  },

  /**
   * Search Jams by title, description, or tags.
   * @param {string} query - Search term
   * @param {Object} filters - { category, status, location }
   */
  search: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return request(`/jams/search?${queryString}`);
  },

  /**
   * Get trending Jams.
   * @param {Object} params - { limit, timeframe }
   */
  getTrending: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/trending${query ? `?${query}` : ''}`);
  },
};

// ===== PARTICIPATION API =====

export const participationAPI = {
  /**
   * Join a Jam.
   * @param {string} jamId - Jam ID
   */
  join: (jamId) =>
    request(`/jams/${jamId}/participants`, {
      method: 'POST',
    }),

  /**
   * Leave a Jam.
   * @param {string} jamId - Jam ID
   */
  leave: (jamId) =>
    request(`/jams/${jamId}/participants`, {
      method: 'DELETE',
    }),

  /**
   * Get participants of a Jam.
   * @param {string} jamId - Jam ID
   * @param {Object} params - { page, limit }
   */
  getParticipants: (jamId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/${jamId}/participants${query ? `?${query}` : ''}`);
  },

  /**
   * Check if the current user has joined a Jam.
   * @param {string} jamId - Jam ID
   */
  checkMembership: (jamId) => request(`/jams/${jamId}/participants/me`),
};

// ===== CONTRIBUTION API =====

export const contributionAPI = {
  /**
   * Submit a contribution to a Jam.
   * @param {string} jamId - Jam ID
   * @param {Object} contributionData - { type, contentUrl, textContent, location }
   */
  create: (jamId, contributionData) =>
    request(`/jams/${jamId}/contributions`, {
      method: 'POST',
      body: JSON.stringify(contributionData),
    }),

  /**
   * Get contributions for a Jam.
   * @param {string} jamId - Jam ID
   * @param {Object} params - { type, status, page, limit, sort }
   */
  getByJam: (jamId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/${jamId}/contributions${query ? `?${query}` : ''}`);
  },

  /**
   * Get the current user's contributions to a Jam.
   * @param {string} jamId - Jam ID
   */
  getMyContributions: (jamId) =>
    request(`/jams/${jamId}/contributions/mine`),

  /**
   * Delete a contribution (contributor only).
   * @param {string} jamId - Jam ID
   * @param {string} contributionId - Contribution ID
   */
  delete: (jamId, contributionId) =>
    request(`/jams/${jamId}/contributions/${contributionId}`, {
      method: 'DELETE',
    }),

  /**
   * Feature a contribution (host only).
   * @param {string} jamId - Jam ID
   * @param {string} contributionId - Contribution ID
   */
  feature: (jamId, contributionId) =>
    request(`/jams/${jamId}/contributions/${contributionId}/feature`, {
      method: 'POST',
    }),
};

// ===== REACTION API =====

export const reactionAPI = {
  /**
   * Vote/react on a contribution.
   * @param {string} contributionId - Contribution ID
   * @param {string} type - 'upvote'|'downvote'|'fire'|'clap'|'love'
   */
  react: (contributionId, type) =>
    request(`/contributions/${contributionId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  /**
   * Remove a reaction.
   * @param {string} contributionId - Contribution ID
   */
  removeReaction: (contributionId) =>
    request(`/contributions/${contributionId}/reactions`, {
      method: 'DELETE',
    }),

  /**
   * Get reactions for a contribution.
   * @param {string} contributionId - Contribution ID
   */
  getReactions: (contributionId) =>
    request(`/contributions/${contributionId}/reactions`),
};

// ===== LEADERBOARD API =====

export const leaderboardAPI = {
  /**
   * Get the leaderboard for a Jam.
   * @param {string} jamId - Jam ID
   * @param {Object} params - { limit }
   */
  getLeaderboard: (jamId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/${jamId}/leaderboard${query ? `?${query}` : ''}`);
  },

  /**
   * Get the current user's position on the leaderboard.
   * @param {string} jamId - Jam ID
   */
  getMyPosition: (jamId) => request(`/jams/${jamId}/leaderboard/me`),
};

// ===== JAM EVENTS (emitted by the Jam engine) =====

/**
 * Event types that other systems can subscribe to.
 * These are not API endpoints — they define the event contract
 * for the Jam engine's event bus.
 */
export const JAM_EVENTS = {
  JAM_CREATED: 'jam:created',
  JAM_STARTED: 'jam:started',
  JAM_ENDED: 'jam:ended',
  JAM_ARCHIVED: 'jam:archived',
  PARTICIPANT_JOINED: 'jam:participant:joined',
  PARTICIPANT_LEFT: 'jam:participant:left',
  CONTRIBUTION_CREATED: 'jam:contribution:created',
  CONTRIBUTION_FEATURED: 'jam:contribution:featured',
  CONTRIBUTION_REJECTED: 'jam:contribution:rejected',
  REACTION_ADDED: 'jam:reaction:added',
  REACTION_REMOVED: 'jam:reaction:removed',
};

// ===== DEFAULT EXPORT =====

export default {
  jams: jamsAPI,
  participation: participationAPI,
  contribution: contributionAPI,
  reaction: reactionAPI,
  leaderboard: leaderboardAPI,
  EVENTS: JAM_EVENTS,
};
