/**
 * Jam API service — single frontend boundary for the implemented Jam backend.
 * Keep this surface aligned with src/routes/jams.js. Unsupported endpoints are
 * intentionally absent rather than exposed as dead UI capabilities.
 */
import { request } from './apiClient';

const unwrap = (response, key) => response?.[key] ?? response;

export const jamsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/jams/${id}`),

  create: async (jamData) => {
    const response = await request('/jams', {
      method: 'POST',
      body: JSON.stringify(jamData),
    });
    return unwrap(response, 'jam');
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
};

export const leaderboardAPI = {
  getLeaderboard: (jamId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jams/${jamId}/leaderboard${query ? `?${query}` : ''}`);
  },
};

export default {
  jams: jamsAPI,
  participation: participationAPI,
  contribution: contributionAPI,
  leaderboard: leaderboardAPI,
};
