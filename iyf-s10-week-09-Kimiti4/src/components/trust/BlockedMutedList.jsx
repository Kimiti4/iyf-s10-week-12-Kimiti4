/**
 * BlockedMutedList
 *
 * Settings component showing blocked and muted users.
 * Allows unblocking and unmuting.
 *
 * @module components/trust/BlockedMutedList
 */

import { useState, useEffect, useCallback } from 'react';
import { FaBan, FaVolumeMute, FaUser, FaSpinner } from 'react-icons/fa';
import { safetyAPI } from '../../services/safetyApi';
import { STATUS } from '../../utils/constants';

export default function BlockedMutedList() {
  const [activeTab, setActiveTab] = useState('blocked');
  const [blocked, setBlocked] = useState([]);
  const [muted, setMuted] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    setStatus(STATUS.LOADING);
    setError(null);
    try {
      const [blockedResult, mutedResult] = await Promise.allSettled([
        safetyAPI.getBlockedUsers(),
        safetyAPI.getMutedUsers(),
      ]);
      if (blockedResult.status === 'fulfilled') setBlocked(blockedResult.value);
      if (mutedResult.status === 'fulfilled') setMuted(mutedResult.value);
      setStatus(STATUS.LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(STATUS.ERROR);
    }
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const handleUnblock = useCallback(async (userId) => {
    try {
      await safetyAPI.unblock(userId);
      setBlocked((prev) => prev.filter((r) => r.targetUserId !== userId));
    } catch {
      // Failed — keep state
    }
  }, []);

  const handleUnmute = useCallback(async (userId) => {
    try {
      await safetyAPI.unmute(userId);
      setMuted((prev) => prev.filter((r) => r.targetUserId !== userId));
    } catch {
      // Failed — keep state
    }
  }, []);

  const items = activeTab === 'blocked' ? blocked : muted;
  const handleRemove = activeTab === 'blocked' ? handleUnblock : handleUnmute;
  const Icon = activeTab === 'blocked' ? FaBan : FaVolumeMute;

  return (
    <div className="blocked-muted-list" aria-label="Blocked and muted users">
      <div className="blocked-muted-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'blocked'}
          className={`blocked-muted-tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          Blocked ({blocked.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'muted'}
          className={`blocked-muted-tab ${activeTab === 'muted' ? 'active' : ''}`}
          onClick={() => setActiveTab('muted')}
        >
          Muted ({muted.length})
        </button>
      </div>

      {status === STATUS.LOADING && (
        <div className="blocked-muted-loading" aria-label="Loading">
          <FaSpinner className="spin" aria-hidden="true" /> Loading...
        </div>
      )}

      {error && (
        <div className="blocked-muted-error" role="alert">{error}</div>
      )}

      {status === STATUS.LOADED && items.length === 0 && (
        <div className="blocked-muted-empty">
          No {activeTab} users.
        </div>
      )}

      {items.map((record) => (
        <div key={record.id} className="blocked-muted-item">
          <div className="blocked-muted-user">
            <FaUser className="blocked-muted-user-icon" aria-hidden="true" />
            <span className="blocked-muted-username">{record.targetUsername}</span>
          </div>
          <button
            className="blocked-muted-remove-btn"
            onClick={() => handleRemove(record.targetUserId)}
            aria-label={`${activeTab === 'blocked' ? 'Unblock' : 'Unmute'} ${record.targetUsername}`}
          >
            <Icon aria-hidden="true" />
            {activeTab === 'blocked' ? 'Unblock' : 'Unmute'}
          </button>
        </div>
      ))}
    </div>
  );
}
