/**
 * 🎉 Register Page - Join the Jamii Adventure!
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords don\'t match! 🤔')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password needs at least 6 characters! 🔐')
      return
    }
    
    setLoading(true)
    
    try {
      await register({ 
        username: formData.name, 
        email: formData.email, 
        password: formData.password, 
        profile: { location: formData.location }
      })
      navigate('/login', { 
        state: { message: '🎉 Welcome to JamiiLink! Please login to start exploring.' } 
      })
    } catch (err) {
      setError('Registration failed - please try again! 😢')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page" role="main" aria-label="Register">
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-header">
          <span className="auth-emoji">🎈</span>
          <h1>Join the Jamii! 🌟</h1>
          <p>Start your community adventure today!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name 👤</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your awesome name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email 📧</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@jamiilink.co.ke"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Location 🌍</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Nairobi, Kenya"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Password 🔐</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Secret code"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm 🔒</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat code"
                required
              />
            </div>
          </div>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ❌ {error}
            </motion.div>
          )}
          
          <motion.button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating Magic... ✨' : 'Join JamiiLink 🚀'}
          </motion.button>
        </form>
        
        <div className="auth-footer">
          <p>Already a member? <Link to="/login">Welcome back! 👋</Link></p>
        </div>
      </motion.div>
    </main>
  )
}