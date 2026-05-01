/**
 * 🔹 Enhanced Social Media Feed Page
 * Features: Dark mode, constellation background, animated posts
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConstellationBackground from '../components/ConstellationBackground';
import EnhancedPostCard from '../components/EnhancedPostCard';
import './EnhancedFeedPage.css';

export default function EnhancedFeedPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Mock data for demonstration
    useEffect(() => {
        const mockPosts = [
            {
                id: '1',
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
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'
            },
            {
                id: '2',
                title: 'Tips for Building Strong Communities',
                content: 'Here are my top 5 tips for creating engaged online communities:\n\n1. Be authentic and transparent\n2. Encourage meaningful conversations\n3. Celebrate member achievements\n4. Create regular engagement opportunities\n5. Listen and adapt to feedback\n\nWhat would you add?',
                author: {
                    username: 'CommunityBuilder',
                    avatar: '/user-avatar.png'
                },
                verified: false,
                likes: 128,
                downvotes: 5,
                reblogs: 34,
                comments: 28,
                tags: ['Tips', 'Community', 'Engagement'],
                createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
                id: '3',
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
                createdAt: new Date(Date.now() - 10800000).toISOString(),
                image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800'
            }
        ];
        
        setTimeout(() => {
            setPosts(mockPosts);
            setLoading(false);
        }, 500);
    }, []);
    
    return (
        <div className="enhanced-feed-page">
            <ConstellationBackground />
            
            {/* Header */}
            <motion.header 
                className="feed-header"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1>🌟 JamiiLink Feed</h1>
                <p>Discover what's happening in your community</p>
            </motion.header>
            
            {/* Posts Feed */}
            <main className="feed-content">
                {loading ? (
                    <div className="loading-posts">
                        <div className="loading-spinner"></div>
                        <p>Loading posts...</p>
                    </div>
                ) : (
                    <div className="posts-container">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <EnhancedPostCard post={post} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
