/**
 * 🔹 Authentication Context
 * Manages user authentication state across the application
 * Provides login, register, logout, password change functionality
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
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
    
    // Check for existing session on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (token && storedUser) {
                try {
                    // Verify token is still valid by fetching current user
                    const response = await authAPI.getMe();
                    setUser(response.user || response);
                    localStorage.setItem('user', JSON.stringify(response.user || response));
                } catch (err) {
                    // Token invalid or expired
                    logger.auth('initialization_error', err.message);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            
            setLoading(false);
        };
        
        initializeAuth();
    }, []);

    // Listen for auth events from other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    // Token was removed in another tab
                    setUser(null);
                    navigate('/login');
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom logout event
        window.addEventListener('auth:logout', () => {
            setUser(null);
            setError(null);
        });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth:logout', () => {});
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
            
            // Store token and user info
            if (response.token) {
                localStorage.setItem('token', response.token);
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
            
            // Store token and user info
            if (response.token) {
                localStorage.setItem('token', response.token);
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
            
            // Call logout endpoint (backend can do cleanup if needed)
            try {
                await authAPI.logout();
            } catch (err) {
                logger.auth('logout_api_error', err.message);
                // Continue with client-side logout even if API fails
            }
            
            // Clear all stored data
            localStorage.removeItem('token');
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login', { replace: true });
        } finally {
            setLoading(false);
        }
    };
    
    /**
     * Change user password
     */
    const changePassword = async (passwordData) => {
        try {
            setError(null);
            const response = await authAPI.changePassword(passwordData);
            logger.auth('password_changed', 'Password changed successfully');
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
