/**
 * 🔍 Search Results - Find Your Treasure!
 */

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])
  
  const performSearch = async (searchQuery) => {
    try {
      setLoading(true)
      setError('')
      
      const mockResults = [
        {
          _id: 1,
          title: `Fresh tomatoes from ${query || 'Kiambu'}`,
          content: 'Amazing organic tomatoes available!',
          category: 'farm',
          author: { name: 'Farmer John' },
          createdAt: Date.now() - 86400000
        }
      ]
      
      setResults(mockResults)
    } catch (err) {
      setError('Search failed - let\'s try again! 😅')
    } finally {
      setLoading(false)
    }
  }

  if (!query) {
    return (
      <motion.div 
        className="search-no-query"
        aria-live="polite"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h2>What are you looking for? 🤔</h2>
          <p>Enter keywords to discover posts in your Jamii!</p>
          <Link to="/posts" className="btn-primary">Browse All Posts 🌟</Link>
        </div>
      </motion.div>
    )
  }

  return (
    <main className="search-results-page" role="main" aria-label="Search results">
      <motion.div 
        className="search-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🔍 Search Results</h1>
        <p>Looking for: "<strong>{query}</strong>"</p>
      </motion.div>

      {loading && (
        <motion.div 
          className="loading-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner"></div>
          <p>Hunting for treasures... 🏴‍☠️</p>
        </motion.div>
      )}

      {error && (
        <motion.div 
          className="error-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>😢 {error}</p>
        </motion.div>
      )}

      {!loading && !error && (
        <AnimatePresence>
          {results.length === 0 ? (
            <motion.div 
              className="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="empty-illustration">📭</div>
              <h3>No treasures found! 🏴‍☠️</h3>
              <p>Try different keywords and search again</p>
              <Link to="/posts" className="btn-secondary">Browse All Posts</Link>
            </motion.div>
          ) : (
            <motion.div 
              className="results-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {results.map((post, idx) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={`/posts/${post._id}`} className="result-card">
                    <h3>{post.title}</h3>
                    <p className="result-preview">{post.content.substring(0, 120)}...</p>
                    <div className="result-meta">
                      <span>👤 {post.author?.name}</span>
                      <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className="result-category">{post.category}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
  )
}