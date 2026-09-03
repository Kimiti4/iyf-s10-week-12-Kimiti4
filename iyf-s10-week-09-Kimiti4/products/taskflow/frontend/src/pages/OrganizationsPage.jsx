import { useState, useEffect } from 'react';
import { useOrg } from '../context/OrgContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { createOrganization, getMembers, inviteMember, removeMember } from '../api/orgs';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import MemberAvatar from '../components/MemberAvatar';
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';

export default function OrganizationsPage() {
  const { organizations, refreshOrgs, currentOrg, selectOrg } = useOrg();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  useEffect(() => {
    const orgId = selectedOrgId || currentOrg?.id || currentOrg?._id;
    if (!orgId) return;
    setLoadingMembers(true);
    getMembers(orgId)
      .then((data) => setMembers(Array.isArray(data) ? data : data.results || []))
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [selectedOrgId, currentOrg]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setCreating(true);
    try {
      const newOrg = await createOrganization(orgName.trim(), orgDesc.trim());
      success('Organization created!');
      setOrgName('');
      setOrgDesc('');
      setShowCreate(false);
      await refreshOrgs();
      selectOrg(newOrg);
    } catch (err) {
      showError(err.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const orgId = selectedOrgId || currentOrg?.id || currentOrg?._id;
    if (!orgId) return;
    setInviting(true);
    try {
      await inviteMember(orgId, inviteEmail.trim(), inviteRole);
      success('Invitation sent!');
      setInviteEmail('');
      const data = await getMembers(orgId);
      setMembers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      showError(err.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    const orgId = selectedOrgId || currentOrg?.id || currentOrg?._id;
    if (!orgId) return;
    if (!confirm('Remove this member?')) return;
    try {
      await removeMember(orgId, userId);
      success('Member removed');
      const data = await getMembers(orgId);
      setMembers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      showError(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Organizations</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)} aria-label="Create organization">
          <FiPlus size={16} /> New Organization
        </button>
      </div>

      {showCreate && (
        <div className="card form-card">
          <h3>Create Organization</h3>
          <form onSubmit={handleCreateOrg}>
            <div className="form-group">
              <label htmlFor="org-name">Name *</label>
              <input
                id="org-name"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Organization name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="org-desc">Description</label>
              <textarea
                id="org-desc"
                value={orgDesc}
                onChange={(e) => setOrgDesc(e.target.value)}
                rows={2}
                placeholder="Optional description"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {organizations.length === 0 ? (
        <EmptyState
          title="No organizations"
          description="Create an organization to start collaborating with your team."
          actionLabel="Create Organization"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="org-layout">
          <div className="org-list">
            <h3>Your Organizations</h3>
            {organizations.map((org) => (
              <button
                key={org.id || org._id}
                className={`org-list-item ${(selectedOrgId || currentOrg?.id) === (org.id || org._id) ? 'active' : ''}`}
                onClick={() => {
                  setSelectedOrgId(org.id || org._id);
                  selectOrg(org);
                }}
              >
                <div className="org-list-item-icon">
                  {org.name?.charAt(0)?.toUpperCase() || 'O'}
                </div>
                <div className="org-list-item-info">
                  <span className="org-list-item-name">{org.name}</span>
                  <span className="org-list-item-role">{org.role || 'Member'}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="org-detail">
            <div className="card">
              <div className="card-header">
                <FiUsers size={20} />
                <h3>Members</h3>
              </div>
              {loadingMembers ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <div className="member-list">
                    {members.length === 0 ? (
                      <p className="text-muted">No members yet</p>
                    ) : (
                      members.map((member) => (
                        <div key={member.id || member._id} className="member-row">
                          <MemberAvatar user={member} />
                          <span className="member-role">{member.role || 'Member'}</span>
                          {member.id !== user?.id && (
                            <button
                              className="btn-icon btn-danger-icon"
                              onClick={() => handleRemoveMember(member.id || member._id)}
                              aria-label={`Remove ${member.name}`}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleInvite} className="invite-form">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Email address"
                      required
                    />
                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={inviting}>
                      {inviting ? 'Inviting...' : 'Invite'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
