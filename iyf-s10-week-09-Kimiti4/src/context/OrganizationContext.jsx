/**
 * 🔹 Organization Context
 * Manages current organization state across the app
 * Handles organization switching and persistence
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { organizationsAPI } from '../services/api';
import logger from '../utils/logger';

const OrganizationContext = createContext();

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load organization from localStorage on mount
  useEffect(() => {
    const loadSavedOrganization = async () => {
      try {
        const savedOrg = localStorage.getItem('currentOrganization');
        if (savedOrg) {
          setCurrentOrg(JSON.parse(savedOrg));
        }
      } catch (err) {
        logger.error('Failed to load saved organization:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSavedOrganization();
  }, []);

  // Fetch user's organizations when authenticated
  const fetchUserOrganizations = async () => {
    try {
      setError(null);
      const response = await organizationsAPI.getMyOrganizations();
      setUserOrganizations(response.data || []);
      return response.data || [];
    } catch (err) {
      setError(err.message || 'Failed to fetch organizations');
      logger.error('Error fetching organizations:', err);
      return [];
    }
  };

  // Select/switch organization
  const selectOrganization = (org) => {
    setCurrentOrg(org);
    localStorage.setItem('currentOrganization', JSON.stringify(org));
    
    // Update API default params to include organization filter
    // This will be used by components to scope their queries
  };

  // Clear organization selection (view all communities)
  const clearOrganization = () => {
    setCurrentOrg(null);
    localStorage.removeItem('currentOrganization');
  };

  // Join an organization
  const joinOrganization = async (orgId) => {
    try {
      const response = await organizationsAPI.join(orgId);
      
      // Refresh user's organizations list
      await fetchUserOrganizations();
      
      // Optionally set as current org
      if (response.data) {
        selectOrganization(response.data.organization);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to join organization');
      throw err;
    }
  };

  // Leave an organization
  const leaveOrganization = async (orgId) => {
    try {
      await organizationsAPI.leave(orgId);
      
      // Refresh user's organizations list
      await fetchUserOrganizations();
      
      // If leaving current org, clear it
      if (currentOrg?._id === orgId) {
        clearOrganization();
      }
    } catch (err) {
      setError(err.message || 'Failed to leave organization');
      throw err;
    }
  };

  const value = {
    currentOrg,
    userOrganizations,
    loading,
    error,
    selectOrganization,
    clearOrganization,
    fetchUserOrganizations,
    joinOrganization,
    leaveOrganization,
    setCurrentOrg
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
