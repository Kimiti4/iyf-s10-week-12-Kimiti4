/**
 * Create Post — online publish + offline queue (IndexedDB)
 * Categories match backend validatePost: mtaani | skill | farm | gig | alert
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { queueOfflinePost, isOnline } from '../utils/offlinePost'
import { postsAPI } from '../services/api'
import { useOrganization } from '../context/OrganizationContext'
import { useToast } from '../components/Toast'
import { validatePost, sanitizeInput } from '../utils/validation'
import PageHeader from '../components/primitives/PageHeader'
import { motion } from 'framer-motion'

const CATEGORIES = [
  { value: 'mtaani', label: 'Mtaani / neighborhood' },
  { value: 'skill', label: 'Skill swap' },
  { value: 'farm', label: 'Farm & market' },
  { value: 'gig', label: 'Gigs' },
  { value: 'alert', label: 'Alert / notice' },
]

const ORG_ICONS = {
  school: '🏫',
  university: '🎓',
  estate: '🏘️',
  church: '⛪',
  ngo: '🤝',
  sme: '💼',
  coworking: '🏢',
  community: '👥',
  youth_group: '🌟',
  professional: '💼',
}

export default function CreatePostPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { currentOrg } = useOrganization()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'mtaani',
    location: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOfflineMode, setIsOfflineMode] = useState(!isOnline())

  useEffect(() => {
    const updateOnlineStatus = () => setIsOfflineMode(!isOnline())
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
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
      location: formData.location ? sanitizeInput(formData.location.trim()) : '',
      category: formData.category,
    }

    const validation = validatePost(sanitizedData)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      setError('Please fix the errors below')
      setLoading(false)
      return
    }

    try {
      if (!isOnline()) {
        await queueOfflinePost(sanitizedData)
        toast.success('Post saved offline. It will publish when you reconnect.')
        navigate('/drafts')
      } else {
        await postsAPI.create(sanitizedData)
        toast.success('Post published')
        if (currentOrg) navigate(`/org/${currentOrg.slug}`)
        else navigate('/')
      }
    } catch (err) {
      setError(err?.message || 'Failed to publish the post.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="create-post-page" role="main" aria-label="Create post">
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader
          eyebrow="Compose"
          title="Create post"
          subtitle="Share updates with your jamii"
          actions={
            <Link to="/drafts" className="btn btn-ghost">
              View drafts
            </Link>
          }
        />

        {currentOrg && (
          <div className="org-badge-banner" role="status">
            <span className="org-badge-icon" aria-hidden="true">
              {ORG_ICONS[currentOrg.type] || '🏢'}
            </span>
            <span>
              Posting to <strong>{currentOrg.name}</strong>
            </span>
          </div>
        )}

        {isOfflineMode && (
          <div className="offline-warning" role="status">
            You are offline. This post will be queued and sent when you reconnect.
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-post-form" noValidate>
          <div className="form-group">
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What’s happening? (5–200 characters)"
              maxLength={200}
              required
              disabled={loading}
              aria-invalid={!!formErrors.title}
              aria-describedby={formErrors.title ? 'post-title-error' : undefined}
            />
            {formErrors.title && (
              <p id="post-title-error" className="field-error">
                {formErrors.title}
              </p>
            )}
            <small className="field-hint">{formData.title.length}/200</small>
          </div>

          <div className="form-group">
            <label htmlFor="post-category">Category</label>
            <select
              id="post-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={!!formErrors.category}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="field-error">{formErrors.category}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="post-location">Location (optional)</label>
            <input
              id="post-location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Neighborhood or area"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-content">Details</label>
            <textarea
              id="post-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              placeholder="Share details with your community…"
              maxLength={5000}
              required
              disabled={loading}
              aria-invalid={!!formErrors.content}
              aria-describedby={formErrors.content ? 'post-content-error' : 'post-content-hint'}
            />
            {formErrors.content && (
              <p id="post-content-error" className="field-error">
                {formErrors.content}
              </p>
            )}
            <small id="post-content-hint" className="field-hint">
              {formData.content.length}/5000
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? isOfflineMode
                  ? 'Saving…'
                  : 'Publishing…'
                : isOfflineMode
                  ? 'Save offline'
                  : 'Publish'}
            </button>
          </div>
        </form>
      </motion.div>
    </main>
  )
}
