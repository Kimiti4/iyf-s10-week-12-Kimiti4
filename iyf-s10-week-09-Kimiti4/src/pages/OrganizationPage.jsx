/**
 * 🔹 Organization Page
 * Displays organization details and scoped posts
 * Route: /org/:slug
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { organizationsAPI, postsAPI } from '../services/api';
import { useOrganization } from '../context/OrganizationContext';
import PostCard from '../components/PostCard';
import './OrganizationPage.css';

const OrganizationPage = () => {
  const { slug } = useParams();
  const { selectOrganization } = useOrganization();
  
  const [organization, setOrganization] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    fetchOrganizationData();
  }, [slug]);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch organization details by slug
      const orgResponse = await organizationsAPI.getBySlug(slug);
      const orgData = orgResponse.data;
      setOrganization(orgData);
      
      // Set as current organization in context
      selectOrganization(orgData);
      
      // Fetch posts scoped to this organization
      const postsResponse = await postsAPI.getAll({ organization: orgData._id });
      setPosts(postsResponse.data || []);
      
      // Check if user is a member (if authenticated)
      const token = localStorage.getItem('token');
      if (token && orgData.members) {
        // This would need backend endpoint to check membership
        // For now, we'll assume not a member
        setIsMember(false);
      }
      
    } catch (err) {
      console.error('Failed to fetch organization data:', err);
      setError(err.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async () => {
    try {
      await organizationsAPI.join(organization._id);
      setIsMember(true);
      // Refresh organization data to update member count
      const orgResponse = await organizationsAPI.getBySlug(slug);
      setOrganization(orgResponse.data);
    } catch (err) {
      console.error('Failed to join organization:', err);
      alert('Failed to join organization. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="org-page-loading">
        <div className="spinner"></div>
        <p>Loading organization...</p>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="org-page-error">
        <h2>Organization Not Found</h2>
        <p>{error || 'The organization you\'re looking for doesn\'t exist.'}</p>
        <Link to="/" className="btn-back">← Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="organization-page">
      {/* Organization Header */}
      <header className="org-header">
        <div className="container">
          <div className="org-header-content">
            <div className="org-icon-large">
              {organization.type === 'school' && '🏫'}
              {organization.type === 'university' && '🎓'}
              {organization.type === 'estate' && '🏘️'}
              {organization.type === 'church' && '⛪'}
              {organization.type === 'ngo' && '🤝'}
              {organization.type === 'sme' && '💼'}
              {organization.type === 'coworking' && '🏢'}
              {organization.type === 'community' && '👥'}
              {organization.type === 'youth_group' && '🌟'}
              {organization.type === 'professional' && '💼'}
            </div>
            
            <div className="org-header-info">
              <h1>{organization.name}</h1>
              <p className="org-description">{organization.description}</p>
              
              <div className="org-meta">
                <span className="org-type-badge">{organization.type}</span>
                <span className="org-members-count">
                  👥 {organization.stats?.memberCount || 0} members
                </span>
                <span className="org-posts-count">
                  📝 {organization.stats?.postCount || 0} posts
                </span>
              </div>
            </div>
            
            {!isMember && (
              <button 
                className="btn-join-org"
                onClick={handleJoinOrganization}
              >
                Join Organization
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Organization Navigation */}
      <nav className="org-nav">
        <div className="container">
          <ul className="org-nav-tabs">
            <li className="active"><Link to={`/org/${slug}`}>Feed</Link></li>
            <li><Link to={`/org/${slug}/members`}>Members</Link></li>
            <li><Link to={`/org/${slug}/about`}>About</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="org-main container">
        <section className="org-feed">
          <div className="feed-header">
            <h2>Community Feed</h2>
            <Link to="/original/posts/create" className="btn-create-post">
              + Create Post
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="empty-feed">
              <div className="empty-icon">📭</div>
              <h3>No posts yet</h3>
              <p>Be the first to share something with the community!</p>
              <Link to="/original/posts/create" className="btn-primary">
                Create First Post
              </Link>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="org-sidebar">
          <div className="sidebar-card">
            <h3>About</h3>
            <p>{organization.description}</p>
            
            {organization.contact && (
              <div className="org-contact">
                {organization.contact.email && (
                  <p>📧 {organization.contact.email}</p>
                )}
                {organization.contact.phone && (
                  <p>📱 {organization.contact.phone}</p>
                )}
                {organization.contact.website && (
                  <p>🌐 <a href={organization.contact.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a></p>
                )}
              </div>
            )}
          </div>

          <div className="sidebar-card">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{organization.stats?.memberCount || 0}</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{organization.stats?.postCount || 0}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </span>
                <span className="stat-label">Founded</span>
              </div>
            </div>
          </div>

          {organization.settings?.enableMarketplace && (
            <div className="sidebar-card">
              <h3>Marketplace</h3>
              <p>Browse and sell items within the community</p>
              <Link to={`/org/${slug}/marketplace`} className="btn-secondary">
                View Marketplace
              </Link>
            </div>
          )}

          {organization.settings?.enableEvents && (
            <div className="sidebar-card">
              <h3>Events</h3>
              <p>Upcoming events and activities</p>
              <Link to={`/org/${slug}/events`} className="btn-secondary">
                View Events
              </Link>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default OrganizationPage;
