/**
 * 🔹 Create Alert Form Component
 * Allows users to create new community alerts with category selection
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaExclamationTriangle,
  FaShieldAlt,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaBullhorn,
  FaCarCrash,
  FaCloudSun,
  FaUniversity,
  FaStore,
  FaTimes
} from 'react-icons/fa';
import './CreateAlertForm.css';

// Alert categories configuration
const ALERT_CATEGORIES = [
  { 
    value: 'emergency', 
    label: 'Emergency', 
    icon: <FaExclamationTriangle />,
    color: '#ef4444',
    description: 'Life-threatening situations, urgent help needed'
  },
  { 
    value: 'security', 
    label: 'Security', 
    icon: <FaShieldAlt />,
    color: '#f59e0b',
    description: 'Crime, theft, suspicious activity'
  },
  { 
    value: 'scam_warning', 
    label: 'Scam Warning', 
    icon: <FaSearch />,
    color: '#f97316',
    description: 'Fraud attempts, fake sellers, phishing'
  },
  { 
    value: 'lost_found', 
    label: 'Lost & Found', 
    icon: <FaUsers />,
    color: '#3b82f6',
    description: 'Missing items, found belongings'
  },
  { 
    value: 'traffic_transport', 
    label: 'Traffic & Transport', 
    icon: <FaCarCrash />,
    color: '#8b5cf6',
    description: 'Accidents, road closures, transport issues'
  },
  { 
    value: 'event', 
    label: 'Event', 
    icon: <FaBullhorn />,
    color: '#ec4899',
    description: 'Community events, gatherings, announcements'
  },
  { 
    value: 'utility_outage', 
    label: 'Utility Outage', 
    icon: <FaClock />,
    color: '#6366f1',
    description: 'Power blackouts, water cuts, internet down'
  },
  { 
    value: 'campus_notice', 
    label: 'Campus Notice', 
    icon: <FaUniversity />,
    color: '#14b8a6',
    description: 'School announcements, class changes'
  },
  { 
    value: 'marketplace_fraud', 
    label: 'Marketplace Fraud', 
    icon: <FaStore />,
    color: '#f43f5e',
    description: 'Fake products, seller scams'
  },
  { 
    value: 'weather', 
    label: 'Weather', 
    icon: <FaCloudSun />,
    color: '#06b6d4',
    description: 'Storms, floods, extreme weather warnings'
  }
];

// Severity levels
const SEVERITY_LEVELS = [
  { value: 'info', label: 'Info', color: '#3b82f6', description: 'General information' },
  { value: 'warning', label: 'Warning', color: '#f59e0b', description: 'Important notice' },
  { value: 'critical', label: 'Critical', color: '#ef4444', description: 'Urgent action needed' },
  { value: 'official', label: 'Official', color: '#8b5cf6', description: 'Verified official source' }
];

export default function CreateAlertForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'info',
    location: '',
    radius: 5,
    expiresAt: ''
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        category: '',
        severity: 'info',
        location: '',
        radius: 5,
        expiresAt: ''
      });
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error submitting alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (categoryValue) => {
    setFormData(prev => ({ ...prev, category: categoryValue }));
    setSelectedCategory(categoryValue);
    // Clear category error when user selects one
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: null }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="create-alert-form-container"
    >
      <div className="form-header">
        <h2>Create Community Alert</h2>
        <p>Share important information with your community</p>
        {onCancel && (
          <button type="button" className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="create-alert-form">
        {/* Category Selection */}
        <div className="form-section">
          <label className="section-label">
            Alert Category <span className="required">*</span>
          </label>
          <div className="category-grid">
            {ALERT_CATEGORIES.map((category) => (
              <motion.button
                key={category.value}
                type="button"
                className={`category-card ${formData.category === category.value ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  borderColor: formData.category === category.value ? category.color : undefined,
                  backgroundColor: formData.category === category.value ? `${category.color}10` : undefined
                }}
              >
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <div className="category-info">
                  <span className="category-label">{category.label}</span>
                  <span className="category-description">{category.description}</span>
                </div>
              </motion.button>
            ))}
          </div>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        {/* Title */}
        <div className="form-section">
          <label htmlFor="title" className="form-label">
            Alert Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Brief, clear title for your alert"
            className={`form-input ${errors.title ? 'error' : ''}`}
            maxLength={200}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="char-count">{formData.title.length}/200</span>
        </div>

        {/* Description */}
        <div className="form-section">
          <label htmlFor="description" className="form-label">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Provide detailed information about the alert..."
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            rows={5}
            maxLength={2000}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="char-count">{formData.description.length}/2000</span>
        </div>

        {/* Severity Level */}
        <div className="form-section">
          <label className="section-label">Severity Level</label>
          <div className="severity-options">
            {SEVERITY_LEVELS.map((level) => (
              <motion.button
                key={level.value}
                type="button"
                className={`severity-option ${formData.severity === level.value ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  borderColor: formData.severity === level.value ? level.color : undefined,
                  backgroundColor: formData.severity === level.value ? `${level.color}10` : undefined
                }}
              >
                <span className="severity-dot" style={{ backgroundColor: level.color }}></span>
                <span className="severity-label">{level.label}</span>
                <span className="severity-description">{level.description}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Location (Optional) */}
        <div className="form-section">
          <label htmlFor="location" className="form-label">
            Location <span className="optional">(Optional)</span>
          </label>
          <div className="location-input-group">
            <FaMapMarkerAlt className="location-icon" />
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Add location (e.g., Westlands, Nairobi)"
              className="form-input"
            />
          </div>
        </div>

        {/* Radius Slider */}
        <div className="form-section">
          <label htmlFor="radius" className="form-label">
            Alert Radius: {formData.radius}km
          </label>
          <input
            type="range"
            id="radius"
            min="1"
            max="50"
            value={formData.radius}
            onChange={(e) => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
            className="range-slider"
          />
          <div className="range-labels">
            <span>1km</span>
            <span>25km</span>
            <span>50km</span>
          </div>
        </div>

        {/* Expiration Time */}
        <div className="form-section">
          <label htmlFor="expiresAt" className="form-label">
            Auto-Expire <span className="optional">(Optional)</span>
          </label>
          <input
            type="datetime-local"
            id="expiresAt"
            value={formData.expiresAt}
            onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            className="form-input"
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="help-text">Alert will automatically expire at this time</p>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Creating Alert...
              </>
            ) : (
              'Create Alert'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
