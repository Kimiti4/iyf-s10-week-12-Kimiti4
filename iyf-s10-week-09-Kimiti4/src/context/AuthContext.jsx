/**
 * 🔹 Authentication Context
 * Manages user authentication state across the application
 * Provides login, register, logout, password change functionality
 *
 * R5 [P0-7]: the access JWT lives ONLY in module memory (authToken.js),
 * never in localStorage/sessionStorage/IndexedDB. The refresh session
 * travels in an HttpOnly cookie managed by the server. On mount the app
 * restores the session via POST /api/auth/refresh (cookie) — stale local
 * state is never treated as proof of authentication.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setAccessToken, clearAccessToken } from '../utils/authToken';
import logger from '../utils/logger';

const AuthContext = createContext(null);

/**
 * AuthProvider - Wraps app to provide auth context
 */
export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Restore session on mount via the refresh cookie (R5). Never trusts
    // stale local state: a stored user profile alone proves nothing.
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Ask the server for a fresh access token using the
                // HttpOnly refresh cookie. Fails when logged out/expired.
                const refresh = await authAPI.refresh();
                if (refresh && refresh.token) {
                    setAccessToken(refresh.token);
                }
                const response = await authAPI.getMe();
                const me = response.user || response;
                setUser(me);
                localStorage.setItem('user', JSON.stringify(me));
            } catch (err) {
                // No valid session: clear everything.
                logger.auth('initialization_error', err.message);
                clearAccessToken();
                localStorage.removeItem('user');
                setUser(null);
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Listen for auth events
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setError(null);
        };

        window.addEventListener('auth:logout', handleLogout);

        return () => {
            window.removeEventListener('auth:logout', handleLogout);
        };
    }, [navigate]);

    /**
     * Login user with email and password
     */
    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.login(credentials);

            // R5: access token goes to memory only (never localStorage).
            if (response.token) {
                setAccessToken(response.token);
            }

            // Backend returns { success: true, message, token, user: {...} }
            const userData = response.user || response;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (err) {
            logger.auth('login_error', err.message);
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Register new user
     */
    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.register(userData);

            // R5: access token goes to memory only (never localStorage).
            if (response.token) {
                setAccessToken(response.token);
            }

            const newUser = response.user || response;
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));

            return newUser;
        } catch (err) {
            logger.auth('registration_error', err.message);
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user with proper cleanup
     */
    const logout = async () => {
        try {
            setLoading(true);

            // Call logout endpoint (R5: server revokes the refresh session).
            try {
                await authAPI.logout();
            } catch (err) {
                logger.auth('logout_api_error', err.message);
                // Continue with client-side logout even if API fails
            }

            // Clear all stored data (R5: memory token, never persisted).
            clearAccessToken();
            localStorage.removeItem('user');
            localStorage.removeItem('preferences');

            // Clear state
            setUser(null);
            setError(null);

            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('auth:logout'));

            // Navigate to login
            navigate('/login', { replace: true });

            logger.auth('logout_success', 'User logged out');
        } catch (err) {
            logger.auth('logout_error', err.message);
            setError('Logout failed, but clearing local data');
            // Force local logout anyway
            clearAccessToken();
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Change user password. R5: the backend revokes ALL sessions (including
     * this one), so the client must re-authenticate afterwards.
     */
    const changePassword = async (passwordData) => {
        try {
            setError(null);
            const response = await authAPI.changePassword(passwordData);
            logger.auth('password_changed', 'Password changed successfully');
            // Sessions revoked server-side: drop local session and log out.
            clearAccessToken();
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login', { replace: true });
            return response;
        } catch (err) {
            logger.auth('password_change_error', err.message);
            setError(err.message || 'Password change failed');
            throw err;
        }
    };

    /**
     * Update user profile
     */
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await authAPI.updateProfile(profileData);
            const updatedUser = response.user || response;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (err) {
            setError(err.message || 'Profile update failed');
            throw err;
        }
    };

    /**
     * Clear error message
     */
    const clearError = () => {
        setError(null);
    };

    // Context value
    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        changePassword,
        updateProfile,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
