import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get redirect path from location state or default to home
    const from = location.state?.from?.pathname || '/';
    const successMessage = location.state?.message;
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Login to JamiiLink</h2>
                <p className="auth-subtitle">Connect with your community</p>
                
                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}
                
                {successMessage && (
                    <div className="success-message" role="status">
                        {successMessage}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            minLength={6}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>
                
                <div className="demo-credentials">
                    <p><strong>Demo Credentials:</strong></p>
                    <p>Email: demo@jamiilink.co.ke</p>
                    <p>Password: demo123</p>
                </div>
            </div>
        </div>
    );
}
