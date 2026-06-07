/**
 * 🎨 Your Profile - Where Your Community Story Lives!
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function ProfilePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAuth()
    
    const [profileUser, setProfileUser] = useState(null)
    const [userPosts, setUserPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('posts')
    
    useEffect(() => {
        fetchUserProfile()
    }, [id])
    
    const fetchUserProfile = async () => {
        try {
            setLoading(true)
            const mockUser = {
                _id: id || 'me',
                name: 'Kimiti Njeri',
                avatar: null,
                location: 'Nairobi, Kenya',
                createdAt: Date.now() - 86400000 * 365,
                verified: true,
                reputation: 1250,
                badges: ['🏆 Top Contributor', '🤝 Helper', '📅 Regular'],
                stats: {
                    posts: 45,
                    comments: 128,
                    helped: 23
                }
            }
            const mockPosts = [
                {
                    _id: 1,
                    title: 'Fresh Tomatoes Available! 🍅',
                    content: 'Farm fresh organic tomatoes from my garden...',
                    createdAt: Date.now() - 86400000 * 2,
                    likes: [1, 2, 3, 4, 5]
                },
                {
                    _id: 2,
                    title: 'Skill Swap: Web Dev for Cooking Lessons',
                    content: 'Expert web developer offering services...',
                    createdAt: Date.now() - 86400000 * 5,
                    likes: [1, 2]
                }
            ]
            
            setProfileUser(mockUser)
            setUserPosts(mockPosts)
        } catch (err) {
            setError(err.message || 'Failed to load profile')
        } finally {
            setLoading(false)
        }
    }
    
    if (loading) {
        return (
            <motion.div 
                className="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="loading-spinner"></div>
                <p>Loading profile magic... ✨</p>
            </motion.div>
        )
    }
    
    if (error) {
        return (
            <motion.div 
                className="error-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <p>😢 {error}</p>
            </motion.div>
        )
    }
    
    if (!profileUser) {
        return (
            <motion.div 
                className="error-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <p>User not found 🧐</p>
            </motion.div>
        )
    }
    
    const isOwnProfile = currentUser?._id === profileUser._id || !id
    
    return (
        <div className="profile-page">
            <div className="profile-container">
                <motion.div 
                    className="profile-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="profile-avatar-section">
                        {profileUser.avatar ? (
                            <img src={profileUser.avatar} alt={profileUser.name} className="profile-avatar" />
                        ) : (
                            <div className="avatar-placeholder">
                                {profileUser.name.charAt(0).toUpperCase()}
                                {profileUser.verified && (
                                    <div className="verified-badge">✓</div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info">
                        <motion.h1 
                            className="profile-name"
                            whileHover={{ scale: 1.02 }}
                        >
                            {profileUser.name} 🌟
                        </motion.h1>
                        
                        <div className="profile-meta">
                            <span className="meta-item">📍 {profileUser.location}</span>
                            <span className="meta-item">📅 Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                            <span className="meta-item">🏆 {profileUser.reputation} reputation</span>
                        </div>
                        
                        <div className="profile-badges">
                            {profileUser.badges?.map((badge, idx) => (
                                <span key={idx} className="badge">{badge}</span>
                            ))}
                        </div>
                        
                        {isOwnProfile && (
                            <motion.button 
                                className="btn-secondary"
                                onClick={() => navigate('/profile/edit')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                ✏️ Edit Profile
                            </motion.button>
                        )}
                    </div>
                </motion.div>
                
                <motion.div 
                    className="profile-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-card">
                        <span className="stat-value">{profileUser.stats?.posts || 0}</span>
                        <span className="stat-label">📝 Posts</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{profileUser.stats?.comments || 0}</span>
                        <span className="stat-label">💬 Comments</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{profileUser.stats?.helped || 0}</span>
                        <span className="stat-label">🤝 Helped</span>
                    </div>
                </motion.div>
                
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        📝 My Posts
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        🏃 Recent Activity
                    </button>
                </div>
                
                <AnimatePresence mode="wait">
                    {activeTab === 'posts' && (
                        <motion.div 
                            key="posts"
                            className="profile-posts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {userPosts.length === 0 ? (
                                <div className="empty-posts">
                                    <div className="empty-illustration">📭</div>
                                    <p>No posts yet! Time to share something awesome?</p>
                                    <button className="btn-primary" onClick={() => navigate('/create-post')}>
                                        ✍️ Create First Post
                                    </button>
                                </div>
                            ) : (
                                <div className="posts-grid">
                                    {userPosts.map((post) => (
                                        <motion.div 
                                            key={post._id} 
                                            className="post-card"
                                            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                            onClick={() => navigate(`/posts/${post._id}`)}
                                        >
                                            <h3>{post.title}</h3>
                                            <p className="post-preview">
                                                {post.content.substring(0, 100)}...
                                            </p>
                                            <div className="post-meta">
                                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                <span>❤️ {post.likes?.length || 0} likes</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                    
                    {activeTab === 'activity' && (
                        <motion.div 
                            key="activity"
                            className="profile-activity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="activity-timeline">
                                <div className="activity-item">
                                    <span className="activity-icon">💬</span>
                                    <span>Answered a question in Community Help</span>
                                    <span className="activity-time">2h ago</span>
                                </div>
                                <div className="activity-item">
                                    <span className="activity-icon">❤️</span>
                                    <span>Received 5 upvotes on a post</span>
                                    <span className="activity-time">5h ago</span>
                                </div>
                                <div className="activity-item">
                                    <span className="activity-icon">🎪</span>
                                    <span>Completed "Welcome Committee" quest</span>
                                    <span className="activity-time">2d ago</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}