import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
import ErrorState from '../components/primitives/ErrorState';
import './FounderDashboard.css';

/**
 * Founder dashboard — real API only; never shows invented citizens/posts.
 * Wire metrics endpoint when available: GET /api/metrics/platform
 */
export default function FounderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const token =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('accessToken') || ''
          : '';
      const res = await fetch(`${base}/metrics/platform`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 404) {
        setMetrics(null);
        setError('');
        return;
      }
      if (!res.ok) throw new Error('Failed to load platform metrics');
      const data = await res.json();
      setMetrics(data.data || data);
    } catch (err) {
      setMetrics(null);
      setError(err.message || 'Metrics unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === 'founder' || user.isFounder)) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [user, fetchMetrics]);

  if (!user || (user.role !== 'founder' && !user.isFounder)) {
    return (
      <main className="founder-dashboard" role="main">
        <PageHeader title="Founder dashboard" />
        <EmptyState
          icon="🔒"
          title="Access restricted"
          message="This area is only available to the platform founder account."
        />
      </main>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ops', label: 'Operations' },
  ];

  return (
    <main className="founder-dashboard" role="main" aria-label="Founder dashboard">
      <PageHeader
        eyebrow="Platform"
        title="Founder dashboard"
        subtitle="Operational overview for JamiiLink"
      />

      <div className="dashboard-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div role="status" className="founder-loading">
          Loading…
        </div>
      )}

      {!loading && error && (
        <ErrorState error={error} onRetry={fetchMetrics} />
      )}

      {!loading && !error && activeTab === 'overview' && (
        <section className="overview-section">
          {metrics ? (
            <div className="stats-grid">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="stat-card">
                  <h3>{key}</h3>
                  <strong className="stat-value">{String(value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📊"
              title="No live metrics yet"
              message="Connect GET /api/metrics/platform (or similar) to show real platform counts. Sample user or post numbers are not displayed."
            />
          )}
        </section>
      )}

      {!loading && activeTab === 'ops' && (
        <section className="ops-section">
          <EmptyState
            icon="🛠️"
            title="Operations tools"
            message="User moderation, content review, and alert broadcast should call authenticated admin APIs. UI actions stay disabled until those endpoints are confirmed."
          />
        </section>
      )}
    </main>
  );
}
