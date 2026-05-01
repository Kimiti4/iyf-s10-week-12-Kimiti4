/**
 * 🔹 Reels Section Component - TikTok/Instagram Style
 * Short-form vertical video content
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaHeart, FaComment, FaShare, FaMusic, FaArrowRight } from 'react-icons/fa';
import './ReelsSection.css';

// Mock reels data
const MOCK_REELS = [
    {
        id: 'reel-1',
        author: {
            username: 'NairobiVibes',
            avatar: '/reel-avatar-1.png'
        },
        description: 'Sunset views from KICC 🌅 #Nairobi #Kenya',
        likes: 12400,
        comments: 342,
        shares: 89,
        music: 'Original Sound - NairobiVibes',
        thumbnail: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600',
        duration: 15
    },
    {
        id: 'reel-2',
        author: {
            username: 'ChefMamaKE',
            avatar: '/reel-avatar-2.png'
        },
        description: 'Quick ugali recipe in 60 seconds! 🍲 #Cooking #KenyanFood',
        likes: 8900,
        comments: 234,
        shares: 156,
        music: 'Trending Audio - Chef Beats',
        thumbnail: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600',
        duration: 30
    },
    {
        id: 'reel-3',
        author: {
            username: 'FitnessKenya',
            avatar: '/reel-avatar-3.png'
        },
        description: 'Morning workout routine 💪 Stay fit! #Fitness #Health',
        likes: 15600,
        comments: 567,
        shares: 234,
        music: 'Workout Mix 2026',
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
        duration: 20
    },
    {
        id: 'reel-4',
        author: {
            username: 'MaasaiCulture',
            avatar: '/reel-avatar-4.png'
        },
        description: 'Traditional Maasai dance 🇰🇪 #Culture #Heritage',
        likes: 23400,
        comments: 890,
        shares: 445,
        music: 'Traditional Maasai Chants',
        thumbnail: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
        duration: 25
    }
];

export default function ReelsSection() {
    const navigate = useNavigate();
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const containerRef = useRef(null);

    const currentReel = MOCK_REELS[currentReelIndex];

    const handleScroll = (e) => {
        const container = e.target;
        const scrollTop = container.scrollTop;
        const reelHeight = container.clientHeight;
        const newIndex = Math.round(scrollTop / reelHeight);
        
        if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < MOCK_REELS.length) {
            setCurrentReelIndex(newIndex);
            setIsPlaying(true);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <section className="reels-section">
            <div className="reels-header">
                <h2>🎬 Reels</h2>
                <p>Short videos from your community</p>
            </div>

            <div 
                className="reels-container"
                ref={containerRef}
                onScroll={handleScroll}
            >
                {MOCK_REELS.map((reel, index) => (
                    <motion.div
                        key={reel.id}
                        className={`reel-item ${index === currentReelIndex ? 'active' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Video Thumbnail/Player */}
                        <div className="reel-video-container">
                            <img 
                                src={reel.thumbnail} 
                                alt={reel.description}
                                className="reel-thumbnail"
                            />
                            
                            {/* Play/Pause Overlay */}
                            {!isPlaying && index === currentReelIndex && (
                                <div className="play-overlay" onClick={() => setIsPlaying(true)}>
                                    <FaPlay className="play-icon" />
                                </div>
                            )}

                            {/* Pause on click */}
                            {isPlaying && index === currentReelIndex && (
                                <div 
                                    className="pause-overlay" 
                                    onClick={() => setIsPlaying(false)}
                                />
                            )}

                            {/* Progress Bar */}
                            <div className="reel-progress">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: isPlaying && index === currentReelIndex ? '100%' : '0%' }}
                                />
                            </div>

                            {/* Reel Info Overlay */}
                            <div className="reel-info-overlay">
                                <div className="reel-author">
                                    <img src={reel.avatar} alt={reel.author.username} className="author-avatar" />
                                    <span className="author-name">@{reel.author.username}</span>
                                </div>
                                <p className="reel-description">{reel.description}</p>
                                <div className="reel-music">
                                    <FaMusic className="music-icon" />
                                    <span className="music-text">{reel.music}</span>
                                </div>
                            </div>

                            {/* Action Buttons (Right Side) */}
                            <div className="reel-actions">
                                <motion.button 
                                    className="action-button like-btn"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <FaHeart />
                                    <span>{formatNumber(reel.likes)}</span>
                                </motion.button>

                                <motion.button 
                                    className="action-button comment-btn"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <FaComment />
                                    <span>{formatNumber(reel.comments)}</span>
                                </motion.button>

                                <motion.button 
                                    className="action-button share-btn"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <FaShare />
                                    <span>{formatNumber(reel.shares)}</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Scroll Indicator */}
            <div className="scroll-indicator">
                <span>{currentReelIndex + 1} / {MOCK_REELS.length}</span>
            </div>

            {/* See More Button */}
            <motion.button 
                className="see-more-button"
                onClick={() => navigate('/reels')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span>See More Reels</span>
                <FaArrowRight />
            </motion.button>
        </section>
    );
}
