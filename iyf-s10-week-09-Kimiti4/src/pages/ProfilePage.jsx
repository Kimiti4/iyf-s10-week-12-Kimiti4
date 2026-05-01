import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI, usersAPI } from '../services/api';

/**
 * ProfilePage - Display user profile and their posts
 */
export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        fetchUserProfile();
    }, [id]);
    
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            // Fetch user profile (use current user if no ID provided)
            const userId = id || currentUser?._id;
            
            if (!userId) {
                navigate('/login');
                return;
            }
            
            const userData = await usersAPI.getById(userId);
            setProfileUser(userData);
            
            // Fetch user's posts
            const postsData = await postsAPI.getByAuthor(userId);
            setUserPosts(postsData.posts || []);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }
    
    if (error) {
        return <div className="error">{error}</div>;
    }
    
    if (!profileUser) {
        return <div className="error">User not found</div>;
    }
    
    const isOwnProfile = currentUser?._id === profileUser._id;
    
    return (
        <div className="profile-page">
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profileUser.avatar ? (
                            <img src={profileUser.avatar} alt={profileUser.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {profileUser.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info">
                        <h1>{profileUser.name}</h1>
                        {profileUser.location && (
                            <p className="profile-location">📍 {profileUser.location}</p>
                        )}
                        <p className="profile-joined">
                            Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                        </p>
                        
                        {isOwnProfile && (
                            <button 
                                className="btn btn-secondary"
                                onClick={() => navigate('/profile/edit')}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
                
                {/* User Stats */}
                <div className="profile-stats">
                    <div className="stat">
                        <strong>{userPosts.length}</strong>
                        <span>Posts</span>
                    </div>
                    <div className="stat">
                        <strong>{profileUser.verified ? '✓' : '○'}</strong>
                        <span>Verified</span>
                    </div>
                </div>
                
                {/* User Posts */}
                <div className="profile-posts">
                    <h2>Posts by {profileUser.name}</h2>
                    
                    {userPosts.length === 0 ? (
                        <p className="no-posts">No posts yet</p>
                    ) : (
                        <div className="posts-grid">
                            {userPosts.map(post => (
                                <div 
                                    key={post._id} 
                                    className="post-card"
                                    onClick={() => navigate(`/posts/${post._id}`)}
                                >
                                    <h3>{post.title}</h3>
                                    <p className="post-preview">
                                        {post.content.substring(0, 100)}...
                                    </p>
                                    <div className="post-meta">
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span>❤️ {post.likes?.length || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
