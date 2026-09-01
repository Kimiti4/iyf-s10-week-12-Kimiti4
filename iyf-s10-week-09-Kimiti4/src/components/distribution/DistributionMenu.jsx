import { useState, useEffect, useRef } from 'react';
import { FaShare, FaRetweet, FaExchangeAlt, FaTimes } from 'react-icons/fa';
import { canRepost, canRemix } from '../../domain/distribution/distributionRules';

export default function DistributionMenu({ item, currentUserId, isOpen, onClose, onShare, onRepost, onRemix }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const repostCheck = canRepost(item, currentUserId);
  const remixCheck = canRemix(item, currentUserId);

  return (
    <div className="distribution-menu-overlay" onClick={onClose}>
      <div
        ref={menuRef}
        className="distribution-menu"
        onClick={(e) => e.stopPropagation()}
        role="menu"
        aria-label="Distribution options"
        tabIndex={-1}
      >
        <div className="distribution-menu-header">
          <h3>Actions</h3>
          <button className="distribution-menu-close" onClick={onClose} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <div className="distribution-menu-options">
          <button
            className="distribution-menu-option"
            onClick={() => { onShare?.(item); onClose(); }}
            role="menuitem"
          >
            <FaShare />
            <span>Share</span>
          </button>

          <button
            className={`distribution-menu-option ${!repostCheck.allowed ? 'disabled' : ''}`}
            onClick={() => repostCheck.allowed && onRepost?.(item)}
            disabled={!repostCheck.allowed}
            title={repostCheck.reason}
            role="menuitem"
          >
            <FaRetweet />
            <span>{item.isReposted ? 'Undo repost' : 'Repost'}</span>
          </button>

          <button
            className={`distribution-menu-option ${!remixCheck.allowed ? 'disabled' : ''}`}
            onClick={() => remixCheck.allowed && onRemix?.(item)}
            disabled={!remixCheck.allowed}
            title={remixCheck.reason}
            role="menuitem"
          >
            <FaExchangeAlt />
            <span>Remix</span>
          </button>
        </div>
      </div>
    </div>
  );
}
