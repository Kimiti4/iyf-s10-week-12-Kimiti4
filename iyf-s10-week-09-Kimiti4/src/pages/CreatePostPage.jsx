/**
 * ✍️ Create Post Page - With Offline Support!
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { queueOfflinePost, isOnline } from '../utils/offlinePost'
import { useOrganization } from '../context/OrganizationContext'
import { useToast } from '../components/Toast'
import { validatePost, sanitizeInput } from '../utils/validation'
import { motion } from 'framer-motion'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { currentOrg } = useOrganization()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'all',
    location: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOfflineMode, setIsOfflineMode] = useState(!isOnline())
  const [pendingQueue, setPendingQueue] = useState(0)

  const categories = [
    { value: 'all', label: '🏠 For You (General)' },
    { value: 'mtaani', label: '🔔 Mtaani Alerts' },
    { value: 'skills', label: '🤝 Skill Swaps' },
    { value: 'farm', label: '🌱 Farm Market' },
    { value: 'gigs', label: '💼 Gig Economy' }
  ]

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOfflineMode(!isOnline())
    }
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFormErrors({})
    setLoading(true)

    const sanitizedData = {
      ...formData,
      title: sanitizeInput(formData.title.trim()),
      content: sanitizeInput(formData.content.trim()),
      location: formData.location ? sanitizeInput(formData.location.trim()) : ''
    }

    const validation = validatePost(sanitizedData)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      setError('Please fix the errors below ✋')
      setLoading(false)
      return
    }

    try {
      if (isOnline()) {
        // Try online submission
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitizedData)
        })
        
        if (response.ok) {
          toast.success('Post published successfully! 🎉')
          if (currentOrg) navigate(`/org/${currentOrg.slug}`)
          else navigate('/posts')
        } else {
          throw new Error('Failed to create post')
        }
      } else {
        // Queue for offline submission
        await queueOfflinePost(sanitizedData)
        setPendingQueue(pendingQueue + 1)
        toast.success(`Post saved! 📭 It will send when you're back online.`)
        navigate(-1)
      }
    } catch (err) {
      // Fallback to offline queue on error
      await queueOfflinePost(sanitizedData)
      setPendingQueue(pendingQueue + 1)
      toast.success(`Saved for later! 📭 Will send when online.`)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-post-page">
      <motion.div 
        className="container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>✍️ Create New Post</h1>
        
        {currentOrg && (
          <div className="org-badge-banner">
            <span className="org-badge-icon">
              {{
                school: '🏫', university: '🎓', estate: '🏘️',
                church: '⛪', ngo: '🤝', sme: '💼',
                coworking: '🏢', community: '👥', youth_group: '🌟',
                professional: '💼'
              }[currentOrg.type] || '🏢'}
            </span>
            <span>Posting to: <strong>{currentOrg.name}</strong></span>
          </div>
        )}

        {isOfflineMode && (
          <div className="offline-warning">
            📴 You're offline - your post will be queued and sent later
          </div>
        )}

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ❌ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Title 📝</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's happening? (5-200 chars)"
              maxLength="200"
              required
            />
          </div>

          <div className="form-group">
            <label>Category 🏷️</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Location 🌍 (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Where is this happening?"
            />
          </div>

          <div className="form-group">
            <label>Details 📄</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              placeholder="Share details with your community..."
              maxLength="5000"
              required
            />
            <small>{formData.content.length}/5000 characters</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <motion.button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Saving... ⏳' : isOfflineMode ? 'Save Offline 📥' : 'Publish 🚀'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}