import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBug, FaLightbulb, FaCommentAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { feedbackAPI } from '../services/api';

const INITIAL = { name: '', email: '', type: 'general', message: '', priority: 'medium' };

export default function FeedbackForm({ isOpen, onClose }) {
    const [formData, setFormData] = useState(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await feedbackAPI.submit(formData);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFormData(INITIAL);
                onClose();
            }, 1800);
        } catch (err) {
            setError(err?.message || 'We could not submit your feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="feedback-overlay" onClick={onClose} role="presentation">
            <motion.div className="feedback-form-container" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
                <div className="feedback-header">
                    <div>
                        <span className="feedback-kicker">BETA FEEDBACK</span>
                        <h2>Help shape JamiiLink</h2>
                        <p>Tell us what worked, what did not, or what would make the product more useful.</p>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close feedback">×</button>
                </div>

                <AnimatePresence>
                    {submitted ? (
                        <motion.div className="success-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <FaCheckCircle className="success-icon" />
                            <p>Thanks. Your feedback has been recorded.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="feedback-form">
                            {error && <div className="error-message" role="alert">{error}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="feedback-name">Name <span>(optional)</span></label>
                                    <input id="feedback-name" name="name" maxLength="120" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="feedback-email">Email <span>(optional)</span></label>
                                    <input id="feedback-email" name="email" type="email" maxLength="255" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>What are you sharing?</label>
                                <div className="type-selector">
                                    {[
                                        ['general', FaCommentAlt, 'General'],
                                        ['bug', FaBug, 'Bug'],
                                        ['feature', FaLightbulb, 'Feature idea']
                                    ].map(([type, Icon, label]) => (
                                        <label key={type} className={`type-option ${formData.type === type ? 'active' : ''}`}>
                                            <input type="radio" name="type" value={type} checked={formData.type === type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                                            <Icon className="type-icon" aria-hidden="true" />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {formData.type === 'bug' && (
                                <div className="form-group">
                                    <label htmlFor="feedback-priority">Priority</label>
                                    <select id="feedback-priority" name="priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="feedback-message">Message</label>
                                <textarea id="feedback-message" name="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required maxLength="5000" rows="6" placeholder="What happened, what did you expect, or what should we improve?" />
                                <small>{formData.message.length}/5000</small>
                            </div>

                            <button type="submit" className="submit-btn" disabled={submitting || !formData.message.trim()}>
                                {submitting ? <><FaSpinner className="spinner" /> Saving…</> : 'Send feedback'}
                            </button>
                        </form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
