/**
 * 🔹 Realistic Metrics Generator
 * Creates believable activity metrics using real data patterns
 * Minimizes fake data by leveraging actual user behavior
 */

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Organization = require('../models/Organization');

/**
 * Calculate engagement score based on actual interactions
 * Uses weighted formula for realistic scoring
 */
async function calculateEngagementScore(postId) {
  const post = await Post.findById(postId);
  if (!post) return 0;
  
  // Weight different interactions
  const weights = {
    likes: 1,
    comments: 3,      // Comments worth more than likes
    shares: 5,        // Shares worth most
    saves: 2          // Saves indicate value
  };
  
  const score = 
    (post.likes || 0) * weights.likes +
    (post.comments?.length || 0) * weights.comments +
    (post.shares || 0) * weights.shares +
    (post.saves || 0) * weights.saves;
  
  return score;
}

/**
 * Get trending posts based on recent engagement velocity
 * More realistic than just "most liked"
 */
async function getTrendingPosts(limit = 10, timeWindow = '24h') {
  const now = new Date();
  let since;
  
  switch(timeWindow) {
    case '1h': since = new Date(now - 3600000); break;
    case '6h': since = new Date(now - 21600000); break;
    case '24h': since = new Date(now - 86400000); break;
    case '7d': since = new Date(now - 604800000); break;
    default: since = new Date(now - 86400000);
  }
  
  const posts = await Post.find({
    createdAt: { $gte: since },
    published: true
  })
  .populate('author', 'username profile.verification')
  .sort({ createdAt: -1 })
  .limit(limit * 3);  // Get more to filter
  
  // Calculate engagement velocity (interactions per hour)
  const postsWithVelocity = posts.map(post => {
    const ageInHours = (now - post.createdAt) / 3600000;
    const engagement = calculateEngagementScoreSync(post);
    const velocity = ageInHours > 0 ? engagement / ageInHours : engagement;
    
    return {
      ...post.toObject(),
      engagementVelocity: velocity.toFixed(2),
      ageInHours: ageInHours.toFixed(1)
    };
  });
  
  // Sort by velocity and return top N
  return postsWithVelocity
    .sort((a, b) => b.engagementVelocity - a.engagementVelocity)
    .slice(0, limit);
}

// Synchronous version for already-populated posts
function calculateEngagementScoreSync(post) {
  const weights = {
    likes: 1,
    comments: 3,
    shares: 5,
    saves: 2
  };
  
  return (
    (post.likes || 0) * weights.likes +
    (Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)) * weights.comments +
    (post.shares || 0) * weights.shares +
    (post.saves || 0) * weights.saves
  );
}

/**
 * Generate realistic user activity stats from actual data
 */
async function getUserActivityStats(userId) {
  const [posts, comments, organizations] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Comment.countDocuments({ author: userId }),
    User.findById(userId).select('organizations').then(user => user?.organizations?.length || 0)
  ]);
  
  // Calculate activity level
  const totalActivity = posts + comments;
  let activityLevel = 'new';
  if (totalActivity > 100) activityLevel = 'power_user';
  else if (totalActivity > 50) activityLevel = 'active';
  else if (totalActivity > 10) activityLevel = 'regular';
  else if (totalActivity > 0) activityLevel = 'getting_started';
  
  return {
    posts,
    comments,
    organizations,
    totalActivity,
    activityLevel,
    // Engagement rate (avg interactions per post)
    avgEngagement: posts > 0 ? await getAveragePostEngagement(userId) : 0
  };
}

/**
 * Get average engagement per post for a user
 */
async function getAveragePostEngagement(userId) {
  const posts = await Post.find({ author: userId }).select('likes comments shares saves');
  
  if (posts.length === 0) return 0;
  
  const totalEngagement = posts.reduce((sum, post) => {
    return sum + calculateEngagementScoreSync(post);
  }, 0);
  
  return Math.round(totalEngagement / posts.length);
}

/**
 * Get organization health metrics from real data
 */
