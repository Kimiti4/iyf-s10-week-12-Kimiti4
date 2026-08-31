/**
 * Creator Metrics
 *
 * @module domain/creator/creatorMetrics
 */

export function computeCreatorMetrics(posts, jams, reels) {
  const allContent = [...(posts || []), ...(reels || [])];

  const totalLikes = allContent.reduce((sum, c) => sum + (c.likes || c.likeCount || 0), 0);
  const totalComments = allContent.reduce((sum, c) => sum + (c.comments || c.commentCount || 0), 0);
  const totalViews = allContent.reduce((sum, c) => sum + (c.views || c.viewCount || 0), 0);
  const totalShares = allContent.reduce((sum, c) => sum + (c.shares || c.shareCount || c.reposts || 0), 0);
  const totalJams = (jams || []).length;
  const activeJams = (jams || []).filter((j) => j.status === 'active' || j.status === 'recruiting').length;

  return {
    totalLikes,
    totalComments,
    totalViews,
    totalShares,
    totalPosts: (posts || []).length,
    totalReels: (reels || []).length,
    totalJams,
    activeJams,
    engagementRate: totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1) : '0.0',
  };
}

export function computeTrend(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous * 100).toFixed(1);
}

export function computeTopContent(items, metric = 'likes', limit = 5) {
  return [...items]
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, limit);
}
