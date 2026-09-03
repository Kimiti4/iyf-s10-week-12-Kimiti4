import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getOrganizations } from '../api/orgs';
import { useAuth } from './AuthContext';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrg(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getOrganizations();
      const orgs = Array.isArray(data) ? data : data.results || [];
      setOrganizations(orgs);
      if (orgs.length > 0 && !currentOrg) {
        setCurrentOrg(orgs[0]);
      }
    } catch {
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const selectOrg = (org) => {
    setCurrentOrg(org);
  };

  const refreshOrgs = () => {
    return fetchOrganizations();
  };

  return (
    <OrgContext.Provider value={{ organizations, currentOrg, selectOrg, refreshOrgs, loading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
