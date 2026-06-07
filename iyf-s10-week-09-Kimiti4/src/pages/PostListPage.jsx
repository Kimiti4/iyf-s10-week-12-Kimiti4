/**
 * 📰 Community Posts Feed - Where Stories Come Alive!
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function PostListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  
  const filters = [
    { id: 'all', label: '🌟 All Posts', color: colors.primary[500] },
    { id: 'farm', label: '🌾 Farm', color: colors.success },
    { id: 'skill', label: '🎯 Skills', color: colors.accent[500] },
    { id: 'gig', label: '💼 Gigs', color: '#667eea' },
    { id: 'mtaani', label: '🏘️ Alerts', color: colors.danger }
  ]
  
  useEffect(() => {
    fetchPosts()
  }, [])
  
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const mockPosts = [
        {
          id: 1,
          title: 'Fresh Organic Tomatoes - Straight from Kiambu Farm! 🍅',
          content: 'I have fresh organic tomatoes from my farm in Kiambu. Available in bulk quantities at affordable prices. Perfect for your family meals or restaurant supply!',
          category: 'farm',
          likes: 12,
          author: 'John Kamau',
          avatar: '👨‍🌾',
          location: 'Kiambu',
          price: 'KSh 400/kg'
        },
        {
          id: 2,
          title: '🚀 Web Developer Needed - Exchange for Carpentry Skills!',
          content: 'Need a web developer to build a small business website. Can offer carpentry skills in exchange - custom furniture anyone? 🤝',
          category: 'skill',
          likes: 8,
          author: 'Mary Wanjiku',
          avatar: '👩‍💻',
          location: 'Nairobi'
        },
        {
          id: 3,
          title: '⚠️ Water Interruption Alert - Kibera Zone 2 Tomorrow',
          content: 'Expected water interruption tomorrow from 8am to 4pm for maintenance. Please store water in advance. Thank you for your understanding! 🙏',
          category: 'mtaani',
          likes: 25,
          author: 'Community Admin',
          avatar: '👮‍♀️',
          location: 'Kibera',
          urgent: true
        },
        {
          id: 4,
          title: '📚 Mathematics Tutor Needed - Weekend Classes Available!',
          content: 'Looking for mathematics tutor for high school students. Weekend classes, competitive pay. Perfect for education enthusiasts! ⭐',
          category: 'gig',
          likes: 15,
          author: 'Jane Akinyi',
          avatar: '👩‍🏫',
          location: 'Westlands'
        }
      ]
      
      setPosts(mockPosts)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.category === activeFilter)
  
  if (loading) {
    return (
      <motion.div 
        className="loading-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading community stories...</p>
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
        <p>Oops! Something went wrong: {error}</p>
        <button onClick={fetchPosts} className="btn-primary">Try Again</button>
      </motion.div>
    )
  }
  
  return (
    <div className="post-list-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>📰 Community Feed</h2>
        <p>Stories, updates, and opportunities from your neighbors</p>
      </motion.div>
      
      <motion.div 
        className="filter-bar"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              backgroundColor: activeFilter === filter.id ? filter.color : 'transparent',
              borderColor: filter.color
            }}
          >
            {filter.label}
          </motion.button>
        ))}
      </motion.div>
      
      <AnimatePresence>
        {filteredPosts.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-illustration">📭</div>
            <h3>No posts here yet!</h3>
            <p>Be the first to share something amazing with the community</p>
            <Link to="/create-post" className="btn-primary">Create First Post</Link>
          </motion.div>
        ) : (
          <motion.div 
            className="posts-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              >
                <Link to={`/posts/${post.id}`} className="post-card">
                  <div className="post-header">
                    <span className="post-avatar">{post.avatar}</span>
                    <div className="post-meta-info">
                      <span className="post-author">{post.author}</span>
                      <span className="post-location">📍 {post.location}</span>
                    </div>
                    {post.urgent && (
                      <span className="urgent-badge">🔴 Urgent
                    </span>
                    )}
                  </div>
                  
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-preview">
                    {post.content.substring(0, 120)}...
                  </p>
                  
                  {post.price && (
                    <div className="post-price">
                      <span>💰 {post.price}</span>
                    </div>
                  )}
                  
                  <div className="post-footer">
                    <span className="post-category">{post.category}</span>
                    <span className="post-likes">❤️ {post.likes}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}