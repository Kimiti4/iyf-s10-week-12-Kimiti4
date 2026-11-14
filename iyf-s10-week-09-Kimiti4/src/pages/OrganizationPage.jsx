import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { organizationsAPI } from '../services/api';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
import ErrorState from '../components/primitives/ErrorState';
import './OrganizationPage.css';

const ORG_EMOJI = {
  school: '🏫',
  university: '🎓',
  estate: '🏘️',
  church: '⛪',
  ngo: '🤝',
  sme: '💼',
  coworking: '🏢',
  community: '👥',
  youth_group: '🌟',
  professional: '💼',
};

export default function OrganizationPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await organizationsAPI.getBySlug(slug);
      setOrganization(result?.data || result?.organization || null);
    } catch (err) {
      setOrganization(null);
      setError(err?.message || 'Unable to load this organization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const result = await organizationsAPI.getBySlug(slug);
        if (active) setOrganization(result?.data || result?.organization || null);
      } catch (err) {
        if (active) {
          setOrganization(null);
          setError(err?.message || 'Unable to load this organization.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-state" role="status">
        <div className="loading-spinner" aria-hidden="true" />
        <p>Loading organization…</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <main className="organization-page" role="main">
        <PageHeader title="Organization" subtitle={slug} />
        <ErrorState
          error={error || 'Organization not found'}
          onRetry={load}
        />
        <p>
          <Link to="/" className="btn btn-secondary">
            Back to feed
          </Link>
        </p>
      </main>
    );
  }

  const stats = organization.stats || {};
  const emoji = ORG_EMOJI[organization.type] || '🏢';
  const id = organization.id || organization._id;

  return (
    <main className="organization-page" role="main" aria-label="Organization">
      <PageHeader
        eyebrow={organization.type || 'Organization'}
        title={organization.name}
        subtitle={organization.description || undefined}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={joining || !id}
            onClick={async () => {
              if (!id) return;
              try {
                setJoining(true);
                setJoinMessage('');
                await organizationsAPI.join(id);
                setJoinMessage('Joined successfully');
              } catch (err) {
                setJoinMessage(err?.message || 'Unable to join');
              } finally {
                setJoining(false);
              }
            }}
          >
            {joining ? 'Joining…' : 'Join'}
          </button>
        }
      />

      {joinMessage && (
        <p className="org-join-message" role="status">
          {joinMessage}
        </p>
      )}

      <div className="org-meta-row">
        <span className="org-icon-large" aria-hidden="true">
          {emoji}
        </span>
        <span className="org-type-badge">{organization.type}</span>
        <span>
          {stats.memberCount ?? 0} members · {stats.postCount ?? 0} posts
        </span>
      </div>

      <section className="org-feed" aria-label="Organization feed">
        <div className="feed-header">
          <h2>Community feed</h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/create-post')}
          >
            Create post
          </button>
        </div>
        <EmptyState
          icon="📭"
          title="No posts in this view yet"
          message="Organization-scoped feed wiring may still be limited. Create a post from the main compose flow."
          action={{ label: 'Open main feed', onClick: () => navigate('/') }}
        />
      </section>

      <aside className="org-sidebar">
        <div className="sidebar-card">
          <h3>Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.memberCount ?? 0}</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.postCount ?? 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.eventCount ?? 0}</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
        </div>
        {organization.contact?.email && (
          <div className="sidebar-card">
            <h3>Contact</h3>
            <p>{organization.contact.email}</p>
          </div>
        )}
      </aside>
    </main>
  );
}
