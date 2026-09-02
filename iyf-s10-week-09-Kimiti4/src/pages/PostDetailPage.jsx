/**
 * 📖 Post Detail - Dive Into the Story!
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function PostDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(true)
  
  useEffect(() => {
    const mockPost = {
      id: parseInt(id),
      title: 'Fresh Organic Tomatoes - Straight from Kiambu Farm! 🍅',
      content: `I have fresh organic tomatoes from my farm in Kiambu. Available in bulk quantities at affordable prices. 

The tomatoes are freshly harvested and ready for market. I can deliver to Nairobi CBD area for orders above 50kg. Each tomato is grown without pesticides using natural farming methods passed down through generations in my family.

Perfect for:
• Family meals and cooking
• Restaurant supply
• Juice making
• Canning and preserving

Fresh harvest available every morning from 6am. Delivery within Nairobi same day. Order now and taste the difference of truly fresh produce!`,
      category: 'farm',
      likes: 12,
      author: 'John Kamau',
      location: 'Kiambu',
      createdAt: Date.now() - 86400000 * 2,
      price: 'KSh 400/kg',
      authorAvatar: '👨‍🌾'
    }
    
    setTimeout(() => {
      setPost(mockPost)
      setLoading(false)
    }, 500)
  }, [id])
  
  if (loading) {
    return (
      <motion.div 
        className="loading-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading the story... 📚</p>
      </motion.div>
    )
  }
  
  if (!post) {
    return (
      <motion.div 
        className="error-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p>Post not found 🧐</p>
        <Link to="/posts" className="btn-secondary">Back to Feed</Link>
      </motion.div>
    )
  }
  
  return (
    <main className="post-detail-page" role="main" aria-label="Post detail">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link to="/posts" className="back-link">← Back to Community Feed</Link>
      </motion.div>
      
      <motion.article 
        className="post-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <header className="post-header">
          <span className="category-badge">{post.category}</span>
          <h1 className="post-title">{post.title}</h1>
          
          <div className="post-author-info">
            <span className="author-avatar">{post.authorAvatar}</span>
            <div className="author-details">
              <span className="author-name">By {post.author}</span>
              <span className="post-meta">
                📍 {post.location} • 📅 {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {post.price && (
            <motion.div 
              className="price-tag"
              whileHover={{ scale: 1.05 }}
            >
              💰 {post.price}
            </motion.div>
          )}
        </header>
        
        <div className="post-content">
          {post.content.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
        
        <motion.div 
          className="post-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button 
            className="btn-like"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ❤️ Like ({post.likes})
          </motion.button>
          <motion.button 
            className="btn-comment"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(!showComments)}
          >
            💬 Comments
          </motion.button>
          <motion.button 
            className="btn-share"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 Share
          </motion.button>
        </motion.div>
      </motion.article>
      
      <AnimatePresence>
        {showComments && (
          <motion.div 
            className="comments-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2>💬 Join the Conversation!</h2>
            
            <div className="comment-form">
              <textarea 
                placeholder="Share your thoughts... What do you think about this?"
                rows="3"
              />
              <button className="btn-primary">Post Comment</button>
            </div>
            
            <div className="comments-list">
              <div className="comment">
                <span className="comment-author">Sarah M.</span>
                <p>These tomatoes look amazing! How fresh are they exactly?</p>
                <span className="comment-time">2 hours ago</span>
              </div>
              <div className="comment">
                <span className="comment-author">Mike K.</span>
                <p>Can you deliver to Westlands area? Very interested!</p>
                <span className="comment-time">5 hours ago</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}