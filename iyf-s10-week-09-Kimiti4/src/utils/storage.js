/**
 * 🔹 Centralized Storage Utility
 * Safe localStorage operations with error handling and sanitization
 * Replaces direct localStorage calls throughout the app
 */

import logger from './logger';
import { sanitizeInput } from './validation';

/**
 * Safely get item from localStorage
 */
export const storage = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {boolean} parse - Whether to parse JSON (default: true)
   * @returns {*} Parsed value or null
   */
  get: (key, parse = true) => {
    try {
      if (typeof window === 'undefined') return null;
      
      const item = localStorage.getItem(key);
      
      if (item === null) return null;
      
      return parse ? JSON.parse(item) : item;
    } catch (error) {
      logger.error(`Failed to read from localStorage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {boolean} stringify - Whether to stringify (default: true)
   * @returns {boolean} Success status
   */
  set: (key, value, stringify = true) => {
    try {
      if (typeof window === 'undefined') return false;
      
      const data = stringify ? JSON.stringify(value) : value;
      localStorage.setItem(key, data);
      return true;
    } catch (error) {
      logger.error(`Failed to write to localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove: (key) => {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error(`Failed to remove from localStorage: ${key}`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   * @returns {boolean} Success status
   */
  clear: () => {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.clear();
      return true;
    } catch (error) {
      logger.error('Failed to clear localStorage', error);
      return false;
    }
  },

  /**
   * Get storage size in KB
   * @returns {number} Size in KB
   */
  getSize: () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += ((localStorage[key].length + key.length) * 2);
        }
      }
      return (total / 1024).toFixed(2);
    } catch (error) {
      logger.error('Failed to calculate storage size', error);
      return 0;
    }
  }
};

/**
 * Auth-specific storage operations
 */
export const authStorage = {
  /**
   * Save authentication token
   */
  saveToken: (token) => {
    return storage.set('token', token, false); // Store as string
  },

  /**
   * Get authentication token
   */
  getToken: () => {
    return storage.get('token', false); // Get as string
  },

  /**
   * Remove authentication token
   */
  removeToken: () => {
    return storage.remove('token');
  },

  /**
   * Save user data (sanitized)
   */
  saveUser: (userData) => {
    // Sanitize user data before storing
    const sanitized = {
      ...userData,
      name: userData.name ? sanitizeInput(userData.name) : '',
      username: userData.username ? sanitizeInput(userData.username) : '',
      bio: userData.bio ? sanitizeInput(userData.bio) : '',
      location: userData.location ? sanitizeInput(userData.location) : ''
    };
    
    return storage.set('user', sanitized);
  },

  /**
   * Get user data
   */
  getUser: () => {
    return storage.get('user');
  },

  /**
   * Remove user data
   */
  removeUser: () => {
    return storage.remove('user');
  },

  /**
   * Clear all auth data
   */
  clearAuth: () => {
    authStorage.removeToken();
    authStorage.removeUser();
  }
};

/**
 * App settings storage
 */
export const settingsStorage = {
  saveSettings: (settings) => storage.set('appSettings', settings),
  getSettings: () => storage.get('appSettings'),
  updateSetting: (key, value) => {
    const current = settingsStorage.getSettings() || {};
    current[key] = value;
    return storage.set('appSettings', current);
  }
};

/**
 * Organization storage
 */
export const orgStorage = {
  saveCurrentOrg: (org) => storage.set('currentOrganization', org),
  getCurrentOrg: () => storage.get('currentOrganization'),
  clearCurrentOrg: () => storage.remove('currentOrganization')
};

export default {
  storage,
  auth: authStorage,
  settings: settingsStorage,
  organization: orgStorage
};
