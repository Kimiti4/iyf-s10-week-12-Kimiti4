import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';
import {
  FiHome, FiFolder, FiGrid, FiSettings, FiUsers,
  FiLogOut, FiChevronDown
} from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { organizations, currentOrg, selectOrg } = useOrg();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrgSelect = (org) => {
    selectOrg(org);
    setOrgDropdownOpen(false);
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">TaskFlow</h1>
          {currentOrg && (
            <div className="org-selector">
              <button
                className="org-selector-btn"
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                aria-expanded={orgDropdownOpen}
                aria-haspopup="true"
              >
                <span className="org-name">{currentOrg.name}</span>
                <FiChevronDown size={14} />
              </button>
              {orgDropdownOpen && (
                <div className="org-dropdown" role="menu">
                  {organizations.map((org) => (
                    <button
                      key={org.id || org._id}
                      className={`org-dropdown-item ${org.id === currentOrg.id ? 'active' : ''}`}
                      onClick={() => handleOrgSelect(org)}
                      role="menuitem"
                    >
                      {org.name}
                    </button>
                  ))}
                  <button
                    className="org-dropdown-item org-dropdown-create"
                    onClick={() => {
                      setOrgDropdownOpen(false);
                      navigate('/tf/organizations');
                    }}
                    role="menuitem"
                  >
                    + Create Organization
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/tf" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiHome size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/tf/organizations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiUsers size={18} />
            <span>Organizations</span>
          </NavLink>
          <NavLink to="/tf/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiFolder size={18} />
            <span>Projects</span>
          </NavLink>
          <NavLink to="/tf/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiSettings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} aria-label="Logout">
            <FiLogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
