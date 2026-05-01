/**
 * 🔹 Feed Sidebar Component - Tumblr Style
 * Category-based feed navigation with collapsible feature
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaBell, FaHandshake, FaSeedling, FaBriefcase, FaCompass, FaFilm, FaChevronRight } from 'react-icons/fa';
import './FeedSidebar.css';

const FEED_CATEGORIES = [
    {
        id: 'all',
        name: 'For You',
        icon: FaHome,
        description: 'All posts from your community',
        color: '#3b82f6'
    },
    {
        id: 'mtaani',
        name: 'Mtaani Alerts',
        icon: FaBell,
        description: 'Neighborhood updates & emergencies',
        color: '#ef4444'
    },
    {
        id: 'skills',
        name: 'Skill Swaps',
        icon: FaHandshake,
        description: 'Exchange skills & services',
        color: '#8b5cf6'
    },
    {
        id: 'farm',
        name: 'Farm Market',
        icon: FaSeedling,
        description: 'Fresh produce from local farmers',
        color: '#10b981'
    },
    {
        id: 'gigs',
        name: 'Gig Economy',
        icon: FaBriefcase,
        description: 'Work opportunities & talent',
        color: '#f59e0b'
    }
];

export default function FeedSidebar({ activeFeed, onFeedChange }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    
    const handleSidebarClick = () => {
        setIsExpanded(!isExpanded);
    };
    
    return (
        <aside 
            className={`feed-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
            onClick={handleSidebarClick}
        >
            {/* Expand/Collapse Indicator */}
            <div className="sidebar-toggle-indicator">
                <FaChevronRight className={`toggle-icon ${isExpanded ? 'rotated' : ''}`} />
            </div>
            
            <div className="sidebar-header">
                <FaCompass className="sidebar-icon" />
                <AnimatePresence>
                    {isExpanded && (
                        <motion.h3
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            Feeds
                        </motion.h3>
                    )}
                </AnimatePresence>
            </div>
            
            <nav className="feed-nav">
                {FEED_CATEGORIES.map((category, index) => {
                    const Icon = category.icon;
                    const isActive = activeFeed === category.id;
                    
                    return (
                        <motion.button
                            key={category.id}
                            className={`feed-nav-item ${isActive ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFeedChange(category.id);
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: isExpanded ? 5 : 0 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="feed-icon-wrapper" style={{ 
                                background: isActive ? category.color : 'transparent',
                                color: isActive ? 'white' : category.color
                            }}>
                                <Icon />
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div 
                                        className="feed-info"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <span className="feed-name">{category.name}</span>
                                        <span className="feed-description">{category.description}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {isActive && isExpanded && (
                                <motion.div
                                    className="active-indicator"
                                    layoutId="activeFeed"
                                    style={{ background: category.color }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>
            
            {/* Reels Button */}
            <motion.button
                className="reels-sidebar-button"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/reels');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="reels-icon-wrapper">
                    <FaFilm />
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="reels-button-text"
                        >
                            Watch Reels
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
            
            {/* Trending Tags Section */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        className="trending-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h4>Trending Tags</h4>
                        <div className="trending-tags">
                            <span className="trending-tag">#Nairobi</span>
                            <span className="trending-tag">#Skills</span>
                            <span className="trending-tag">#FreshProduce</span>
                            <span className="trending-tag">#Gigs</span>
                            <span className="trending-tag">#Community</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
    );
}
