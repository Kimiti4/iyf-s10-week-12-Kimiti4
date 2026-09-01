/**
 * useReport Hook
 *
 * Manages the report submission flow for any content type.
 * Follows the optimistic update pattern used throughout the codebase.
 *
 * @module hooks/useReport
 */

import { useState, useCallback, useRef } from 'react';
import { moderationAPI } from '../services/moderationApi';
import { validateReport } from '../domain/trust/trustRules';

export function useReport() {
  const [reportStatus, setReportStatus] = useState('idle');
  const [reportError, setReportError] = useState(null);
  const [reportedItems, setReportedItems] = useState(() => new Set());
  const pendingRef = useRef(new Set());

  const report = useCallback(async ({ targetType, targetId, reason, description, reporterId }) => {
    if (pendingRef.current.has(targetId)) return;

    const validation = validateReport({ targetType, targetId, reason, reporterId });
    if (!validation.valid) {
      setReportError(validation.error);
      return;
    }

    pendingRef.current.add(targetId);
    setReportStatus('loading');
    setReportError(null);

    try {
      await moderationAPI.report({ targetType, targetId, reason, description });
      setReportedItems((prev) => new Set([...prev, targetId]));
      setReportStatus('success');
    } catch (err) {
      setReportError(err.message || 'Failed to submit report.');
      setReportStatus('error');
    } finally {
      pendingRef.current.delete(targetId);
    }
  }, []);

  const isReported = useCallback((targetId) => reportedItems.has(targetId), [reportedItems]);

  const reset = useCallback(() => {
    setReportStatus('idle');
    setReportError(null);
  }, []);

  return { report, reportStatus, reportError, isReported, reset };
}
