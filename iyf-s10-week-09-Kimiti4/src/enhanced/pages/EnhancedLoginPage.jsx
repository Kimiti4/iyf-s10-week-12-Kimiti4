/**
 * 🔹 Enhanced Social Media Login Page
 * Features: Email/Phone verification, dark mode, constellation background, animations
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ConstellationBackground from '../components/ConstellationBackground';
import './EnhancedLoginPage.css';

export default function EnhancedLoginPage() {
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const credentials = loginMethod === 'email' 
                ? { email, password }
                : { phone, password };
            
            await login(credentials);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSocialLogin = (provider) => {
        // TODO: Implement OAuth
        alert(`${provider} login coming soon!`);
    };
    
    return (
        <div className="enhanced-login-page">
            <ConstellationBackground />
            
            <motion.div 
                className="enhanced-login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <motion.div 
                    className="login-header"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1>🌟 JamiiLink</h1>
                    <p className="tagline">Connect. Share. Inspire.</p>
                </motion.div>
                
                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            className="error-message"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Login Method Toggle */}
                <div className="login-method-toggle">
                    <button
                        type="button"
                        className={`toggle-btn ${loginMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('email')}
                    >
                        <FaEnvelope /> Email
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('phone')}
                    >
                        <FaPhone /> Phone
                    </button>
                </div>
                
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="enhanced-login-form">
                    <AnimatePresence mode="wait">
                        {loginMethod === 'email' ? (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="input-group"
                            >
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    required
                                    autoComplete="email"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="phone"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="input-group"
                            >
                                <FaPhone className="input-icon" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Phone number (+254...)"
                                    required
                                    autoComplete="tel"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="input-group password-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    
                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-link">
                            Forgot password?
                        </Link>
                    </div>
                    
                    <motion.button 
                        type="submit" 
                        className="btn-login"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <span className="loading-spinner">Logging in...</span>
                        ) : (
                            'Login'
                        )}
                    </motion.button>
                </form>
                
                {/* Divider */}
                <div className="divider">
                    <span>or continue with</span>
                </div>
                
                {/* Social Login */}
                <div className="social-login">
                    <motion.button
                        className="social-btn google"
                        onClick={() => handleSocialLogin('Google')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaGoogle /> Google
                    </motion.button>
                    <motion.button
                        className="social-btn facebook"
                        onClick={() => handleSocialLogin('Facebook')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaFacebook /> Facebook
                    </motion.button>
                    <motion.button
                        className="social-btn twitter"
                        onClick={() => handleSocialLogin('Twitter')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaTwitter /> Twitter
                    </motion.button>
                </div>
                
                {/* Footer */}
                <div className="login-footer">
                    <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                </div>
            </motion.div>
        </div>
    );
}
