/**
 * J-019: Analytics API Service
 *
 * Handles all analytics-related API calls.
 * Falls back to mock data when backend is unavailable.
 */

import { request } from './apiClient';

/**
 * Content Propagation Analytics
 */

export async function getContentPropagation(contentId) {
  try {
    return await request(`/analytics/propagation/${contentId}`);
  } catch {
    return {
      contentId,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      reposts: 0,
      remixes: 0,
      saves: 0,
      engagementRate: 0,
      viralityScore: 0,
      propagationDepth: 0,
      topReferrers: [],
      timeSeries: [],
    };
  }
}

export async function getContentTimeSeries(contentId, { range = 'week', granularity = 'day' } = {}) {
  try {
    const params = new URLSearchParams({ range, granularity }).toString();
    return await request(`/analytics/propagation/${contentId}/timeseries?${params}`);
  } catch {
    return generateMockTimeSeries(range, granularity);
  }
}

/**
 * Participation Analytics (Jams)
 */

export async function getJamParticipation(jamId) {
  try {
    return await request(`/analytics/jams/${jamId}/participation`);
  } catch {
    return {
      jamId,
      totalMembers: 0,
      activeMembers: 0,
      contributions: 0,
      joinRate: 0,
      retentionRate: 0,
      avgTimeToContribute: 0,
      topContributors: [],
      participationTimeline: [],
    };
  }
}

export async function getJamLeaderboard(jamId, { limit = 10 } = {}) {
  try {
    const params = new URLSearchParams({ limit: String(limit) }).toString();
    return await request(`/analytics/jams/${jamId}/leaderboard?${params}`);
  } catch {
    return [];
  }
}

/**
 * Creator Analytics
 */

export async function getCreatorStats(userId) {
  try {
    return await request(`/analytics/creators/${userId}/stats`);
  } catch {
    return {
      userId,
      totalPosts: 0,
      totalReels: 0,
      totalJams: 0,
      totalViews: 0,
      totalEngagement: 0,
      avgEngagementRate: 0,
      followerGrowth: 0,
      topContent: [],
      contentMix: { posts: 0, reels: 0, jams: 0 },
    };
  }
}

export async function getCreatorTimeSeries(userId, { range = 'month', metric = 'engagement' } = {}) {
  try {
    const params = new URLSearchParams({ range, metric }).toString();
    return await request(`/analytics/creators/${userId}/timeseries?${params}`);
  } catch {
    return generateMockTimeSeries(range, 'day');
  }
}

/**
 * Platform-wide Analytics
 */

export async function getPlatformTrends({ range = 'week' } = {}) {
  try {
    const params = new URLSearchParams({ range }).toString();
    return await request(`/analytics/platform/trends?${params}`);
  } catch {
    return {
      topHashtags: [],
      topTopics: [],
      peakHours: [],
      activeUsers: 0,
      contentCreated: 0,
      avgSessionDuration: 0,
    };
  }
}

export async function getLeaderboard({ type = 'engagement', range = 'week', limit = 20 } = {}) {
  try {
    const params = new URLSearchParams({ type, range, limit: String(limit) }).toString();
    return await request(`/analytics/leaderboard?${params}`);
  } catch {
    return [];
  }
}

/**
 * Mock data generators for offline/dev mode
 */

function generateMockTimeSeries(range) {
  const points = [];
  const now = Date.now();
  const pointCount = range === 'day' ? 24 : range === 'week' ? 7 : 30;
  const stepMs = range === 'day'
    ? 3600000
    : range === 'week'
      ? 86400000
      : 86400000 * 30 / pointCount;

  for (let i = pointCount; i >= 0; i--) {
    points.push({
      timestamp: new Date(now - i * stepMs).toISOString(),
      views: Math.floor(Math.random() * 1000),
      engagement: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
    });
  }

  return points;
}
