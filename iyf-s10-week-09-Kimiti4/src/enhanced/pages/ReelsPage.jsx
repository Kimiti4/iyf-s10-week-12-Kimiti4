/**
 * 🔹 Full-Screen Reels Page - Instagram/TikTok Style
 * Vertical scrolling with one reel at a time
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaPlay, FaPause, FaHeart, FaComment, FaShare, FaMusic, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import './ReelsPage.css';

// Extended mock reels data for full experience
const MOCK_REELS = [
    {
        id: 'reel-1',
        author: {
            username: 'NairobiVibes',
            avatar: '/reel-avatar-1.png',
            verified: true
        },
        description: 'Sunset views from KICC 🌅 #Nairobi #Kenya #Sunset',
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
            avatar: '/reel-avatar-2.png',
            verified: false
        },
        description: 'Quick ugali recipe in 60 seconds! 🍲 Perfect every time! #Cooking #KenyanFood #Recipe',
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
            avatar: '/reel-avatar-3.png',
            verified: true
        },
        description: 'Morning workout routine 💪 Stay fit, stay healthy! #Fitness #Health #Workout',
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
            avatar: '/reel-avatar-4.png',
            verified: true
        },
        description: 'Traditional Maasai dance 🇰🇪 Preserving our heritage #Culture #Heritage #Kenya',
        likes: 23400,
        comments: 890,
        shares: 445,
        music: 'Traditional Maasai Chants',
        thumbnail: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
        duration: 25
    },
    {
        id: 'reel-5',
        author: {
            username: 'TechNairobi',
            avatar: '/reel-avatar-5.png',
            verified: false
        },
        description: 'Coding setup tour 💻 My developer workspace #Tech #Coding #Developer',
        likes: 6700,
        comments: 189,
        shares: 92,
        music: 'Lo-fi Coding Beats',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
        duration: 18
    },
    {
        id: 'reel-6',
        author: {
            username: 'WildlifeKE',
            avatar: '/reel-avatar-6.png',
            verified: true
        },
        description: 'Elephants at Amboseli 🐘 Nature at its finest #Wildlife #Safari #Kenya',
        likes: 34500,
        comments: 1234,
        shares: 678,
        music: 'Nature Sounds - Ambient',
        thumbnail: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600',
        duration: 22
    }
];

export default function ReelsPage() {
    const navigate = useNavigate();
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const containerRef = useRef(null);

    const currentReel = MOCK_REELS[currentReelIndex];

    // Handle scroll to detect which reel is in view
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const reelHeight = container.clientHeight;
            const newIndex = Math.round(scrollTop / reelHeight);
            
            if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < MOCK_REELS.length) {
                setCurrentReelIndex(newIndex);
                setIsPlaying(true);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [currentReelIndex]);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const handleNext = () => {
        if (currentReelIndex < MOCK_REELS.length - 1) {
            setCurrentReelIndex(currentReelIndex + 1);
            setIsPlaying(true);
        }
    };

    const handlePrevious = () => {
        if (currentReelIndex > 0) {
            setCurrentReelIndex(currentReelIndex - 1);
            setIsPlaying(true);
        }
    };

    return (
        <div className="reels-page">
            {/* Header */}
            <header className="reels-page-header">
                <motion.button 
                    className="back-button"
                    onClick={() => navigate('/')}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaArrowLeft />
                    <span>Feed</span>
                </motion.button>
                <h1>Reels</h1>
                <div className="header-spacer"></div>
            </header>

            {/* Reels Container */}
            <div 
                className="reels-fullscreen-container"
                ref={containerRef}
            >
                <AnimatePresence mode="wait">
                    {MOCK_REELS.map((reel, index) => (
                        <motion.div
                            key={reel.id}
                            className={`reel-fullscreen-item ${index === currentReelIndex ? 'active' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: index === currentReelIndex ? 1 : 0.5 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Video Background */}
                            <div className="reel-video-background">
                                <img 
                                    src={reel.thumbnail} 
                                    alt={reel.description}
                                    className="reel-fullscreen-thumbnail"
                                />
                                
                                {/* Gradient Overlays */}
                                <div className="gradient-overlay-top"></div>
                                <div className="gradient-overlay-bottom"></div>

                                {/* Play/Pause Indicator */}
                                {!isPlaying && index === currentReelIndex && (
                                    <motion.div 
                                        className="play-pause-indicator"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                    >
                                        <FaPlay />
                                    </motion.div>
                                )}

                                {/* Click zones for play/pause */}
                                <div 
                                    className="click-zone-left"
                                    onClick={handlePrevious}
                                />
                                <div 
                                    className="click-zone-center"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                />
                                <div 
                                    className="click-zone-right"
                                    onClick={handleNext}
                                />
                            </div>

                            {/* Right Side Actions */}
                            <div className="reel-actions-vertical">
                                <motion.div 
                                    className="action-item"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <div className="action-icon-wrapper like-wrapper">
                                        <FaHeart />
                                    </div>
                                    <span className="action-count">{formatNumber(reel.likes)}</span>
                                </motion.div>

                                <motion.div 
                                    className="action-item"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <div className="action-icon-wrapper comment-wrapper">
                                        <FaComment />
                                    </div>
                                    <span className="action-count">{formatNumber(reel.comments)}</span>
                                </motion.div>

                                <motion.div 
                                    className="action-item"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <div className="action-icon-wrapper share-wrapper">
                                        <FaShare />
                                    </div>
                                    <span className="action-count">{formatNumber(reel.shares)}</span>
                                </motion.div>

                                <motion.div 
                                    className="action-item"
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMuted(!isMuted)}
                                >
                                    <div className="action-icon-wrapper sound-wrapper">
                                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                    </div>
                                    <span className="action-count">{isMuted ? 'Muted' : 'Sound'}</span>
                                </motion.div>
                            </div>

                            {/* Bottom Info */}
                            <div className="reel-info-bottom">
                                <div className="reel-author-info">
                                    <img 
                                        src={reel.avatar} 
                                        alt={reel.author.username} 
                                        className="author-avatar-large" 
                                    />
                                    <div className="author-details">
                                        <div className="author-name-row">
                                            <span className="author-name">@{reel.author.username}</span>
                                            {reel.verified && (
                                                <span className="verified-badge">✓</span>
                                            )}
                                        </div>
                                        <button className="follow-button">Follow</button>
                                    </div>
                                </div>
                                
                                <p className="reel-description-full">{reel.description}</p>
                                
                                <div className="reel-music-info">
                                    <FaMusic className="music-icon-spinning" />
                                    <marquee scrollamount="3" className="music-marquee">
                                        {reel.music}
                                    </marquee>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-bar-container">
                                <div 
                                    className="progress-bar-fill"
                                    style={{ 
                                        width: isPlaying && index === currentReelIndex ? '100%' : '0%',
                                        transition: isPlaying ? `width ${reel.duration}s linear` : 'none'
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Scroll Indicator */}
            <div className="reel-counter">
                {currentReelIndex + 1} / {MOCK_REELS.length}
            </div>
        </div>
    );
}
