/**
 * UserSafetyMenu
 *
 * Dropdown menu for user safety actions (block, mute, restrict).
 * Used in post author headers, profile pages, and user context menus.
 *
 * @module components/trust/UserSafetyMenu
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { FaBan, FaVolumeMute, FaLock, FaFlag, FaEllipsisV, FaTimes } from 'react-icons/fa';
import ReportSheet from './ReportSheet';
import { useReport } from '../../hooks/useReport';

export default function UserSafetyMenu({
  targetUserId,
  targetUsername,
  isBlocked,
  isMuted,
  isRestricted,
  onBlock,
  onUnblock,
  onMute,
  onUnmute,
  onRestrict,
  onUnrestrict,
  currentUserId,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const menuRef = useRef(null);
  const { report, isReported } = useReport();

  const isSelf = targetUserId === currentUserId;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = useCallback((action) => {
    action();
    setIsOpen(false);
  }, []);

  if (isSelf) return null;

  return (
    <div className="user-safety-menu" ref={menuRef}>
      <button
        className="safety-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Safety options for ${targetUsername}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? <FaTimes /> : <FaEllipsisV />}
      </button>

      {isOpen && (
        <div className="safety-menu-dropdown" role="menu" aria-label="User safety options">
          {isBlocked ? (
            <button className="safety-menu-item" onClick={() => handleAction(onUnblock)} role="menuitem">
              <FaBan className="safety-menu-icon" aria-hidden="true" />
              Unblock {targetUsername}
            </button>
          ) : (
            <button className="safety-menu-item danger" onClick={() => handleAction(onBlock)} role="menuitem">
              <FaBan className="safety-menu-icon" aria-hidden="true" />
              Block {targetUsername}
            </button>
          )}

          {isMuted ? (
            <button className="safety-menu-item" onClick={() => handleAction(onUnmute)} role="menuitem">
              <FaVolumeMute className="safety-menu-icon" aria-hidden="true" />
              Unmute {targetUsername}
            </button>
          ) : (
            <button className="safety-menu-item" onClick={() => handleAction(onMute)} role="menuitem">
              <FaVolumeMute className="safety-menu-icon" aria-hidden="true" />
              Mute {targetUsername}
            </button>
          )}

          {isRestricted ? (
            <button className="safety-menu-item" onClick={() => handleAction(onUnrestrict)} role="menuitem">
              <FaLock className="safety-menu-icon" aria-hidden="true" />
              Unrestrict {targetUsername}
            </button>
          ) : (
            <button className="safety-menu-item" onClick={() => handleAction(onRestrict)} role="menuitem">
              <FaLock className="safety-menu-icon" aria-hidden="true" />
              Restrict {targetUsername}
            </button>
          )}

          <hr className="safety-menu-divider" />

          <button
            className="safety-menu-item"
            onClick={() => { setReportOpen(true); setIsOpen(false); }}
            role="menuitem"
            disabled={isReported}
          >
            <FaFlag className="safety-menu-icon" aria-hidden="true" />
            {isReported ? 'Already Reported' : 'Report User'}
          </button>
        </div>
      )}

      <ReportSheet
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={report}
        targetType="profile"
        targetId={targetUserId}
        isReported={isReported(targetUserId)}
      />
    </div>
  );
}
