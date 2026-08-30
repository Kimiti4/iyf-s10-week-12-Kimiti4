/**
 * 🔹 Enhanced Social Media Feed Page
 * Instagram-esque layout
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FaArrowUp, FaComment, FaRetweet, FaHeart } from 'react-icons/fa';
import { FeedSkeleton } from '../../components/SkeletonLoader';
import { postsAPI } from '../../services/api';
import { fetchWithRetry } from '../../utils/apiRetry';
import './EnhancedFeedPage.css';

function normalizePost(p) {
    const author = p.author || {};
    return {
        id: p._id || p.id || `post-${Math.random().toString(36).slice(2, 9)}`,
        title: p.title || '',
        content: p.content || p.body || p.description || '',
        author: {
            _id: author._id || author.id || p.userId || 'unknown',
            username: author.username || author.name || author.displayName || 'Anonymous',
            avatar: author.avatar || author.profile?.avatar || null,
            profile: author.profile || { avatar: author.avatar || null }
        },
        verified: !!p.verified,
        likes: Number(p.likes ?? p.upvotes ?? 0) || 0,
        downvotes: Number(p.downvotes ?? 0) || 0,
        reblogs: Number(p.reblogs ?? p.shares ?? 0) || 0,
        comments: Number(Array.isArray(p.comments) ? p.comments.length : (p.comments ?? 0)) || 0,
        tags: Array.isArray(p.tags) ? p.tags : [],
        category: p.category || 'all',
        image: p.image || p.imageUrl || '',
        createdAt: p.createdAt || new Date().toISOString()
    };
}

export default function EnhancedFeedPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataMode, setDataMode] = useState('live');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const activeFeed = searchParams.get('feed') || 'all';

    useEffect(() => {
        const mockPosts = [
            {
                id: '1',
                title: '⚠️ Road Closure on Moi Avenue',
                content: 'Emergency road closure due to water main break. Expect delays until 6 PM. Alternative routes via Kenyatta Avenue recommended.',
                author: { username: 'Nairobi Traffic Alert', avatar: '/traffic-avatar.png' },
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
                author: { username: 'Westlands Community Watch', avatar: '/watch-avatar.png' },
                verified: true,
                likes: 234,
                downvotes: 1,
                reblogs: 312,
                comments: 67,
                tags: ['Emergency', 'Safety', 'Westlands'],
                category: 'mtaani',
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: '3',
                title: '🤝 Offering: Web Development | Seeking: Graphic Design',
                content: 'Hi community! I\'m a full-stack developer (React, Node.js) looking to swap skills with a graphic designer. Can help build your portfolio website in exchange for logo/branding design. DM if interested!',
                author: { username: 'DevSwapKE', avatar: '/dev-avatar.png' },
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
                author: { username: 'LanguageLover254', avatar: '/lang-avatar.png' },
                verified: false,
                likes: 45,
                downvotes: 0,
                reblogs: 18,
                comments: 12,
                tags: ['Language', 'Education', 'Exchange'],
                category: 'skills',
                createdAt: new Date(Date.now() - 10800000).toISOString()
            },
            {
                id: '5',
                title: '🌱 Fresh Organic Tomatoes - KSh 80/kg',
                content: 'Freshly harvested organic tomatoes from our farm in Kiambu. No pesticides! Available for pickup in Nairobi or delivery (KSh 200 within city). Bulk orders welcome. Contact: 07XX XXX XXX',
                author: { username: 'Kiambu Organic Farms', avatar: '/farm-avatar.png' },
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
                author: { username: 'Green Valley Farmers', avatar: '/green-avatar.png' },
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
            {
                id: '7',
                title: '💼 Hiring: Social Media Manager (Remote)',
                content: 'Looking for a creative social media manager to handle our brand accounts. Part-time, flexible hours. Must have experience with Instagram, TikTok, and Facebook. Rate: KSh 30,000-50,000/month. Apply with portfolio!',
                author: { username: 'TechStartupKE', avatar: '/startup-avatar.png' },
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
                author: { username: 'PhotoProNairobi', avatar: '/photo-avatar.png' },
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
            {
                id: '9',
                title: 'Welcome to JamiiLink! 🎉',
                content: 'Excited to share our new social platform with you! Connect with your community, share stories, and inspire others. #Community #Social',
                author: { username: 'JamiiLink Team', avatar: '/team-avatar.png' },
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
                author: { username: 'NatureLover', avatar: '/nature-avatar.png' },
                verified: false,
                likes: 567,
                downvotes: 1,
                reblogs: 123,
                comments: 45,
                tags: ['Photography', 'Nairobi', 'Sunset'],
                category: 'all',
                image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800',
                createdAt: new Date(Date.now() - 10800000).toISOString()
            }
        ];

        let cancelled = false;

        const loadPosts = async () => {
            try {
                const data = await fetchWithRetry(
                    () => postsAPI.getAll({ limit: 50, sort: 'new' }),
                    2,
                    400
                );
                if (cancelled) return;
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data.posts) ? data.posts
                    : Array.isArray(data.data) ? data.data
                    : [];

                if (list.length > 0) {
                    setPosts(list.map(normalizePost));
                    setDataMode('live');
                } else {
                    setPosts(mockPosts);
                    setDataMode('sample');
                }
            } catch (err) {
                if (cancelled) return;
                setPosts(mockPosts);
                setDataMode('sample');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadPosts();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (activeFeed === 'all') {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(post => post.category === activeFeed));
        }
    }, [activeFeed, posts]);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFeedChange = (feedId) => {
        setSearchParams(feedId === 'all' ? {} : { feed: feedId });
    };

    const FEED_TABS = [
        { id: 'all', label: 'For You' },
        { id: 'mtaani', label: 'Mtaani' },
        { id: 'skills', label: 'Skills' },
        { id: 'farm', label: 'Farm' },
        { id: 'gigs', label: 'Gigs' }
    ];

    const trending = [
        { topic: '#Nairobi', meta: '2.1K posts' },
        { topic: '#Skills', meta: '1.4K posts' },
        { topic: '#FreshProduce', meta: '986 posts' },
        { topic: '#Gigs', meta: '752 posts' },
        { topic: '#Community', meta: '540 posts' }
    ];

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const diff = Math.floor((Date.now() - date) / 1000);
        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
        return date.toLocaleDateString();
    };

    return (
        <div className="social-layout">
            <section className="feed" aria-label="Community feed">
                <div className="feed-tabs" role="tablist" aria-label="Feed categories">
                    {FEED_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeFeed === tab.id}
                            className={`feed-tab ${activeFeed === tab.id ? 'active' : ''}`}
                            onClick={() => handleFeedChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <FeedSkeleton count={3} />
                ) : filteredPosts.length === 0 ? (
                    <div className="empty-feed" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>No posts in this feed yet. Check back later!</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {filteredPosts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                className="post"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                            >
                                <div className="post-header">
                                    <div className="avatar" aria-hidden="true">
                                        {post.author.avatar ? (
                                            <img src={post.author.avatar} alt="" />
                                        ) : (
                                            <span>{post.author.username.slice(0, 1).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="post-meta">
                                        <div className="post-author">
                                            <span className="post-name">{post.author.username}</span>
                                            <span className="post-handle">@{post.author.username.toLowerCase().replace(/\s+/g, '')}</span>
                                            <span className="post-time">&middot; {formatTime(post.createdAt)}</span>
                                        </div>
                                        <div className="post-tags">
                                            {post.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="tag">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="post-body">
                                    {post.title && <strong className="post-title">{post.title}</strong>}
                                    {"\n"}{post.content}
                                </div>

                                {post.image && (
                                    <div className="post-media">
                                        <img src={post.image} alt={post.title || 'post image'} loading="lazy" />
                                    </div>
                                )}

                                <div className="post-actions">
                                    <button className="post-action" aria-label="Comment"><FaComment aria-hidden="true" /> {post.comments}</button>
                                    <button className="post-action" aria-label="Reblog"><FaRetweet aria-hidden="true" /> {post.reblogs}</button>
                                    <button className="post-action" aria-label="Like"><FaHeart aria-hidden="true" /> {post.likes}</button>
                                    <span className="post-action">{post.downvotes} &darr;</span>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                )}

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
            </section>

            <aside className="right-rail" aria-label="Discover">
                <div className="discovery-card">
                    <h3 className="discovery-title">Trending in JamiiLink</h3>
                    {trending.map((item) => (
                        <div key={item.topic} className="trending-item">
                            <div className="trending-topic">{item.topic}</div>
                            <div className="trending-meta">{item.meta}</div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
