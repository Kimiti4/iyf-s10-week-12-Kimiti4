/**
 * 👤 User Profile Page - backed by the real API.
 * /profile -> authenticated user's own profile.
 * /profile/:userId -> another user's public profile + real follow state.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../services/api';
import { postsAPI } from '../services/postApi';
import { request } from '../services/apiClient';
import CreatorStats from '../components/analytics/CreatorStats';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [storyFile, setStoryFile] = useState(null);
  const [storyBusy, setStoryBusy] = useState(false);
  const [profileViews, setProfileViews] = useState(0);
  const [follow, setFollow] = useState({ isFollowing: false, followers: 0, following: 0, isOwnProfile: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followBusy, setFollowBusy] = useState(false);

  const targetId = userId || currentUser?.id;
  const isOwnProfile = !userId || String(currentUser?.id) === String(userId);

  const loadProfile = useCallback(async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [profileRes, followRes, userPosts, likedRes, storiesRes] = await Promise.all([
        usersAPI.getById(targetId),
        usersAPI.getFollowState(targetId),
        postsAPI.getByAuthor(targetId),
        isOwnProfile ? request('/users/likes/me') : Promise.resolve(null),
        request(`/stories/user/${targetId}`)
      ]);
      setUserProfile(profileRes.data || profileRes.user || profileRes);
      setPosts(Array.isArray(userPosts) ? userPosts : (userPosts?.posts || []));
      setLikedPosts(likedRes?.data || []);
      setStories(storiesRes?.data || []);
      if (followRes?.data) {
        setFollow({
          isFollowing: !!followRes.data.isFollowing,
          followers: followRes.data.followers || 0,
          following: followRes.data.following || 0,
          isOwnProfile: !!followRes.data.isOwnProfile
        });
        setProfileViews(followRes.data.profileViews || 0);
      } else {
        setFollow((f) => ({ ...f, isOwnProfile: true }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, [targetId, isOwnProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFollowToggle = async () => {
    if (isOwnProfile || followBusy) return;
    setFollowBusy(true);
    try {
      if (follow.isFollowing) {
        await usersAPI.unfollow(targetId);
        setFollow((f) => ({ ...f, isFollowing: false, followers: Math.max(0, f.followers - 1) }));
      } else {
        await usersAPI.follow(targetId);
        setFollow((f) => ({ ...f, isFollowing: true, followers: f.followers + 1 }));
      }
    } catch (err) {
      setError(err.message || 'Follow action failed');
    } finally {
      setFollowBusy(false);
    }
  };

  const handleCreateStory = async () => {
    if ((!storyText.trim() && !storyFile) || storyBusy) return;
    setStoryBusy(true);
    try {
      let imageUrl = null;
      if (storyFile) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not read file'));
          reader.readAsDataURL(storyFile);
        });
        const up = await request('/uploads', {
          method: 'POST',
          body: JSON.stringify({ filename: storyFile.name, mimeType: storyFile.type, data: dataUrl })
        });
        imageUrl = up.data?.url || null;
        if (!imageUrl) throw new Error('Image upload failed');
      }
      const res = await request('/stories', {
        method: 'POST',
        body: JSON.stringify({ textContent: storyText.trim() || undefined, imageUrl })
      });
      if (res.data) setStories((prev) => [res.data, ...prev]);
      setStoryText('');
      setStoryFile(null);
      setShowStoryModal(false);
    } catch (err) {
      setError(err.message || 'Failed to create story');
    } finally {
      setStoryBusy(false);
    }
  };

  const formatNumber = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  if (loading) {
    return (
      <div className="profile-loading" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <main className="user-profile-page" role="main" aria-label="User profile">
        <div className="profile-error" role="alert">
          <p>{error || 'Profile not found.'}</p>
          <button onClick={loadProfile}>Try again</button>
        </div>
      </main>
    );
  }

  const displayName = userProfile.username || 'Unknown';
  const bio = userProfile.profile?.bio || userProfile.bio || '';
  const location = userProfile.profile?.location
    ? [userProfile.profile.location.county, userProfile.profile.location.settlement].filter(Boolean).join(', ')
    : (userProfile.location_county || '');
  const avatarIcon = userProfile.profile?.avatarIcon || userProfile.avatar_icon || '🦁';
  const isVerified = userProfile.verification?.isVerified || userProfile.verification_is_verified || false;
  const joinedDate = userProfile.createdAt || userProfile.created_at
    ? new Date(userProfile.createdAt || userProfile.created_at).toLocaleDateString([], { year: 'numeric', month: 'long' })
    : '';

  return (
    <main className="user-profile-page" role="main" aria-label="User profile">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          <div className="cover-gradient"></div>
        </div>

        <div className="profile-info">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span>{avatarIcon}</span>
              {isVerified && <div className="verified-badge">✓</div>}
            </div>

            {isOwnProfile ? (
              <button className="btn-edit-profile" onClick={() => navigate('/settings')}>
                Edit Profile
              </button>
            ) : (
              <div className="profile-actions">
                <button
                  className={`btn-follow ${follow.isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                  disabled={followBusy}
                >
                  {follow.isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="btn-message" onClick={() => navigate('/chat')}>
                  Message
                </button>
              </div>
            )}
          </div>

          <div className="profile-details">
            <h1 className="profile-name">{displayName}</h1>
            {bio && <p className="profile-bio">{bio}</p>}

            <div className="profile-meta">
              {location && <span className="meta-item">📍 {location}</span>}
              {joinedDate && <span className="meta-item">📅 Joined {joinedDate}</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{formatNumber(posts.length)}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(follow.followers)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(follow.following)}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(profileViews)}</span>
              <span className="stat-label">Profile Views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Analytics (own profile only) */}
      {isOwnProfile && <CreatorStats userId={targetId} compact />}

      {/* Stories Section */}
      <div className="stories-section">
        <h3 className="section-title">Stories</h3>
        <div className="stories-container">
          {isOwnProfile && (
            <div className="story-item add-story" onClick={() => setShowStoryModal(true)}>
              <div className="story-avatar add-story-avatar">+</div>
              <span>Add Story</span>
            </div>
          )}
          {stories.length === 0 && !isOwnProfile && (
            <p className="stories-empty">No active stories.</p>
          )}
          {stories.map((story) => (
            <motion.div
              key={story.id}
              className="story-item"
              whileHover={{ scale: 1.05 }}
            >
              {story.image_url ? (
                <img src={story.image_url} alt="Story" />
              ) : (
                <div className="story-text">{story.text_content}</div>
              )}
              <div className="story-overlay">
                <span>{story.created_at ? new Date(story.created_at).toLocaleDateString() : ''}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
           Posts
        </button>
        {isOwnProfile && (
          <button
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            ❤️ Liked (Private)
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          ℹ️ About
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              className="posts-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {posts.length === 0 ? (
                <div className="profile-empty">
                  <p>No posts yet.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="post-card"
                    whileHover={{ y: -5 }}
                  >
                    <div className="post-content">
                      <p>{post.content}</p>
                      <div className="post-stats">
                        <span>❤️ {post.likes ?? 0}</span>
                        <span>💬 {post.commentCount ?? post.comments ?? 0}</span>
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'liked' && isOwnProfile && (
            <motion.div
              key="liked"
              className="liked-posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="privacy-notice">
                🔒 These posts are only visible to you
              </div>
              {likedPosts.length === 0 ? (
                <div className="profile-empty">
                  <p>No liked posts yet.</p>
                </div>
              ) : (
                likedPosts.map((post) => (
                  <div key={post.id} className="liked-post-card">
                    <p>{post.content}</p>
                    <div className="post-stats">
                      <span>❤️ {post.likes ?? 0}</span>
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              className="about-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="about-card">
                <h3>About {displayName}</h3>
                {bio && <p className="about-bio">{bio}</p>}
                <div className="about-details">
                  {location && (
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>Location: {location}</span>
                    </div>
                  )}
                  {joinedDate && (
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>Joined: {joinedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Story Modal */}
      <AnimatePresence>
        {showStoryModal && (
          <motion.div
            className="story-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStoryModal(false)}
          >
            <motion.div
              className="story-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Add New Story</h3>
              <div className="story-upload-area">
                <textarea
                  placeholder="Share a moment (expires in 24h)..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  aria-label="Attach a photo"
                  onChange={(e) => setStoryFile(e.target.files?.[0] || null)}
                />
                <button
                  className="btn-upload"
                  onClick={handleCreateStory}
                  disabled={(!storyText.trim() && !storyFile) || storyBusy}
                >
                  {storyBusy ? 'Sharing…' : 'Share Story'}
                </button>
              </div>
              <button className="btn-close-modal" onClick={() => setShowStoryModal(false)}>
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default UserProfilePage;
