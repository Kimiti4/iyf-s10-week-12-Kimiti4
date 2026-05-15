/**
 * 🔹 Alert Feed Page
 * Displays all community alerts with filtering and realtime updates
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import AlertCard from '../components/AlertCard';
import CreateAlertForm from '../components/CreateAlertForm';
import { initializeSocket, onNewAlert, onAlertUpdate, onAlertDelete, disconnectSocket } from '../services/socketClient';
import api from '../services/api';
import './AlertFeedPage.css';

// Alert categories for filter
const CATEGORIES = [
  { value: 'all', label: 'All Alerts' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'security', label: 'Security' },
  { value: 'scam_warning', label: 'Scam Warning' },
  { value: 'lost_found', label: 'Lost & Found' },
  { value: 'traffic_transport', label: 'Traffic' },
  { value: 'event', label: 'Events' },
  { value: 'utility_outage', label: 'Utilities' },
  { value: 'campus_notice', label: 'Campus' },
  { value: 'marketplace_fraud', label: 'Fraud' },
  { value: 'weather', label: 'Weather' }
];

// Verification levels for filter
const VERIFICATION_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'community_verified', label: 'Community Verified' },
  { value: 'mod_verified', label: 'Moderator Verified' },
  { value: 'official', label: 'Official' }
];

export default function AlertFeedPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    verificationLevel: 'all',
    severity: 'all'
  });
  
  const toast = useToast();

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      
      if (filters.verificationLevel !== 'all') {
        params.verificationLevel = filters.verificationLevel;
      }
      
      if (filters.severity !== 'all') {
        params.severity = filters.severity;
      }

      const response = await api.get('/alerts', { params });
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Initialize Socket.IO and fetch alerts
  useEffect(() => {
    // Initialize socket connection
    const socket = initializeSocket();

    // Listen for realtime updates
    const cleanupNewAlert = onNewAlert((newAlert) => {
      console.log('🔔 New alert received:', newAlert);
      setAlerts(prev => [newAlert, ...prev]);
      toast.info(`New ${newAlert.category.replace('_', ' ')} alert!`);
    });

    const cleanupUpdate = onAlertUpdate((updatedAlert) => {
      console.log('🔄 Alert updated:', updatedAlert);
      setAlerts(prev => 
        prev.map(alert => 
          alert._id === updatedAlert._id ? updatedAlert : alert
        )
      );
    });

    const cleanupDelete = onAlertDelete(({ alertId }) => {
      console.log('🗑️ Alert deleted:', alertId);
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
    });

    // Initial fetch
    fetchAlerts();

    // Cleanup on unmount
    return () => {
      cleanupNewAlert();
      cleanupUpdate();
      cleanupDelete();
      disconnectSocket();
    };
  }, [fetchAlerts, toast]);

  // Handle creating a new alert
  const handleCreateAlert = async (formData) => {
    try {
      const response = await api.post('/alerts', formData);
      toast.success('Alert created successfully!');
      setShowCreateForm(false);
      
      // Alert will be added via Socket.IO, but just in case
      if (response.data?.data) {
        setAlerts(prev => [response.data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error(error.response?.data?.message || 'Failed to create alert');
      throw error;
    }
  };

  // Handle confirming an alert
  const handleConfirmAlert = async (alertId) => {
    try {
      await api.post(`/alerts/${alertId}/confirm`);
      toast.success('Alert confirmed!');
    } catch (error) {
      console.error('Error confirming alert:', error);
      toast.error('Failed to confirm alert');
    }
  };

  // Filter change handler
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <div className="alert-feed-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Community Alerts</h1>
          <p>Stay informed with verified community alerts</p>
        </div>
        <motion.button
          className="btn-create-alert"
          onClick={() => setShowCreateForm(!showCreateForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showCreateForm ? 'Cancel' : '+ Create Alert'}
        </motion.button>
      </div>

      {/* Create Alert Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="create-form-wrapper"
          >
            <CreateAlertForm 
              onSubmit={handleCreateAlert}
              onCancel={() => setShowCreateForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Verification:</label>
          <select
            value={filters.verificationLevel}
            onChange={(e) => handleFilterChange('verificationLevel', e.target.value)}
            className="filter-select"
          >
            {VERIFICATION_LEVELS.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="official">Official</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <p>No alerts found</p>
            <p className="empty-hint">Be the first to create an alert for your community!</p>
          </div>
        ) : (
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <AlertCard
                  alert={alert}
                  onConfirm={() => handleConfirmAlert(alert._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
