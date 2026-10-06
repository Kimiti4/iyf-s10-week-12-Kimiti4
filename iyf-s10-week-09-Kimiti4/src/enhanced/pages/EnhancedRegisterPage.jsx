import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaMailBulk } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { validateRegistration, sanitizeInput } from '../../utils/validation';
import api from '../../services/api';
import './EnhancedRegisterPage.css';

export default function EnhancedRegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', location: '' });
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const update = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

    const continueToVerification = (e) => {
        e.preventDefault();
        setError('');
        setNotice('');
        const data = {
            username: sanitizeInput(formData.name.trim()),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            confirmPassword: formData.confirmPassword
        };
        const validation = validateRegistration(data);
        if (!validation.valid) {
            setFormErrors(validation.errors);
            setError('Please correct the highlighted fields.');
            return;
        }
        setFormErrors({});
        setStep(2);
    };

    const sendCode = async () => {
        setError('');
        setNotice('');
        setLoading(true);
        try {
            const response = await api.auth.sendVerification({
                method: 'email',
                contact: formData.email.trim().toLowerCase(),
                purpose: 'email'
            });
            if (response.deliveryStatus !== 'delivered' && response.deliveryStatus !== 'noop') {
                throw new Error(response.reason || 'Email verification is not currently available.');
            }
            setCodeSent(true);
            setNotice('Verification code sent. Check your email; the code expires in 10 minutes.');
        } catch (err) {
            setError(err?.message || 'We could not send the verification email.');
        } finally {
            setLoading(false);
        }
    };

    const verifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.auth.verifyCode({
                method: 'email',
                contact: formData.email.trim().toLowerCase(),
                code: verificationCode,
                purpose: 'email'
            });
            await register({
                username: sanitizeInput(formData.name.trim()),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                profile: { location: formData.location.trim() },
                verified: true
            });
            navigate('/', { replace: true });
        } catch (err) {
            setError(err?.message || 'Verification failed. Please check the code and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="enhanced-register-page" aria-label="Create account">
            <motion.div className="enhanced-register-container" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="register-header">
                    <div className="auth-brand-mark" aria-hidden="true">J</div>
                    <p className="auth-eyebrow">JAMIILINK</p>
                    <h1>Join JamiiLink</h1>
                    <p className="subtitle">Join a community built around useful local connection.</p>
                    <div className="progress-steps" aria-label={`Step ${step} of 2`}>
                        <div className={`step ${step >= 1 ? 'active' : ''}`}><div className="step-number">1</div><span>Your details</span></div>
                        <div className="step-line" />
                        <div className={`step ${step >= 2 ? 'active' : ''}`}><div className="step-number">2</div><span>Verify email</span></div>
                    </div>
                </div>

                {error && <div className="error-message" role="alert">{error}</div>}
                {notice && <div className="form-notice" role="status">{notice}</div>}

                {step === 1 ? (
                    <form onSubmit={continueToVerification} className="enhanced-register-form">
                        <label className="auth-field"><span>Full name</span><input type="text" value={formData.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" required autoComplete="name" aria-label="Full name" /></label>
                        <label className="auth-field"><span>Email address</span><input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required autoComplete="email" aria-label="Email address" /></label>
                        <label className="auth-field"><span>Location <em>optional</em></span><input type="text" value={formData.location} onChange={(e) => update('location', e.target.value)} placeholder="Nairobi, Kenya" autoComplete="address-level2" aria-label="Location" /></label>
                        <label className="auth-field"><span>Password</span><div className="input-group password-group"><input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 8 characters" required minLength="8" autoComplete="new-password" aria-label="Password" /><button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div></label>
                        <label className="auth-field"><span>Confirm password</span><input type="password" value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Repeat your password" required autoComplete="new-password" aria-label="Confirm password" /></label>
                        <button type="submit" className="btn-register">Continue</button>
                    </form>
                ) : (
                    <form onSubmit={verifyAndRegister} className="enhanced-register-form">
                        <div className="verification-header"><FaMailBulk className="verified-icon" /><h2>Verify your email</h2><p>We use email verification to reduce fake accounts and protect the community.</p></div>
                        {!codeSent ? (
                            <button type="button" className="btn-send-code" onClick={sendCode} disabled={loading}>{loading ? 'Sending…' : 'Send verification code'}</button>
                        ) : (
                            <>
                                <label className="auth-field"><span>6-digit verification code</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" required aria-label="Verification code" /></label>
                                <button type="submit" className="btn-register" disabled={loading || verificationCode.length !== 6}>{loading ? 'Creating account…' : 'Verify and create account'}</button>
                                <button type="button" className="auth-back-link" onClick={sendCode} disabled={loading}>Resend code</button>
                            </>
                        )}
                        <button type="button" className="auth-back-link" onClick={() => setStep(1)}><FaArrowLeft /> Change details</button>
                    </form>
                )}

                <div className="auth-trust"><FaCheckCircle aria-hidden="true" /><span>Your password is never sent by email.</span></div>
                <div className="register-footer"><p>Already have an account? <Link to="/login">Sign in</Link></p></div>
            </motion.div>
        </main>
    );
}
