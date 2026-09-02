/**
 * 🔐 Login Page - Welcome Back to the Jamii!
 */

import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError('Wrong credentials - try our demo account! 🎯')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page" role="main" aria-label="Login">
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-header">
          <span className="auth-emoji">👋</span>
          <h2>Welcome Back! 🌟</h2>
          <p className="auth-subtitle">Ready to reconnect with your Jamii?</p>
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
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address 📧</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@jamiilink.co.ke"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password 🔒</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your secret code"
              required
            />
          </div>
          
          <motion.button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Logging in... ⏳' : 'Login 🚀'}
          </motion.button>
        </form>
        
        <div className="auth-footer">
          <p>New to JamiiLink? <Link to="/register">Join the adventure! 🎉</Link></p>
        </div>
        
        <div className="demo-credentials">
          <p>🎯 Demo: demo@jamiilink.co.ke / demo123</p>
        </div>
      </motion.div>
    </main>
  )
}