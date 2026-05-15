/**
 * 🔹 Authentication Context
 * Manages user authentication state across the application
 * Provides login, register, logout functionality
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
     * Logout user
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
        navigate('/login');
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
