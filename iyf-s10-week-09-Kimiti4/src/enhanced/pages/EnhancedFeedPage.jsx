/**
 * 🔹 Enhanced Social Media Feed Page
 * Instagram-esque layout
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';
import EnhancedPostCard from '../components/EnhancedPostCard';
import ReelsSection from '../components/ReelsSection';
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

    return (
        <div className="ig-app">
            <header className="ig-header">
                <div className="ig-logo">JamiiLink</div>
                <div className="ig-header__actions">
                    <button className="ig-icon-btn" aria-label="Notifications">
                        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 9h6s3-2 3-9z"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    </button>
                </div>
            </header>

            {activeFeed === 'all' && (
                <section className="ig-stories">
                    <div className="ig-stories__track">
                        {['Nairobi', 'Mtaani', 'Skills', 'Farm', 'Gigs'].map((name) => (
                            <div key={name} className="ig-story">
                                <div className="ig-story__ring"><div className="ig-story__img" style={{ background: '#e0e0e0' }} /></div>
                                <span className="ig-story__name">{name}</span>
                            </div>
                        ))}
                        <div className="ig-story">
                            <div className="ig-story__ring ig-story__ring--add"><div className="ig-story__img" style={{ background: '#e0e0e0' }} /></div>
                            <span className="ig-story__name">Add</span>
                        </div>
                    </div>
                </section>
            )}

            <section className="ig-feed">
                {loading ? (
                    <FeedSkeleton count={3} />
                ) : filteredPosts.length === 0 ? (
                    <div className="empty-feed" style={{ padding: '2rem', textAlign: 'center', color: 'var(--ig-text-secondary)' }}>
                        <p>No posts in this feed yet. Check back later!</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {filteredPosts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                className="ig-post"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="ig-post__header">
                                    <div className="ig-post__user">
                                        <div className="ig-avatar" style={{ backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : 'none', backgroundSize: 'cover' }} />
                                        <div className="ig-post__meta">
                                            <span className="ig-post__username">{post.author.username}</span>
                                            <span className="ig-post__location">{post.category}</span>
                                        </div>
                                    </div>
                                    <button className="ig-post__more">⋯</button>
                                </div>

                                {post.image && (
                                    <img className="ig-post__media" src={post.image} alt={post.title} loading="lazy" />
                                )}

                                <div className="ig-post__actions">
                                    <div className="ig-post__actions-left">
                                        <button className="ig-action" aria-label="Like"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                                        <button className="ig-action" aria-label="Comment"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
                                        <button className="ig-action" aria-label="Share"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                                    </div>
                                    <button className="ig-action" aria-label="Save"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
                                </div>

                                <div className="ig-post__info">
                                    <div className="ig-likes">{post.likes + post.downvotes + post.reblogs} likes</div>
                                    <div className="ig-caption"><strong>{post.author.username}</strong> {post.content}</div>
                                    {post.comments > 0 && <div className="ig-comments-link">View all {post.comments} comments</div>}
                                    <div className="ig-timestamp">{new Date(post.createdAt).toLocaleDateString()}</div>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                )}
            </main>

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
