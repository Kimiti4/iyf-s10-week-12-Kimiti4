import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { validateLogin, sanitizeInput } from '../../utils/validation';
import { authAPI } from '../../services/api';
import './EnhancedLoginPage.css';

export default function EnhancedLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMode, setResetMode] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [resetConfirm, setResetConfirm] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setNotice('');
        setLoading(true);
        try {
            const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
            const validation = validateLogin({ email: sanitizedEmail, password });
            if (!validation.valid) {
                setError(Object.values(validation.errors)[0] || 'Please check your details.');
                return;
            }
            await login({ email: sanitizedEmail, password });
            navigate('/', { replace: true });
        } catch (err) {
            setError(err?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const requestReset = async (e) => {
        e.preventDefault();
        setError('');
        setNotice('');
        setLoading(true);
        try {
            await authAPI.requestPasswordReset(email.trim().toLowerCase());
            setResetSent(true);
            setNotice('If an account exists for that email, a reset code has been sent.');
        } catch (err) {
            setError(err?.message || 'Unable to start password reset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const confirmReset = async (e) => {
        e.preventDefault();
        setError('');
        if (resetPassword.length < 8) {
            setError('Use a password with at least 8 characters.');
            return;
        }
        if (resetPassword !== resetConfirm) {
            setError('The passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await authAPI.resetPassword({ email: email.trim().toLowerCase(), code: resetCode, newPassword: resetPassword });
            setNotice('Password reset successfully. You can now sign in.');
            setResetMode(false);
            setResetSent(false);
            setPassword('');
            setResetCode('');
            setResetPassword('');
            setResetConfirm('');
        } catch (err) {
            setError(err?.message || 'The reset code is invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="enhanced-login-page" aria-label={resetMode ? 'Reset password' : 'Log in'}>
            <motion.div className="enhanced-login-container" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="login-header">
                    <div className="auth-brand-mark" aria-hidden="true">J</div>
                    <p className="auth-eyebrow">JAMIILINK</p>
                    <h1>{resetMode ? 'Reset your password' : 'Welcome back'}</h1>
                    <p className="tagline">{resetMode ? 'Securely recover access to your account.' : 'A community platform built for meaningful local connection.'}</p>
                </div>

                {error && <div className="error-message" role="alert">{error}</div>}
                {notice && <div className="form-notice" role="status">{notice}</div>}

                {!resetMode ? (
                    <form onSubmit={handleLogin} className="enhanced-login-form">
                        <label className="auth-field">
                            <span>Email address</span>
                            <div className="input-group">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" aria-label="Email address" />
                            </div>
                        </label>

                        <label className="auth-field">
                            <span>Password</span>
                            <div className="input-group password-group">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required autoComplete="current-password" aria-label="Password" />
                                <button type="button" className="toggle-password" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </label>

                        <div className="form-options">
                            <span className="auth-security-note"><FaShieldAlt aria-hidden="true" /> Secure session</span>
                            <button type="button" className="forgot-link" onClick={() => { setResetMode(true); setError(''); setNotice(''); }}>Forgot password?</button>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                ) : (
                    <div className="reset-flow">
                        {!resetSent ? (
                            <form onSubmit={requestReset} className="enhanced-login-form">
                                <label className="auth-field">
                                    <span>Email address</span>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" aria-label="Email address" />
                                </label>
                                <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Sending…' : 'Send reset code'}</button>
                            </form>
                        ) : (
                            <form onSubmit={confirmReset} className="enhanced-login-form">
                                <label className="auth-field">
                                    <span>Verification code</span>
                                    <input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" required aria-label="Verification code" />
                                </label>
                                <label className="auth-field">
                                    <span>New password</span>
                                    <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="At least 8 characters" required autoComplete="new-password" aria-label="New password" />
                                </label>
                                <label className="auth-field">
                                    <span>Confirm password</span>
                                    <input type="password" value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} placeholder="Repeat password" required autoComplete="new-password" aria-label="Confirm password" />
                                </label>
                                <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Resetting…' : 'Reset password'}</button>
                            </form>
                        )}
                    </div>
                )}

                <div className="auth-trust">
                    <FaCheckCircle aria-hidden="true" />
                    <span>Protected with short-lived access sessions and rotating refresh sessions.</span>
                </div>

                <div className="login-footer">
                    {resetMode ? (
                        <button className="auth-back-link" type="button" onClick={() => { setResetMode(false); setResetSent(false); setError(''); setNotice(''); }}><FaArrowLeft /> Back to sign in</button>
                    ) : (
                        <p>New to JamiiLink? <Link to="/register">Create an account</Link></p>
                    )}
                </div>
            </motion.div>
        </main>
    );
}
