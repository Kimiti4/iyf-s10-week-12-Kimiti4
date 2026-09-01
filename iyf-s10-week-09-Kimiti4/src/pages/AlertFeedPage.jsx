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
  { value: 'official', label: 'Official', icon: '🟣' },
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

  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const response = await alertsAPI.getAll(params);
      setAlerts(response.data || []);
    } catch {
      toastRef.current.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [severityFilter, categoryFilter]);

  useEffect(() => {
    const socket = initializeSocket();
    const cleanupNew = onNewAlert((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      toastRef.current.info(`New alert: ${newAlert.title}`);
    });
    const cleanupUpdate = onAlertUpdate((updated) => {
      setAlerts(prev => prev.map(a => a._id === updated._id ? updated : a));
    });
    const cleanupDelete = onAlertDelete(({ alertId }) => {
      setAlerts(prev => prev.filter(a => a._id !== alertId));
    });
    fetchAlerts();
    return () => { cleanupNew(); cleanupUpdate(); cleanupDelete(); disconnectSocket(); };
  }, [fetchAlerts]);

  const handleCreateAlert = async (formData) => {
    try {
      const response = await alertsAPI.create(formData);
      toastRef.current.success('Alert published');
      setShowCreateForm(false);
      if (response.data) setAlerts(prev => [response.data, ...prev]);
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

      {/* Category Filter */}
      <div className="filter-bar">
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
          <ul className="alerts-list" role="list">
            {alerts.map(alert => (
              <li key={alert._id}>
                <AlertCard alert={alert} onConfirm={() => handleConfirmAlert(alert._id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
