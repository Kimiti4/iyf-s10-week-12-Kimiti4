/**
 * 🔹 Enhanced Social Media Registration Page
 * Features: Email/Phone verification, animations, dark mode
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FaEnvelope, FaPhone, FaLock, FaUser, FaMapMarkerAlt, FaEye, FaEyeSlash, FaCheckCircle, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { validateRegistration, sanitizeInput } from '../../utils/validation';
import ConstellationBackground from '../components/ConstellationBackground';
import api from '../../services/api';
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
    const [formErrors, setFormErrors] = useState({});
    const [verificationMethod, setVerificationMethod] = useState('email');
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [totpSecret, setTotpSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };
    
    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        setFormErrors({});
        
        const sanitizedData = {
            ...formData,
            name: sanitizeInput(formData.name),
            email: formData.email.trim().toLowerCase(),
            location: sanitizeInput(formData.location)
        };
        
        const validation = validateRegistration({
            username: sanitizedData.name,
            email: sanitizedData.email,
            password: sanitizedData.password,
            confirmPassword: sanitizedData.confirmPassword
        });
        
        if (!validation.valid) {
            setFormErrors(validation.errors);
            setError('Please fix the errors below');
            return;
        }
        
        setStep(2);
    };

    const sendVerificationCode = async () => {
        setError('');
        setLoading(true);
        
        try {
            const contact = verificationMethod === 'phone' ? formData.phone : formData.email;
            const response = await api.auth.sendVerification({ method: verificationMethod, contact });
            
            if (verificationMethod === 'totp' && response.data?.secret) {
                setTotpSecret(response.data.secret);
                setQrCodeUrl(response.data.qrCode);
            }
            
            setCodeSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const verifyCodeAndRegister = async () => {
        setError('');
        setLoading(true);
        
        try {
            // 1. Verify Code
            const contact = verificationMethod === 'phone' ? formData.phone : formData.email;
            await api.auth.verifyCode({
                method: verificationMethod,
                contact,
                code: verificationCode,
                secret: totpSecret
            });
            
            // 2. Actually Register User
            await register({ 
                username: formData.name, 
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone,
                password: formData.password, 
                profile: { location: formData.location },
                verified: true
            });
            
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
            
            setTimeout(() => {
                navigate('/login', { 
                    state: { message: '🎉 Registration successful! Your account is verified. Please login.' } 
                });
            }, 1500);
            
        } catch (err) {
            setError(err.message || 'Invalid verification code or registration failed');
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
                <motion.div className="register-header">
                    <h1>✨ Join JamiiLink</h1>
                    <p className="subtitle">Create your account and start connecting</p>
                    
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
                
                {step === 1 && (
                    <motion.form
                        onSubmit={handleNextStep}
                        className="enhanced-register-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="input-group">
                            <FaUser className="input-icon" aria-hidden="true" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                                className={formErrors.username ? 'input-error' : ''}
                                aria-label="Full name"
                            />
                            {formErrors.username && <span className="field-error">{formErrors.username}</span>}
                        </div>
                        
                        <div className="input-group">
                            <FaEnvelope className="input-icon" aria-hidden="true" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                required
                                className={formErrors.email ? 'input-error' : ''}
                                aria-label="Email address"
                            />
                            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                        </div>
                        
                        <div className="input-group">
                            <FaPhone className="input-icon" aria-hidden="true" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number (+254...)"
                                aria-label="Phone number"
                            />
                        </div>
                        
                        <div className="input-group">
                            <FaMapMarkerAlt className="input-icon" aria-hidden="true" />
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Location (Optional)"
                                aria-label="Location"
                            />
                        </div>
                        
                        <div className="input-group password-group">
                            <FaLock className="input-icon" aria-hidden="true" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password (min 8 characters)"
                                required
                                minLength="8"
                                className={formErrors.password ? 'input-error' : ''}
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {formErrors.password && <span className="field-error">{formErrors.password}</span>}
                        </div>
                        
                        <div className="input-group">
                            <FaLock className="input-icon" aria-hidden="true" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                required
                                className={formErrors.confirmPassword ? 'input-error' : ''}
                                aria-label="Confirm password"
                            />
                            {formErrors.confirmPassword && <span className="field-error">{formErrors.confirmPassword}</span>}
                        </div>
                        
                        <motion.button 
                            type="submit" 
                            className="btn-register"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Next: Verification
                        </motion.button>
                    </motion.form>
                )}
                
                {step === 2 && (
                    <motion.div
                        className="verification-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="verification-header">
                            <FaCheckCircle className="verified-icon" />
                            <h2>Verify Your Account</h2>
                            <p>Choose a method to secure your account</p>
                        </div>
                        
                        {!codeSent ? (
                            <div className="verification-method">
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
                                        <FaPhone /> Messaging
                                    </button>
                                    <button
                                        type="button"
                                        className={`method-btn ${verificationMethod === 'totp' ? 'active' : ''}`}
                                        onClick={() => setVerificationMethod('totp')}
                                    >
                                        <FaQrcode /> Authenticator
                                    </button>
                                </div>
                                <motion.button
                                    className="btn-send-code"
                                    onClick={sendVerificationCode}
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Processing...' : (verificationMethod === 'totp' ? 'Generate QR Code' : 'Send Code')}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="code-input-section">
                                {verificationMethod === 'totp' && qrCodeUrl && (
                                    <div className="totp-setup">
                                        <p>Scan this QR code with Google Authenticator or Authy:</p>
                                        <img src={qrCodeUrl} alt="TOTP QR Code" className="qr-code" />
                                    </div>
                                )}
                                
                                {verificationMethod !== 'totp' && (
                                    <p>Enter the 6-digit code sent to your {verificationMethod}</p>
                                )}
                                
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    className="code-input"
                                    aria-label="Verification code"
                                />
                                <motion.button
                                    className="btn-verify"
                                    onClick={verifyCodeAndRegister}
                                    disabled={loading || verificationCode.length !== 6}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Verifying & Registering...' : 'Verify & Create Account'}
                                </motion.button>
                                <button
                                    type="button"
                                    className="resend-link"
                                    onClick={() => {
                                        setCodeSent(false);
                                        setVerificationCode('');
                                        setQrCodeUrl('');
                                    }}
                                >
                                    Change method / Resend
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
                
                <div className="register-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </motion.div>
        </div>
    );
}
