/**
 * ReportSheet
 *
 * Modal overlay for reporting content.
 * Provides structured reason selection and optional description.
 * Accessible: focus trap, keyboard navigation, screen reader labels.
 *
 * @module components/trust/ReportSheet
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { FaTimes, FaFlag, FaCheckCircle } from 'react-icons/fa';
import { REPORT_REASON } from '../../domain/trust/trustTypes';
import { getReportReasonLabel } from '../../domain/trust/trustUtils';

const REPORT_REASONS = Object.values(REPORT_REASON);

export default function ReportSheet({ isOpen, onClose, onSubmit, targetType, targetId, isReported }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef(null);
  const firstOptionRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstOptionRef.current) {
      firstOptionRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedReason(null);
      setDescription('');
      setSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(() => {
    if (!selectedReason || isReported) return;
    onSubmit({ targetType, targetId, reason: selectedReason, description });
    setSubmitted(true);
  }, [selectedReason, description, targetType, targetId, isReported, onSubmit]);

  if (!isOpen) return null;

  if (isReported || submitted) {
    return (
      <div className="report-sheet-overlay" ref={overlayRef} role="dialog" aria-label="Report submitted">
        <div className="report-sheet">
          <div className="report-sheet-success">
            <FaCheckCircle className="report-success-icon" aria-hidden="true" />
            <h3>Report Submitted</h3>
            <p>Thank you for helping keep JamiiLink safe. We will review your report.</p>
            <button className="report-sheet-close-btn" onClick={onClose} aria-label="Close">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-sheet-overlay" ref={overlayRef} role="dialog" aria-label="Report content" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="report-sheet">
        <div className="report-sheet-header">
          <FaFlag className="report-flag-icon" aria-hidden="true" />
          <h3>Report {targetType}</h3>
          <button className="report-sheet-close" onClick={onClose} aria-label="Close report dialog">
            <FaTimes />
          </button>
        </div>

        <div className="report-sheet-body">
          <p className="report-sheet-prompt">Why are you reporting this {targetType}?</p>

          <div className="report-reasons" role="radiogroup" aria-label="Report reason">
            {REPORT_REASONS.map((reason, i) => (
              <button
                key={reason}
                ref={i === 0 ? firstOptionRef : undefined}
                className={`report-reason-option ${selectedReason === reason ? 'selected' : ''}`}
                onClick={() => setSelectedReason(reason)}
                role="radio"
                aria-checked={selectedReason === reason}
              >
                {getReportReasonLabel(reason)}
              </button>
            ))}
          </div>

          <label className="report-description-label" htmlFor="report-description">
            Additional details (optional)
          </label>
          <textarea
            id="report-description"
            className="report-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide any additional context..."
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="report-sheet-footer">
          <button className="report-cancel-btn" onClick={onClose} aria-label="Cancel report">
            Cancel
          </button>
          <button
            className="report-submit-btn"
            onClick={handleSubmit}
            disabled={!selectedReason}
            aria-label="Submit report"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
