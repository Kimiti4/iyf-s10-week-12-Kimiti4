/**
 * 👤 Enhanced User Profile Page
 * Features: Views, Likes (private), Stories, Posts, User Stats
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?._id === userId || currentUser?.id === userId;

  // Mock data - Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setUserProfile({
        id: userId || currentUser?._id,
        name: isOwnProfile ? currentUser?.name : 'John Kamau',
        username: isOwnProfile ? currentUser?.username : '@johnkamau',
        avatar: currentUser?.avatar || null,
        bio: 'Community builder | Tech enthusiast | Nairobi 🇪',
        location: 'Nairobi, Kenya',
        website: 'johndoe.co.ke',
        joinedDate: 'January 2024',
        verified: true,
        stats: {
          posts: 142,
          followers: 1234,
          following: 567,
          views: 45678,
          likes: 8923, // Private - only visible to owner
        },
        stories: [
          { id: 1, thumbnail: 'https://via.placeholder.com/150', viewed: false, timestamp: Date.now() - 3600000 },
          { id: 2, thumbnail: 'https://via.placeholder.com/150', viewed: true, timestamp: Date.now() - 7200000 },
          { id: 3, thumbnail: 'https://via.placeholder.com/150', viewed: false, timestamp: Date.now() - 10800000 },
        ],
        posts: [
          { id: 1, content: 'Just launched my new project! ', image: 'https://via.placeholder.com/400x300', likes: 234, comments: 45, timestamp: Date.now() - 86400000 },
          { id: 2, content: 'Beautiful sunset in Nairobi today', image: 'https://via.placeholder.com/400x300', likes: 567, comments: 89, timestamp: Date.now() - 172800000 },
          { id: 3, content: 'Working on something exciting...', image: null, likes: 123, comments: 34, timestamp: Date.now() - 259200000 },
        ],
        likedPosts: [
          { id: 101, content: 'Amazing community event!', author: 'Jane Doe', likes: 890, timestamp: Date.now() - 43200000 },
          { id: 102, content: 'New marketplace features are awesome', author: 'Tech Hub', likes: 456, timestamp: Date.now() - 86400000 },
        ]
      });
      setIsFollowing(Math.random() > 0.5);
      setLoading(false);
    }, 500);
  }, [userId, currentUser, isOwnProfile]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (timestamp) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          <div className="cover-gradient"></div>
        </div>
        
        <div className="profile-info">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.name} />
              ) : (
                <span>{userProfile.name?.charAt(0)?.toUpperCase()}</span>
              )}
              {userProfile.verified && <div className="verified-badge">✓</div>}
            </div>
            
            {isOwnProfile ? (
              <button className="btn-edit-profile" onClick={() => navigate('/settings')}>
                Edit Profile
              </button>
            ) : (
              <div className="profile-actions">
                <button 
                  className={`btn-follow ${isFollowing ? 'following' : ''}`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="btn-message" onClick={() => navigate('/chat')}>
                  Message
                </button>
              </div>
            )}
          </div>

          <div className="profile-details">
            <h1 className="profile-name">{userProfile.name}</h1>
            <p className="profile-username">{userProfile.username}</p>
            <p className="profile-bio">{userProfile.bio}</p>
            
            <div className="profile-meta">
              <span className="meta-item">📍 {userProfile.location}</span>
              <span className="meta-item">🔗 {userProfile.website}</span>
              <span className="meta-item">📅 Joined {userProfile.joinedDate}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{formatNumber(userProfile.stats.posts)}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(userProfile.stats.followers)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(userProfile.stats.following)}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(userProfile.stats.views)}</span>
              <span className="stat-label">Views</span>
            </div>
            {isOwnProfile && (
              <div className="stat-item private-stat" title="Only visible to you">
                <span className="stat-value">❤️ {formatNumber(userProfile.stats.likes)}</span>
                <span className="stat-label">Likes Given</span>
              </div>
            )}
          </div>
        </div>
      </div>

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
          {userProfile.stories.map((story) => (
            <motion.div 
              key={story.id}
              className={`story-item ${story.viewed ? 'viewed' : 'unviewed'}`}
              whileHover={{ scale: 1.05 }}
            >
              <img src={story.thumbnail} alt="Story" />
              <div className="story-overlay">
                <span>{formatDate(story.timestamp)}</span>
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
          className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
           Media
        </button>
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
              {userProfile.posts.map((post) => (
                <motion.div 
                  key={post.id}
                  className="post-card"
                  whileHover={{ y: -5 }}
                >
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Post" />
                    </div>
                  )}
                  <div className="post-content">
                    <p>{post.content}</p>
                    <div className="post-stats">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>{formatDate(post.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              {userProfile.likedPosts.map((post) => (
                <div key={post.id} className="liked-post-card">
                  <p>{post.content}</p>
                  <div className="post-author">by {post.author}</div>
                  <div className="post-stats">
                    <span>❤️ {post.likes}</span>
                    <span>{formatDate(post.timestamp)}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div 
              key="media"
              className="media-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {userProfile.posts.filter(p => p.image).map((post) => (
                <div key={post.id} className="media-item">
                  <img src={post.image} alt="Media" />
                  <div className="media-overlay">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              ))}
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
                <h3>About {userProfile.name}</h3>
                <p className="about-bio">{userProfile.bio}</p>
                <div className="about-details">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span>Location: {userProfile.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🔗</span>
                    <span>Website: {userProfile.website}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span>Joined: {userProfile.joinedDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👁️</span>
                    <span>Profile Views: {formatNumber(userProfile.stats.views)}</span>
                  </div>
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
                <p>📷 Upload Photo or Video</p>
                <button className="btn-upload">Choose File</button>
              </div>
              <button className="btn-close-modal" onClick={() => setShowStoryModal(false)}>
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfilePage;
