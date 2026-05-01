/**
 * 🔹 Enhanced Social Media Feed Page
 * Features: Dark mode, constellation background, animated posts, category feeds
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';
import ConstellationBackground from '../components/ConstellationBackground';
import EnhancedPostCard from '../components/EnhancedPostCard';
import FeedSidebar from '../components/FeedSidebar';
import ReelsSection from '../components/ReelsSection';
import './EnhancedFeedPage.css';

export default function EnhancedFeedPage() {
    const [activeFeed, setActiveFeed] = useState('all');
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    // Mock data for demonstration with categories
    useEffect(() => {
        const mockPosts = [
            // Mtaani Alerts
            {
                id: '1',
                title: '⚠️ Road Closure on Moi Avenue',
                content: 'Emergency road closure due to water main break. Expect delays until 6 PM. Alternative routes via Kenyatta Avenue recommended.',
                author: {
                    username: 'Nairobi Traffic Alert',
                    avatar: '/traffic-avatar.png'
                },
                verified: true,
                likes: 89,
                downvotes: 0,
                reblogs: 156,
                comments: 23,
                tags: ['Alert', 'Traffic', 'Nairobi'],
                category: 'mtaani',
                createdAt: new Date(Date.now() - 1800000).toISOString()
            },
            {
                id: '2',
                title: '🔥 Fire Incident in Westlands',
                content: 'Fire reported at Westgate Mall parking lot. Emergency services on scene. Please avoid the area. Updates to follow.',
                author: {
                    username: 'Westlands Community Watch',
                    avatar: '/watch-avatar.png'
                },
                verified: true,
                likes: 234,
                downvotes: 1,
                reblogs: 312,
                comments: 67,
                tags: ['Emergency', 'Safety', 'Westlands'],
                category: 'mtaani',
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            
            // Skill Swaps
            {
                id: '3',
                title: '🤝 Offering: Web Development | Seeking: Graphic Design',
                content: 'Hi community! I\'m a full-stack developer (React, Node.js) looking to swap skills with a graphic designer. Can help build your portfolio website in exchange for logo/branding design. DM if interested!',
                author: {
                    username: 'DevSwapKE',
                    avatar: '/dev-avatar.png'
                },
                verified: false,
                likes: 67,
                downvotes: 2,
                reblogs: 23,
                comments: 15,
                tags: ['Skills', 'WebDev', 'Design'],
                category: 'skills',
                createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
                id: '4',
                title: '📚 Language Exchange: Swahili ↔ English',
                content: 'Native Swahili speaker offering lessons in exchange for English conversation practice. Available weekends in CBD. Let\'s learn together!',
                author: {
                    username: 'LanguageLover254',
                    avatar: '/lang-avatar.png'
                },
                verified: false,
                likes: 45,
                downvotes: 0,
                reblogs: 18,
                comments: 12,
                tags: ['Language', 'Education', 'Exchange'],
                category: 'skills',
                createdAt: new Date(Date.now() - 10800000).toISOString()
            },
            
            // Farm Market
            {
                id: '5',
                title: '🌱 Fresh Organic Tomatoes - KSh 80/kg',
                content: 'Freshly harvested organic tomatoes from our farm in Kiambu. No pesticides! Available for pickup in Nairobi or delivery (KSh 200 within city). Bulk orders welcome. Contact: 07XX XXX XXX',
                author: {
                    username: 'Kiambu Organic Farms',
                    avatar: '/farm-avatar.png'
                },
                verified: true,
                likes: 156,
                downvotes: 3,
                reblogs: 45,
                comments: 28,
                tags: ['Organic', 'Tomatoes', 'Kiambu'],
                category: 'farm',
                image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=800',
                createdAt: new Date(Date.now() - 5400000).toISOString()
            },
            {
                id: '6',
                title: '🥬 Mixed Vegetable Box - KSh 1,500',
                content: 'Weekly vegetable subscription box! Includes sukuma wiki, spinach, carrots, onions, and seasonal veggies. Direct from farm to your door. Subscribe now!',
                author: {
                    username: 'Green Valley Farmers',
                    avatar: '/green-avatar.png'
                },
                verified: true,
                likes: 203,
                downvotes: 1,
                reblogs: 67,
                comments: 34,
                tags: ['Vegetables', 'Subscription', 'Fresh'],
                category: 'farm',
                image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
                createdAt: new Date(Date.now() - 14400000).toISOString()
            },
            
            // Gig Economy
            {
                id: '7',
                title: '💼 Hiring: Social Media Manager (Remote)',
                content: 'Looking for a creative social media manager to handle our brand accounts. Part-time, flexible hours. Must have experience with Instagram, TikTok, and Facebook. Rate: KSh 30,000-50,000/month. Apply with portfolio!',
                author: {
                    username: 'TechStartupKE',
                    avatar: '/startup-avatar.png'
                },
                verified: true,
                likes: 178,
                downvotes: 2,
                reblogs: 89,
                comments: 45,
                tags: ['Hiring', 'SocialMedia', 'Remote'],
                category: 'gigs',
                createdAt: new Date(Date.now() - 9000000).toISOString()
            },
            {
                id: '8',
                title: '🛠️ Available: Professional Photography Services',
                content: 'Experienced photographer available for events, portraits, product shoots. Equipment included. Rates starting at KSh 5,000/session. Portfolio: link in bio. Book now for weekend slots!',
                author: {
                    username: 'PhotoProNairobi',
                    avatar: '/photo-avatar.png'
                },
                verified: false,
                likes: 92,
                downvotes: 0,
                reblogs: 34,
                comments: 19,
                tags: ['Photography', 'Freelance', 'Services'],
                category: 'gigs',
                image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800',
                createdAt: new Date(Date.now() - 18000000).toISOString()
            },
            
            // General Feed (For You)
            {
                id: '9',
                title: 'Welcome to JamiiLink! 🎉',
                content: 'Excited to share our new social platform with you! Connect with your community, share stories, and inspire others. #Community #Social',
                author: {
                    username: 'JamiiLink Team',
                    avatar: '/team-avatar.png'
                },
                verified: true,
                likes: 245,
                downvotes: 2,
                reblogs: 89,
                comments: 42,
                tags: ['Community', 'Social', 'Launch'],
                category: 'all',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'
            },
            {
                id: '10',
                title: 'Beautiful Sunset in Nairobi 🌅',
                content: 'Caught this amazing sunset today. Nature never fails to amaze me!',
                author: {
                    username: 'NatureLover',
                    avatar: '/nature-avatar.png'
                },
                verified: false,
                likes: 567,
                downvotes: 1,
                reblogs: 123,
                comments: 45,
                tags: ['Photography', 'Nairobi', 'Sunset'],
                category: 'all',
                createdAt: new Date(Date.now() - 10800000).toISOString(),
                image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800'
            }
        ];
        
        setTimeout(() => {
            setPosts(mockPosts);
            setLoading(false);
        }, 500);
    }, []);
    
    // Filter posts based on active feed
    useEffect(() => {
        if (activeFeed === 'all') {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(post => post.category === activeFeed));
        }
    }, [activeFeed, posts]);
    
    // Handle scroll to hide/show header and back to top button
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down - hide header
                setShowHeader(false);
            } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
                // Scrolling up or at top - show header
                setShowHeader(true);
            }
            
            // Show/hide back to top button
            setShowBackToTop(currentScrollY > 500);
            
            setLastScrollY(currentScrollY);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);
    
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    const handleFeedChange = (feedId) => {
        setActiveFeed(feedId);
    };
    
    return (
        <div className="enhanced-feed-page">
            <ConstellationBackground />
            
            {/* Header - hides on scroll down, shows on scroll up */}
            <motion.header 
                className={`feed-header ${showHeader ? 'visible' : 'hidden'}`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1>🌟 JamiiLink Feed</h1>
                <p>Discover what's happening in your community</p>
            </motion.header>
            
            {/* Main Content with Sidebar */}
            <div className="feed-layout">
                {/* Sidebar Navigation */}
                <FeedSidebar activeFeed={activeFeed} onFeedChange={handleFeedChange} />
                
                {/* Posts Feed */}
                <main className="feed-content">
                    {/* Reels Section - Only show on "For You" feed */}
                    {activeFeed === 'all' && (
                        <ReelsSection />
                    )}
                    
                    {/* Feed Title */}
                    <motion.div 
                        className="feed-title"
                        key={activeFeed}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2>
                            {activeFeed === 'all' && '🏠 For You'}
                            {activeFeed === 'mtaani' && ' Mtaani Alerts'}
                            {activeFeed === 'skills' && '🤝 Skill Swaps'}
                            {activeFeed === 'farm' && '🌱 Farm Market'}
                            {activeFeed === 'gigs' && '💼 Gig Economy'}
                        </h2>
                        <p>
                            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} in this feed
                        </p>
                    </motion.div>
                    
                    {loading ? (
                        <div className="loading-posts">
                            <div className="loading-spinner"></div>
                            <p>Loading posts...</p>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <motion.div 
                            className="empty-feed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p>No posts in this feed yet. Check back later!</p>
                        </motion.div>
                    ) : (
                        <div className="posts-container">
                            <AnimatePresence mode="wait">
                                {filteredPosts.map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <EnhancedPostCard post={post} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>
            
            {/* Back to Top Button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        className="back-to-top-button"
                        onClick={scrollToTop}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaArrowUp />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
