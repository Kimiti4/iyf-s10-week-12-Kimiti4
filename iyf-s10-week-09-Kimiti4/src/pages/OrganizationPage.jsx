import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/apiClient';
import './OrganizationPage.css';

const getOrgEmoji = (type) => ({
  school: '🏫', university: '🎓', estate: '🏘️', ngo: '🤝',
  sme: '💼', coworking: '🏢', community: '👥', youth_group: '🌟',
  professional: '💼'
}[type] || '🏢');

export default function OrganizationPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joined, setJoined] = useState(false);

  const loadOrganization = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      const response = await request(`/organizations/${encodeURIComponent(slug)}`);
      setOrganization(response?.data || response);
    } catch (err) {
      setOrganization(null);
      setError(err.message || 'Could not load this organization.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadOrganization(); }, [loadOrganization]);

  const handleJoin = async () => {
    if (!user || !organization?.id || joinBusy) return;
    setJoinBusy(true);
    setError('');
    try {
      const response = await request(`/organizations/${organization.id}/join`, { method: 'POST' });
      setJoined(true);
      setOrganization((current) => ({
        ...current,
        stats: {
          ...current.stats,
          memberCount: Number(current.stats?.memberCount || 0) + 1,
        },
        joinMessage: response?.data?.message,
      }));
    } catch (err) {
      setError(err.message || 'Could not join this organization.');
    } finally {
      setJoinBusy(false);
    }
  };

  if (loading) {
    return <main className="organization-page page-loading" role="status">Loading organization…</main>;
  }

  if (error && !organization) {
    return (
      <main className="organization-page page-error" role="alert">
        <h1>Organization unavailable</h1>
        <p>{error}</p>
        <div className="error-actions">
          <button className="btn-primary" onClick={loadOrganization}>Retry</button>
          <Link to="/" className="btn-secondary">Back to feed</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="organization-page" aria-label="Organization">
      <header className="org-header">
        <div className="org-icon-large" aria-hidden="true">{getOrgEmoji(organization.type)}</div>
        <div className="org-header-info">
          <p className="feature-eyebrow">Community organization</p>
          <h1>{organization.name}</h1>
          <p>{organization.description || 'Community organization on JamiiLink.'}</p>
          <div className="org-meta" aria-label="Organization information">
            <span className="org-type-badge">{organization.type || 'community'}</span>
            <span>{Number(organization.stats?.memberCount || 0)} members</span>
            <span>{Number(organization.stats?.postCount || 0)} posts</span>
          </div>
        </div>
        {user && (
          <button className="btn-join-org" onClick={handleJoin} disabled={joinBusy || joined}>
            {joinBusy ? 'Joining…' : joined ? 'Member' : 'Join community'}
          </button>
        )}
      </header>

      {error && <div className="page-error" role="alert">{error}</div>}
      {organization.joinMessage && <div className="page-empty" role="status">{organization.joinMessage}</div>}

      <nav className="org-nav" aria-label="Organization sections">
        <button className="nav-tab active" type="button" aria-current="page">Feed</button>
        <button className="nav-tab" type="button" disabled>Members ({Number(organization.stats?.memberCount || 0)})</button>
        <button className="nav-tab" type="button" disabled>Events ({Number(organization.stats?.eventCount || 0)})</button>
      </nav>

      <div className="org-main">
        <section className="org-feed" aria-labelledby="org-feed-title">
          <div className="feed-header">
            <h2 id="org-feed-title">Community feed</h2>

          </div>
          <div className="empty-feed">
            <h3>No organization posts are available yet</h3>
            <p>When this organization has published posts, they will appear here.</p>
          </div>
        </section>

        <aside className="org-sidebar">
          <div className="sidebar-card">
            <h2>Community overview</h2>
            <div className="stats-grid">
              <div className="stat-item"><span className="stat-value">{Number(organization.stats?.memberCount || 0)}</span><span className="stat-label">Members</span></div>
              <div className="stat-item"><span className="stat-value">{Number(organization.stats?.postCount || 0)}</span><span className="stat-label">Posts</span></div>
              <div className="stat-item"><span className="stat-value">{Number(organization.stats?.eventCount || 0)}</span><span className="stat-label">Events</span></div>
            </div>
          </div>
          {organization.contact?.email && (
            <div className="sidebar-card">
              <h2>Contact</h2>
              <a href={`mailto:${organization.contact.email}`}>{organization.contact.email}</a>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
