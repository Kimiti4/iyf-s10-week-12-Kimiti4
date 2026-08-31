/**
 * Jam API Service
 *
 * @module services/jamApi
 */

import { request } from './apiClient';

export const jamsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/jams/${id}`),

  create: (jamData) =>
    request('/jams', { method: 'POST', body: JSON.stringify(jamData) }),

  update: (id, jamData) =>
    request(`/jams/${id}`, { method: 'PUT', body: JSON.stringify(jamData) }),

  delete: (id) =>
    request(`/jams/${id}`, { method: 'DELETE' }),

  transition: (id, status) =>
    request(`/jams/${id}/transition`, { method: 'POST', body: JSON.stringify({ status }) }),

  getByCreator: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/creator/${userId}${query ? `?${query}` : ''}`);
  },

  getMyJams: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/mine${query ? `?${query}` : ''}`);
  },

  search: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return request(`/jams/search?${queryString}`);
  },

  getTrending: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/trending${query ? `?${query}` : ''}`);
  },
};

export const participationAPI = {
  join: (jamId) =>
    request(`/jams/${jamId}/participants`, { method: 'POST' }),

  leave: (jamId) =>
    request(`/jams/${jamId}/participants`, { method: 'DELETE' }),

  getParticipants: (jamId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/${jamId}/participants${query ? `?${query}` : ''}`);
  },

  checkMembership: (jamId) => request(`/jams/${jamId}/participants/me`),
};

export const contributionAPI = {
  create: (jamId, contributionData) =>
    request(`/jams/${jamId}/contributions`, {
      method: 'POST',
      body: JSON.stringify(contributionData),
    }),

  getByJam: (jamId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/${jamId}/contributions${query ? `?${query}` : ''}`);
  },

  getMyContributions: (jamId) =>
    request(`/jams/${jamId}/contributions/mine`),

  delete: (jamId, contributionId) =>
    request(`/jams/${jamId}/contributions/${contributionId}`, { method: 'DELETE' }),

  feature: (jamId, contributionId) =>
    request(`/jams/${jamId}/contributions/${contributionId}/feature`, { method: 'POST' }),
};

export const reactionAPI = {
  react: (contributionId, type) =>
    request(`/contributions/${contributionId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  removeReaction: (contributionId) =>
    request(`/contributions/${contributionId}/reactions`, { method: 'DELETE' }),

  getReactions: (contributionId) =>
    request(`/contributions/${contributionId}/reactions`),
};

export const leaderboardAPI = {
  getLeaderboard: (jamId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/${jamId}/leaderboard${query ? `?${query}` : ''}`);
  },

  getMyPosition: (jamId) => request(`/jams/${jamId}/leaderboard/me`),
};

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

export default {
  jams: jamsAPI,
  participation: participationAPI,
  contribution: contributionAPI,
  reaction: reactionAPI,
  leaderboard: leaderboardAPI,
  EVENTS: JAM_EVENTS,
};
