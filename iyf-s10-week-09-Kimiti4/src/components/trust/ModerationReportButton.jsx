/**
 * ModerationReportButton
 *
 * A button that opens the report sheet for any content type.
 * Integrates into PostActions, ReelActions, JamCard, etc.
 *
 * @module components/trust/ModerationReportButton
 */

import { useState } from 'react';
import { FaFlag } from 'react-icons/fa';
import ReportSheet from './ReportSheet';
import { useReport } from '../../hooks/useReport';

export default function ModerationReportButton({ targetType, targetId, currentUserId, variant = 'icon' }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { report, isReported } = useReport();
  const reported = isReported(targetId);

  if (variant === 'text') {
    return (
      <>
        <button
          className={`report-text-btn ${reported ? 'reported' : ''}`}
          onClick={() => setSheetOpen(true)}
          disabled={reported}
          aria-label={reported ? 'Already reported' : `Report ${targetType}`}
        >
          <FaFlag aria-hidden="true" />
          {reported ? 'Reported' : 'Report'}
        </button>
        <ReportSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSubmit={report}
          targetType={targetType}
          targetId={targetId}
          currentUserId={currentUserId}
          isReported={reported}
        />
      </>
    );
  }

  return (
    <>
      <button
        className={`post-action-btn report-btn ${reported ? 'active reported' : ''}`}
        onClick={() => setSheetOpen(true)}
        disabled={reported}
        aria-label={reported ? 'Already reported' : `Report ${targetType}`}
      >
        <FaFlag />
      </button>
      <ReportSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={report}
        targetType={targetType}
        targetId={targetId}
        currentUserId={currentUserId}
        isReported={reported}
      />
    </>
  );
}
