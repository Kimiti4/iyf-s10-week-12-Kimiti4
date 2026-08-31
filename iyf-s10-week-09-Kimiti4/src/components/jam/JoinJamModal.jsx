import { useState, useCallback, useRef, useEffect } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { participationAPI } from '../../services/jamApi';

const IDLE = 'idle';
const LOADING = 'loading';
const SUCCESS = 'success';
const ERROR = 'error';

const PARTICIPATION_LABELS = {
  video: '🎥 Video',
  image: '📸 Photo',
  post: '✍️ Post',
  poll: '🗳️ Poll',
  location: '📍 Location',
  skill: '🛠️ Skill',
  gig: '💼 Gig',
};

export default function JoinJamModal({ jam, isOpen, onClose, onJoined }) {
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStatus(IDLE);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleJoin = useCallback(async () => {
    setStatus(LOADING);
    setError('');

    try {
      await participationAPI.join(jam.id || jam._id);
      setStatus(SUCCESS);
      setTimeout(() => {
        onJoined?.();
        onClose();
      }, 800);
    } catch (err) {
      setStatus(ERROR);
      setError(err.message || 'Failed to join');
    }
  }, [jam, onJoined, onClose]);

  if (!isOpen) return null;

  return (
    <div className="jam-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Join Jam">
      <div
        className="jam-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="jam-modal-header">
          <h2 className="jam-modal-title">Join this Jam?</h2>
          <button className="jam-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="jam-modal-body">
          <p className="jam-modal-jam-title">{jam.title}</p>

          {jam.prompt && (
            <p className="jam-modal-prompt">{jam.prompt}</p>
          )}

          {jam.participationTypes?.length > 0 && (
            <div className="jam-modal-types">
              <span className="jam-modal-types-label">This Jam accepts:</span>
              <div className="jam-modal-types-list">
                {jam.participationTypes.map((type) => (
                  <span key={type} className="jam-modal-type-chip">
                    {PARTICIPATION_LABELS[type] || type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {status === SUCCESS && (
            <div className="jam-modal-success" role="status">
              <FaCheck /> You're in! Welcome to the Jam.
            </div>
          )}

          {status === ERROR && (
            <div className="jam-modal-error" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="jam-modal-footer">
          <button className="jam-modal-btn cancel" onClick={onClose} disabled={status === LOADING}>
            Not now
          </button>
          <button
            className="jam-modal-btn join"
            onClick={handleJoin}
            disabled={status === LOADING || status === SUCCESS}
          >
            {status === LOADING ? 'Joining...' : status === SUCCESS ? 'Joined!' : 'Join Jam'}
          </button>
        </div>
      </div>
    </div>
  );
}
