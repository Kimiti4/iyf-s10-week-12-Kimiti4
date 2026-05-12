/**
 * 🔹 User Profile Page with Verification Badge
 * Displays user details, verification status, and posts
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, postsAPI } from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import EnhancedPostCard from '../enhanced/components/EnhancedPostCard';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user details
      const userResponse = await usersAPI.getById(userId);
      setUser(userResponse.data);
      
      // Fetch user's posts
      const postsResponse = await postsAPI.getAll({ author: userId });
      setPosts(postsResponse.data || []);
      
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-error">
        <h2>User Not Found</h2>
        <p>{error || 'The user profile you\'re looking for doesn\'t exist.'}</p>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <header className="profile-header">
        <div className="container">
          <div className="profile-header-content">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.username}
              className="profile-avatar"
            />
            
            <div className="profile-info">
              <div className="profile-name-section">
                <h1>{user.username}</h1>
                
                {/* Verification Badge - Prominent Display */}
                {user.verification && user.verification.isVerified && (
                  <VerificationBadge 
                    verification={user.verification}
                    type="user"
                    size="large"
                    showLabel={true}
                  />
                )}
              </div>
              
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.followers?.length || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.following?.length || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
              
              {/* Verification Details (if verified) */}
              {user.verification?.isVerified && (
                <div className="verification-details">
                  <p className="verified-since">
                    Verified since {new Date(user.verification.verifiedAt).toLocaleDateString()}
                  </p>
                  {user.verification.verificationType && (
                    <span className="verification-type">
                      Verified via: {user.verification.verificationType.replace('_', ' ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* User Posts Feed */}
      <section className="profile-posts">
        <div className="container">
          <h2>Posts by {user.username}</h2>
          
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <EnhancedPostCard 
                  key={post._id} 
                  post={post}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserProfilePage;
