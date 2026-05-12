/**
 * 🔹 Organization Selector Component
 * Dropdown to switch between user's organizations
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useOrganization } from '../context/OrganizationContext';
import { useAuth } from '../context/AuthContext';
import './OrganizationSelector.css';

const OrganizationSelector = () => {
  const { currentOrg, userOrganizations, fetchUserOrganizations, clearOrganization } = useOrganization();
  const { isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user's organizations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrganizations();
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (org) => {
    setShowDropdown(false);
    // Navigate to organization page
    window.location.href = `/org/${org.slug}`;
  };

  const handleViewAll = () => {
    clearOrganization();
    setShowDropdown(false);
    window.location.href = '/';
  };

  if (!isAuthenticated) return null;

  return (
    <div className="org-selector" ref={dropdownRef}>
      <button 
        className="org-selector-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Select organization"
      >
        {currentOrg ? (
          <>
            <span className="org-name">{currentOrg.name}</span>
            <span className="org-type-badge">{currentOrg.type}</span>
            <span className="dropdown-arrow">▼</span>
          </>
        ) : (
          <>
            <span>All Communities</span>
            <span className="dropdown-arrow">▼</span>
          </>
        )}
      </button>

      {showDropdown && (
        <div className="org-dropdown">
          {/* View All Option */}
          <button 
            className={`org-dropdown-item ${!currentOrg ? 'active' : ''}`}
            onClick={handleViewAll}
          >
            <span className="org-icon">🌍</span>
            <div className="org-info">
              <span className="org-name">All Communities</span>
              <span className="org-description">View posts from all organizations</span>
            </div>
          </button>

          <div className="org-dropdown-divider"></div>

          {/* User's Organizations */}
          {userOrganizations.length === 0 ? (
            <div className="org-dropdown-empty">
              <p>No organizations yet</p>
              <Link to="/organizations/create" className="btn-create-org">
                Create Organization
              </Link>
            </div>
          ) : (
            userOrganizations.map(org => (
              <button
                key={org._id}
                className={`org-dropdown-item ${currentOrg?._id === org._id ? 'active' : ''}`}
                onClick={() => handleSelect(org)}
              >
                <span className="org-icon">
                  {org.type === 'school' && '🏫'}
                  {org.type === 'university' && '🎓'}
                  {org.type === 'estate' && '🏘️'}
                  {org.type === 'church' && '⛪'}
                  {org.type === 'ngo' && '🤝'}
                  {org.type === 'sme' && '💼'}
                  {org.type === 'coworking' && '🏢'}
                  {org.type === 'community' && '👥'}
                  {org.type === 'youth_group' && '🌟'}
                  {org.type === 'professional' && '💼'}
                </span>
                <div className="org-info">
                  <span className="org-name">{org.name}</span>
                  <span className="org-members">{org.stats?.memberCount || 0} members</span>
                </div>
                {currentOrg?._id === org._id && (
                  <span className="org-check">✓</span>
                )}
              </button>
            ))
          )}

          <div className="org-dropdown-divider"></div>

          {/* Create New Organization */}
          <Link to="/organizations/create" className="org-dropdown-item create-new">
            <span className="org-icon">➕</span>
            <div className="org-info">
              <span className="org-name">Create Organization</span>
              <span className="org-description">Start a new community</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrganizationSelector;