async function getOrganizationHealth(orgId) {
  const org = await Organization.findById(orgId);
  if (!org) return null;
  
  const [memberCount, postCount, activeMembers] = await Promise.all([
    User.countDocuments({ organizations: orgId }),
    Post.countDocuments({ organization: orgId }),
    getActiveMembers(orgId, '7d')
  ]);
  
  // Calculate growth rate (compare to last week)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  
  const [recentMembers, previousMembers] = await Promise.all([
    User.countDocuments({ 
      organizations: orgId,
      createdAt: { $gte: oneWeekAgo }
    }),
    User.countDocuments({
      organizations: orgId,
      createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    })
  ]);
  
  const growthRate = previousMembers > 0 
    ? ((recentMembers - previousMembers) / previousMembers * 100).toFixed(1)
    : recentMembers > 0 ? 100 : 0;
  
  // Activity rate (posts per member per week)
  const activityRate = memberCount > 0 
    ? (postCount / memberCount).toFixed(2)
    : 0;
  
  return {
    memberCount,
    postCount,
    activeMembersLastWeek: activeMembers,
    growthRate: parseFloat(growthRate),
    activityRate: parseFloat(activityRate),
    health: calculateOrgHealth(memberCount, activeMembers, postCount, growthRate)
  };
}

/**
 * Count members who posted/commented in time window
 */
async function getActiveMembers(orgId, timeWindow = '7d') {
  const since = new Date(Date.now() - getTimeWindowMs(timeWindow));
  
  const activePosters = await Post.distinct('author', {
    organization: orgId,
    createdAt: { $gte: since }
  });
  
  const activeCommenters = await Comment.aggregate([
    {
      $lookup: {
        from: 'posts',
        localField: 'post',
        foreignField: '_id',
        as: 'postDoc'
      }
    },
    { $unwind: '$postDoc' },
    { $match: { 'postDoc.organization': orgId, createdAt: { $gte: since } } },
    { $group: { _id: '$author' } }
  ]);
  
  // Combine unique active users
  const commenterIds = activeCommenters.map(c => c._id.toString());
  const allActive = new Set([...activePosters.map(id => id.toString()), ...commenterIds]);
  
  return allActive.size;
}

/**
 * Calculate overall organization health score (0-100)
 */
function calculateOrgHealth(members, activeMembers, posts, growthRate) {
  // Factors:
  // - Member engagement rate (40%)
  // - Content volume (30%)
  // - Growth trend (30%)
  
  const engagementRate = members > 0 ? (activeMembers / members) * 100 : 0;
  const contentScore = Math.min(posts / 10 * 100, 100); // Cap at 100 posts
  const growthScore = Math.min(Math.max(growthRate + 50, 0), 100); // Normalize -50% to +50% -> 0-100
  
  const health = (
    engagementRate * 0.4 +
    contentScore * 0.3 +
    growthScore * 0.3
  );
  
  return Math.round(health);
}

/**
 * Get platform-wide statistics from real data
 */
async function getPlatformStats() {
  const [totalUsers, totalPosts, totalComments, totalOrgs, activeToday] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments(),
    Organization.countDocuments(),
    getActiveUsersToday()
  ]);
  
  // Calculate today's growth
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [newUsersToday, newPostsToday] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: today } }),
    Post.countDocuments({ createdAt: { $gte: today } })
  ]);
  
  return {
    totalUsers,
    totalPosts,
    totalComments,
    totalOrganizations: totalOrgs,
    activeUsersToday: activeToday,
    newUsersToday,
    newPostsToday,
    // Derived metrics
    avgPostsPerUser: totalUsers > 0 ? (totalPosts / totalUsers).toFixed(2) : 0,
    avgCommentsPerPost: totalPosts > 0 ? (totalComments / totalPosts).toFixed(2) : 0,
    engagementRatio: totalPosts > 0 ? (totalComments / totalPosts).toFixed(2) : 0
  };
}

/**
 * Count users active today (posted or commented)
 */
async function getActiveUsersToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activePosters = await Post.distinct('author', {
    createdAt: { $gte: today }
  });
  
  const activeCommenters = await Comment.distinct('author', {
    createdAt: { $gte: today }
  });
  
  const allActive = new Set([
    ...activePosters.map(id => id.toString()),
    ...activeCommenters.map(id => id.toString())
  ]);
  
  return allActive.size;
}

/**
 * Helper: Convert time window string to milliseconds
 */
function getTimeWindowMs(window) {
  const windows = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '7d': 604800000,
    '30d': 2592000000
  };
  return windows[window] || 86400000;
}

module.exports = {
  calculateEngagementScore,
  calculateEngagementScoreSync,
  getTrendingPosts,
  getUserActivityStats,
  getAveragePostEngagement,
  getOrganizationHealth,
  getActiveMembers,
  calculateOrgHealth,
  getPlatformStats,
  getActiveUsersToday
};
