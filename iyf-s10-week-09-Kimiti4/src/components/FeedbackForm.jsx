/**
 * 🔹 FeedbackForm - User feedback component that sends to karamos473@gmail.com
 * Uses FormSubmit.co service (free, no backend needed)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBug, FaLightbulb, FaHeart, FaEnvelope, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function FeedbackForm({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'bug', // bug, feature, general
        message: '',
        priority: 'medium' // low, medium, high
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Using FormSubmit.co - free service that forwards to email
            const response = await fetch('https://formsubmit.co/ajax/karamos473@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: `[JamiiLink ${formData.type.toUpperCase()}] ${formData.priority === 'high' ? '🔴 HIGH PRIORITY' : ''} - ${formData.message.substring(0, 50)}...`,
                    type: formData.type,
                    priority: formData.priority,
                    message: formData.message,
                    _subject: `JamiiLink Feedback: ${formData.type} (${formData.priority})`,
                    _template: 'table'
                })
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    onClose();
                    setFormData({
                        name: '',
                        email: '',
                        type: 'bug',
                        message: '',
                        priority: 'medium'
                    });
                }, 3000);
            } else {
                throw new Error('Failed to send feedback');
            }
        } catch (err) {
            setError('Failed to send feedback. Please try again or email karamos473@gmail.com directly.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen) return null;

    return (
        <div className="feedback-overlay" onClick={onClose}>
            <motion.div 
                className="feedback-form-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="feedback-header">
                    <h2>💬 Share Your Feedback</h2>
                    <p>Help us improve JamiiLink!</p>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                    {submitted && (
                        <motion.div 
                            className="success-message"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <FaCheckCircle className="success-icon" />
                            <p>Thank you! Your feedback has been sent to karamos473@gmail.com</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            className="error-message"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                {!submitted && (
                    <form onSubmit={handleSubmit} className="feedback-form">
                        {/* Name & Email */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Name (Optional)</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="email">Email (Optional)</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Feedback Type */}
                        <div className="form-group">
                            <label>Feedback Type *</label>
                            <div className="type-selector">
                                <label className={`type-option ${formData.type === 'bug' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="bug"
                                        checked={formData.type === 'bug'}
                                        onChange={handleChange}
                                    />
                                    <FaBug className="type-icon" />
                                    <span>Bug Report</span>
                                </label>
                                
                                <label className={`type-option ${formData.type === 'feature' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="feature"
                                        checked={formData.type === 'feature'}
                                        onChange={handleChange}
                                    />
                                    <FaLightbulb className="type-icon" />
                                    <span>Feature Request</span>
                                </label>
                                
                                <label className={`type-option ${formData.type === 'general' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="general"
                                        checked={formData.type === 'general'}
                                        onChange={handleChange}
                                    />
                                    <FaHeart className="type-icon" />
                                    <span>General Feedback</span>
                                </label>
                            </div>
                        </div>

                        {/* Priority (only for bugs) */}
                        {formData.type === 'bug' && (
                            <div className="form-group">
                                <label>Priority Level</label>
                                <div className="priority-selector">
                                    <label className={`priority-option ${formData.priority === 'low' ? 'active low' : ''}`}>
                                        <input
                                            type="radio"
                                            name="priority"
                                            value="low"
                                            checked={formData.priority === 'low'}
                                            onChange={handleChange}
                                        />
                                        <span>🟢 Low</span>
                                    </label>
                                    
                                    <label className={`priority-option ${formData.priority === 'medium' ? 'active medium' : ''}`}>
                                        <input
                                            type="radio"
                                            name="priority"
                                            value="medium"
                                            checked={formData.priority === 'medium'}
                                            onChange={handleChange}
                                        />
                                        <span>🟡 Medium</span>
                                    </label>
                                    
                                    <label className={`priority-option ${formData.priority === 'high' ? 'active high' : ''}`}>
                                        <input
                                            type="radio"
                                            name="priority"
                                            value="high"
                                            checked={formData.priority === 'high'}
                                            onChange={handleChange}
                                        />
                                        <span>🔴 High</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Message */}
                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="6"
                                placeholder={
                                    formData.type === 'bug' 
                                        ? "Describe the bug:\n1. What were you doing?\n2. What happened?\n3. What did you expect to happen?"
                                        : formData.type === 'feature'
                                        ? "Describe your feature idea:\nWhat problem does it solve?\nHow would it work?"
                                        : "Share your thoughts, suggestions, or compliments..."
                                }
                            />
                            <small>{formData.message.length} characters</small>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={submitting || !formData.message.trim()}
                        >
                            {submitting ? (
                                <>
                                    <FaSpinner className="spinner" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FaEnvelope />
                                    Send Feedback
                                </>
                            )}
                        </button>

                        {/* Alternative Contact */}
                        <div className="alternative-contact">
                            <p>Or email directly: <a href="mailto:karamos473@gmail.com">karamos473@gmail.com</a></p>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
