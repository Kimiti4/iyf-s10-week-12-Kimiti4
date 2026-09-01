/**
 * 📬 Offline Posts API - Background Sync Endpoint
 */

const express = require('express')
const router = express.Router()

// POST /api/posts - Create post (with offline support)
router.post('/', async (req, res) => {
  try {
    const { title, content, category, location, isOffline } = req.body
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' })
    }
    
    // For now, log the post (in production, save to database)
    const post = {
      id: `post_${Date.now()}`,
      title,
      content,
      category,
      location,
      author: req.user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      likes: 0
    }
    
    // Post synced (offline posts handled silently)
    
    // Simulate database save
    res.status(201).json({
      success: true,
      data: post
    })
  } catch {
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// GET /api/posts - Get posts with offline awareness
router.get('/', async (req, res) => {
  try {
    const mockPosts = [
      {
        id: 1,
        title: 'Fresh Tomatoes Available! 🍅',
        content: 'Farm fresh organic tomatoes...',
        category: 'farm',
        author: 'John Kamau',
        createdAt: new Date().toISOString(),
        likes: 12
      }
    ]
    
    res.json({
      success: true,
      data: mockPosts
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

module.exports = router