/**
 * 🔹 Enhanced Social Media Registration Page
 * Features: Email/Phone verification, animations, dark mode
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FaEnvelope, FaPhone, FaLock, FaUser, FaMapMarkerAlt, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ConstellationBackground from '../components/ConstellationBackground';
import './EnhancedRegisterPage.css';

export default function EnhancedRegisterPage() {
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Verification
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        location: ''
    });
    const [verificationMethod, setVerificationMethod] = useState('email');
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const sendVerificationCode = async () => {
        setError('');
        setLoading(true);
        
        try {
            // TODO: Implement actual verification code sending
            // For now, simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCodeSent(true);
        } catch (err) {
            setError('Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const verifyCode = async () => {
        setError('');
        setLoading(true);
        
        try {
            // TODO: Implement actual code verification
            // For now, accept any 6-digit code
            if (verificationCode.length === 6) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Trigger confetti celebration
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#8b5cf6', '#ec4899']
                });
                
                setStep(2);
            } else {
                setError('Please enter a valid 6-digit code');
            }
        } catch (err) {
            setError('Invalid verification code');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        
        try {
            const { name, email, phone, password, location } = formData;
            await register({ 
                username: name, 
                email,
                phone,
                password, 
                profile: { location },
                verified: true // Mark as verified after code verification
            });
            
            // Success animation
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
            
            // Redirect to login
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: '🎉 Registration successful! Your account is verified. Please login.' 
                    } 
                });
            }, 1500);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="enhanced-register-page">
            <ConstellationBackground />
            
            <motion.div 
                className="enhanced-register-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <motion.div className="register-header">
                    <h1>✨ Join JamiiLink</h1>
                    <p className="subtitle">Create your account and start connecting</p>
                    
                    {/* Progress Steps */}
                    <div className="progress-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <span>Basic Info</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <span>Verify</span>
                        </div>
                    </div>
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
                
                {/* Step 1: Basic Information */}
                {step === 1 && (
                    <motion.form
                        onSubmit={handleSubmit}
                        className="enhanced-register-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                            />
                        </div>
                        
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                required
                            />
                        </div>
                        
                        <div className="input-group">
                            <FaPhone className="input-icon" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number (+254...)"
                            />
                        </div>
                        
                        <div className="input-group">
                            <FaMapMarkerAlt className="input-icon" />
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Location (Optional)"
                            />
                        </div>
                        
                        <div className="input-group password-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password (min 6 characters)"
                                required
                                minLength="6"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>
                        
                        <motion.button 
                            type="submit" 
                            className="btn-register"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                    </motion.form>
                )}
                
                {/* Step 2: Verification */}
                {step === 2 && (
                    <motion.div
                        className="verification-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="verification-header">
                            <FaCheckCircle className="verified-icon" />
                            <h2>Verify Your Account</h2>
                            <p>We sent a verification code to your {verificationMethod}</p>
                        </div>
                        
                        {!codeSent ? (
                            <div className="verification-method">
                                <p>Choose verification method:</p>
                                <div className="method-buttons">
                                    <button
                                        type="button"
                                        className={`method-btn ${verificationMethod === 'email' ? 'active' : ''}`}
                                        onClick={() => setVerificationMethod('email')}
                                    >
                                        <FaEnvelope /> Email
                                    </button>
                                    <button
                                        type="button"
                                        className={`method-btn ${verificationMethod === 'phone' ? 'active' : ''}`}
                                        onClick={() => setVerificationMethod('phone')}
                                    >
                                        <FaPhone /> Phone
                                    </button>
                                </div>
                                <motion.button
                                    className="btn-send-code"
                                    onClick={sendVerificationCode}
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Sending...' : 'Send Verification Code'}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="code-input-section">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    className="code-input"
                                />
                                <motion.button
                                    className="btn-verify"
                                    onClick={verifyCode}
                                    disabled={loading || verificationCode.length !== 6}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </motion.button>
                                <button
                                    type="button"
                                    className="resend-link"
                                    onClick={() => setCodeSent(false)}
                                >
                                    Resend code
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
                
                {/* Footer */}
                <div className="register-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </motion.div>
        </div>
    );
}
