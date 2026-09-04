import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../components/Toast';
import AlertCard from '../components/AlertCard';
import CreateAlertForm from '../components/CreateAlertForm';
import { initializeSocket, onNewAlert, onAlertUpdate, onAlertDelete, disconnectSocket } from '../services/socketClient';
import { alertsAPI } from '../services/api';
import './AlertFeedPage.css';

const SEVERITY_FILTERS = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'critical', label: 'Emergency', icon: '🔴' },
  { value: 'warning', label: 'Warning', icon: '🟠' },
  { value: 'info', label: 'Info', icon: '🔵' },
];

const VERIFICATION_FILTERS = [
  { value: 'all', label: 'All Sources' },
  { value: 'official', label: 'Official' },
  { value: 'mod_verified', label: 'Mod Verified' },
  { value: 'community_verified', label: 'Community Verified' },
  { value: 'unverified', label: 'Unverified' },
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'security', label: 'Security' },
  { value: 'scam_warning', label: 'Scam Warning' },
  { value: 'lost_found', label: 'Lost & Found' },
  { value: 'traffic_transport', label: 'Traffic' },
  { value: 'event', label: 'Events' },
  { value: 'utility_outage', label: 'Utilities' },
  { value: 'campus_notice', label: 'Campus' },
  { value: 'marketplace_fraud', label: 'Fraud' },
  { value: 'weather', label: 'Weather' },
];

export default function AlertFeedPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const fetchAlerts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit: 20 };
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (verificationFilter !== 'all') params.verificationLevel = verificationFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const response = await alertsAPI.getAll(params);
      setAlerts(response.data || []);
      setPage(response.page || 1);
      setTotalPages(response.pages || 1);
      setTotal(response.total || 0);
    } catch {
      toastRef.current.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [severityFilter, categoryFilter, verificationFilter, searchQuery]);

  useEffect(() => {
    const socket = initializeSocket();
    const cleanupNew = onNewAlert((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      setTotal(prev => prev + 1);
      toastRef.current.info(`New alert: ${newAlert.title}`);
    });
    const cleanupUpdate = onAlertUpdate((updated) => {
      setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
    });
    const cleanupDelete = onAlertDelete(({ alertId }) => {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setTotal(prev => Math.max(0, prev - 1));
    });
    fetchAlerts(1);
    return () => { cleanupNew(); cleanupUpdate(); cleanupDelete(); disconnectSocket(); };
  }, [fetchAlerts]);

  const handleCreateAlert = async (formData) => {
    try {
      const response = await alertsAPI.create(formData);
      toastRef.current.success('Alert published');
      setShowCreateForm(false);
      if (response.data) {
        setAlerts(prev => [response.data, ...prev]);
        setTotal(prev => prev + 1);
      }
    } catch (error) {
      toastRef.current.error(error.response?.data?.message || 'Failed to create alert');
      throw error;
    }
  };

  const handleConfirmAlert = async (alertId) => {
    try {
      await alertsAPI.confirm(alertId);
      toastRef.current.success('Alert confirmed');
    } catch {
      toastRef.current.error('Failed to confirm alert');
    }
  };

  const severityCounts = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="alert-feed-page" role="main">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <h1>Alerts</h1>
          <p>Community safety and activity alerts</p>
        </div>
        <button
          className="btn-create-alert"
          onClick={() => setShowCreateForm(!showCreateForm)}
          aria-expanded={showCreateForm}
        >
          {showCreateForm ? 'Cancel' : 'Create Alert'}
        </button>
      </header>

      {/* Severity Summary */}
      {!loading && alerts.length > 0 && (
        <div className="severity-summary" role="region" aria-label="Alert summary">
          {SEVERITY_FILTERS.slice(1).map(s => (
            <button
              key={s.value}
              className={`severity-chip severity-chip--${s.value} ${severityFilter === s.value ? 'active' : ''}`}
              onClick={() => setSeverityFilter(severityFilter === s.value ? 'all' : s.value)}
              aria-pressed={severityFilter === s.value}
            >
              <span className="severity-chip__icon" aria-hidden="true">{s.icon}</span>
              <span className="severity-chip__label">{s.label}</span>
              <span className="severity-chip__count">{severityCounts[s.value] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="create-form-wrapper">
          <CreateAlertForm onSubmit={handleCreateAlert} onCancel={() => setShowCreateForm(false)} />
        </div>
      )}

      {/* Search + Filters */}
      <div className="filter-bar">
        <div className="filter-bar__search">
          <input
            type="search"
            id="alert-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="filter-input"
            aria-label="Search alerts"
          />
        </div>
        <div className="filter-bar__select-group">
          <label htmlFor="alert-category-filter" className="filter-bar__label">Category</label>
          <select
            id="alert-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-bar__select-group">
          <label htmlFor="alert-verification-filter" className="filter-bar__label">Source</label>
          <select
            id="alert-verification-filter"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="filter-select"
          >
            {VERIFICATION_FILTERS.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert List */}
      <section className="alerts-container" aria-label="Alerts">
        {loading ? (
          <div className="loading-state" role="status">
            <div className="loading-spinner" aria-hidden="true" />
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">📭</div>
            <p>No alerts</p>
            <p className="empty-hint">Nothing to report right now</p>
          </div>
        ) : (
          <>
            <ul className="alerts-list" role="list">
              {alerts.map(alert => (
                <li key={alert.id}>
                  <AlertCard alert={alert} onConfirm={() => handleConfirmAlert(alert.id)} />
                </li>
              ))}
            </ul>
            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="pagination" role="navigation" aria-label="Alert pagination">
                <button
                  className="pagination__btn"
                  onClick={() => fetchAlerts(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>
                <span className="pagination__info">
                  {page} / {totalPages} ({total} total)
                </span>
                <button
                  className="pagination__btn"
                  onClick={() => fetchAlerts(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
