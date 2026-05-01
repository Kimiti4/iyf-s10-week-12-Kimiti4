/**
 * 🔹 Feed Sidebar Component - Tumblr Style
 * Category-based feed navigation
 */

import { motion } from 'framer-motion';
import { FaHome, FaBell, FaHandshake, FaSeedling, FaBriefcase, FaCompass } from 'react-icons/fa';
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
    return (
        <aside className="feed-sidebar">
            <div className="sidebar-header">
                <FaCompass className="sidebar-icon" />
                <h3>Feeds</h3>
            </div>
            
            <nav className="feed-nav">
                {FEED_CATEGORIES.map((category, index) => {
                    const Icon = category.icon;
                    const isActive = activeFeed === category.id;
                    
                    return (
                        <motion.button
                            key={category.id}
                            className={`feed-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onFeedChange(category.id)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="feed-icon-wrapper" style={{ 
                                background: isActive ? category.color : 'transparent',
                                color: isActive ? 'white' : category.color
                            }}>
                                <Icon />
                            </div>
                            <div className="feed-info">
                                <span className="feed-name">{category.name}</span>
                                <span className="feed-description">{category.description}</span>
                            </div>
                            {isActive && (
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
            
            {/* Trending Tags Section */}
            <div className="trending-section">
                <h4>Trending Tags</h4>
                <div className="trending-tags">
                    <span className="trending-tag">#Nairobi</span>
                    <span className="trending-tag">#Skills</span>
                    <span className="trending-tag">#FreshProduce</span>
                    <span className="trending-tag">#Gigs</span>
                    <span className="trending-tag">#Community</span>
                </div>
            </div>
        </aside>
    );
}
