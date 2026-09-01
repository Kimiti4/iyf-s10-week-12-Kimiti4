import { FaExchangeAlt } from 'react-icons/fa';

export default function RemixAttribution({ sourceCreatorName, sourceCreatorAvatar, sourcePreview }) {
  if (!sourceCreatorName) return null;

  return (
    <div className="remix-attribution" role="note" aria-label={`Remixed from ${sourceCreatorName}`}>
      <div className="remix-attribution-header">
        <FaExchangeAlt className="remix-attribution-icon" />
        <span className="remix-attribution-label">
          Remixed from{' '}
          <span className="remix-attribution-creator">@{sourceCreatorName}</span>
        </span>
      </div>
      {sourcePreview && (
        <p className="remix-attribution-preview">{sourcePreview}</p>
      )}
    </div>
  );
}
