import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCog, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch organizations');
      
      const data = await response.json();
      setOrganizations(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrg = async (orgId) => {
    if (!window.confirm('Are you sure you want to archive this organization?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete organization');
      
      // Refresh list
      fetchOrganizations();
    } catch (err) {
      alert('Error deleting organization: ' + err.message);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'members', label: 'Members', icon: FaUsers },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <button onClick={() => navigate('/')} className="back-button">
          <FaArrowLeft /> Back to Feed
        </button>
        <h1>Organization Dashboard</h1>
        <motion.button
          className="create-org-btn"
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Create Organization
        </motion.button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <FaTimes /> {error}
        </div>
      )}

      {/* No Organizations State */}
      {organizations.length === 0 ? (
        <div className="empty-state">
          <h2>No Organizations Yet</h2>
          <p>Create your first organization to get started!</p>
          <motion.button
            className="cta-button"
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Create Your First Organization
          </motion.button>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <nav className="admin-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Tab Content */}
          <div className="admin-content">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab 
                  key="overview"
                  organizations={organizations} 
                  onDelete={handleDeleteOrg}
                  onSelect={(org) => {
                    setSelectedOrg(org);
                    setActiveTab('settings');
                  }}
                />
              )}
              {activeTab === 'members' && (
                <MembersTab key="members" organizations={organizations} />
              )}
              {activeTab === 'settings' && selectedOrg && (
                <SettingsTab key="settings" organization={selectedOrg} />
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Create Organization Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateOrganizationModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchOrganizations();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ organizations, onDelete, onSelect }) {
  const totalMembers = organizations.reduce((sum, org) => sum + (org.stats?.memberCount || 0), 0);
  const totalPosts = organizations.reduce((sum, org) => sum + (org.stats?.postCount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="overview-tab"
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{organizations.length}</h3>
          <p>Organizations</p>
        </div>
        <div className="stat-card">
          <h3>{totalMembers}</h3>
          <p>Total Members</p>
        </div>
        <div className="stat-card">
          <h3>{totalPosts}</h3>
          <p>Total Posts</p>
        </div>
      </div>

      {/* Organizations List */}
      <div className="org-list-section">
        <h2>Your Organizations</h2>
        <div className="org-cards-grid">
          {organizations.map(org => (
            <motion.div
              key={org._id}
              className="org-card"
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelect(org)}
            >
              {org.branding?.logo && (
                <img src={org.branding.logo} alt={org.name} className="org-logo" />
              )}
              <div className="org-info">
                <h3>{org.name}</h3>
                <span className="org-type">{org.type}</span>
                <p>{org.description}</p>
                <div className="org-stats">
                  <span><FaUsers /> {org.stats?.memberCount || 0} members</span>
                  <span>{org.stats?.postCount || 0} posts</span>
                </div>
              </div>
              <div className="org-actions">
                <button className="btn-edit" title="Edit Settings">
                  <FaEdit />
                </button>
                <button 
                  className="btn-delete" 
                  title="Archive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(org._id);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Members Tab Component
function MembersTab({ organizations }) {
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]?._id || '');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedOrg) fetchMembers(selectedOrg);
  }, [selectedOrg]);

  const fetchMembers = async (orgId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch members');
      
      const data = await response.json();
      setMembers(data.data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (membershipId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/memberships/${membershipId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      // Refresh members
      fetchMembers(selectedOrg);
    } catch (err) {
      alert('Error updating role: ' + err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="members-tab"
    >
      <div className="members-header">
        <h2>Manage Members</h2>
        <select 
          value={selectedOrg} 
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="org-selector"
        >
          {organizations.map(org => (
            <option key={org._id} value={org._id}>{org.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(membership => (
                <tr key={membership._id}>
                  <td>{membership.user?.name || 'Unknown'}</td>
                  <td>{membership.user?.email || 'N/A'}</td>
                  <td>
                    <select
                      value={membership.role}
                      onChange={(e) => handleRoleChange(membership._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>
                  <td>{new Date(membership.joinedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${membership.status}`}>
                      {membership.status}
                    </span>
                  </td>
                  <td>
                    {!membership.isApproved && (
                      <button className="btn-approve" title="Approve Member">
                        <FaCheck />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

// Settings Tab Component
function SettingsTab({ organization }) {
  const [formData, setFormData] = useState({
    name: organization.name || '',
    description: organization.description || '',
    type: organization.type || 'community',
    branding: {
      primaryColor: organization.branding?.primaryColor || '#3b82f6',
      secondaryColor: organization.branding?.secondaryColor || '#8b5cf6'
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/${organization._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update organization');
      
      alert('Organization updated successfully!');
    } catch (err) {
      alert('Error updating organization: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="settings-tab"
    >
      <h2>Organization Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label>Organization Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="school">School</option>
            <option value="university">University</option>
            <option value="estate">Estate</option>
            <option value="church">Church</option>
            <option value="ngo">NGO</option>
            <option value="sme">SME</option>
            <option value="coworking">Coworking Space</option>
            <option value="community">Community</option>
            <option value="youth_group">Youth Group</option>
            <option value="professional">Professional Association</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Primary Color</label>
            <input
              type="color"
              value={formData.branding.primaryColor}
              onChange={(e) => setFormData({
                ...formData,
                branding: {...formData.branding, primaryColor: e.target.value}
              })}
            />
          </div>

          <div className="form-group">
            <label>Secondary Color</label>
            <input
              type="color"
              value={formData.branding.secondaryColor}
              onChange={(e) => setFormData({
                ...formData,
                branding: {...formData.branding, secondaryColor: e.target.value}
              })}
            />
          </div>
        </div>

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </motion.div>
  );
}

// Create Organization Modal
function CreateOrganizationModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'community',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create organization');
      }
      
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData({...formData, name, slug});
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Create New Organization</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organization Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Strathmore University"
              required
            />
          </div>

          <div className="form-group">
            <label>URL Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              placeholder="strathmore-university"
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              required
            />
            <small>This will be used in URLs: jamiilink.com/org/{formData.slug}</small>
          </div>

          <div className="form-group">
            <label>Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="school">School</option>
              <option value="university">University</option>
              <option value="estate">Residential Estate</option>
              <option value="church">Church</option>
              <option value="ngo">NGO</option>
              <option value="sme">Small/Medium Business</option>
              <option value="coworking">Coworking Space</option>
              <option value="community">Community Group</option>
              <option value="youth_group">Youth Group</option>
              <option value="professional">Professional Association</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of your organization..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={creating}>
              {creating ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
