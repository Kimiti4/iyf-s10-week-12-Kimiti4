/**
 * 🔹 Enhanced Social Media Post Component
 * Features: Likes, downvotes, reblog, animations
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FaHeart, FaRegHeart, FaThumbsDown, FaRetweet, FaComment, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import VerificationBadge from '../../components/VerificationBadge';
import './EnhancedPostCard.css';

export default function EnhancedPostCard({ post, currentUser }) {
    const [liked, setLiked] = useState(post.liked || false);
    const [downvoted, setDownvoted] = useState(post.downvoted || false);
    const [reblogged, setReblogged] = useState(post.reblogged || false);
    const [bookmarked, setBookmarked] = useState(post.bookmarked || false);
    const [likes, setLikes] = useState(post.likes || 0);
    const [downvotes, setDownvotes] = useState(post.downvotes || 0);
    const [reblogs, setReblogs] = useState(post.reblogs || 0);
    
    const handleLike = () => {
        if (liked) {
            setLiked(false);
            setLikes(likes - 1);
        } else {
            setLiked(true);
            setLikes(likes + 1);
            if (downvoted) {
                setDownvoted(false);
                setDownvotes(downvotes - 1);
            }
            
            // Confetti effect for like
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#ec4899', '#f472b6'],
                disableForReducedMotion: true
            });
        }
    };
    
    const handleDownvote = () => {
        if (downvoted) {
            setDownvoted(false);
            setDownvotes(downvotes - 1);
        } else {
            setDownvoted(true);
            setDownvotes(downvotes + 1);
            if (liked) {
                setLiked(false);
                setLikes(likes - 1);
            }
        }
    };
    
    const handleReblog = () => {
        if (reblogged) {
            setReblogged(false);
            setReblogs(reblogs - 1);
        } else {
            setReblogged(true);
            setReblogs(reblogs + 1);
            
            // Celebration for reblog
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#3b82f6', '#8b5cf6']
            });
        }
    };
    
    const handleBookmark = () => {
        setBookmarked(!bookmarked);
    };
    
    return (
        <motion.article 
            className="enhanced-post-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
        >
            {/* Post Header */}
            <div className="post-header">
                <div className="author-info">
                    <img 
                        src={post.author?.avatar || '/default-avatar.png'} 
                        alt={post.author?.username}
                        className="author-avatar"
                    />
                    <div className="author-details">
                        <div className="author-name-row">
                            <h3 className="author-name">{post.author?.username}</h3>
                            {/* Author Verification Badge */}
                            {post.author?.verification && post.author.verification.isVerified && (
                                <VerificationBadge 
                                    verification={post.author.verification}
                                    type="user"
                                    size="small"
                                    showLabel={false}
                                />
                            )}
                        </div>
                        <span className="post-time">{formatTime(post.createdAt)}</span>
                    </div>
                </div>
            </div>
            
            {/* Post Content */}
            <div className="post-content">
                <h2 className="post-title">{post.title}</h2>
                <p className="post-text">{post.content}</p>
                
                {post.image && (
                    <div className="post-image">
                        <img src={post.image} alt={post.title} />
                    </div>
                )}
                
                {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                        {post.tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Engagement Stats */}
            <div className="engagement-stats">
                <span>{likes} likes</span>
                {reblogs > 0 && <span>{reblogs} reblogs</span>}
            </div>
            
            {/* Action Buttons */}
            <div className="post-actions">
                <motion.button
                    className={`action-btn like-btn ${liked ? 'active' : ''}`}
                    onClick={handleLike}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {liked ? <FaHeart /> : <FaRegHeart />}
                    <span>{likes}</span>
                </motion.button>
                
                <motion.button
                    className={`action-btn downvote-btn ${downvoted ? 'active' : ''}`}
                    onClick={handleDownvote}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaThumbsDown />
                    <span>{downvotes}</span>
                </motion.button>
                
                <motion.button
                    className="action-btn comment-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaComment />
                    <span>{post.comments || 0}</span>
                </motion.button>
                
                <motion.button
                    className={`action-btn reblog-btn ${reblogged ? 'active' : ''}`}
                    onClick={handleReblog}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaRetweet />
                    <span>{reblogs}</span>
                </motion.button>
                
                <motion.button
                    className="action-btn share-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaShare />
                </motion.button>
                
                <motion.button
                    className={`action-btn bookmark-btn ${bookmarked ? 'active' : ''}`}
                    onClick={handleBookmark}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                </motion.button>
            </div>
        </motion.article>
    );
}

// Helper function to format time
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}
