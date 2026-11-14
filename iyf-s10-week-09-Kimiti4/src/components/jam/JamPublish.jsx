import { FaRocket, FaSave } from 'react-icons/fa';

export default function JamPublish({ data, onPublish, isSubmitting = false }) {
  const handlePublish = () => {
    if (isSubmitting) return;
    onPublish({ status: 'active' });
  };

  const handleSaveDraft = () => {
    if (isSubmitting) return;
    onPublish({ status: 'draft' });
  };

  return (
    <div className="jam-publish">
      <h2 className="jam-publish-title">Ready to go live?</h2>
      <p className="jam-publish-subtitle">
        Your Jam will be visible once published. Drafts stay private until you publish.
      </p>

      <div className="jam-publish-summary">
        <div className="jam-publish-row">
          <span className="jam-publish-label">Title</span>
          <span className="jam-publish-value">{data.title || '—'}</span>
        </div>
        <div className="jam-publish-row">
          <span className="jam-publish-label">Prompt</span>
          <span className="jam-publish-value">{data.prompt || '—'}</span>
        </div>
        <div className="jam-publish-row">
          <span className="jam-publish-label">Participation</span>
          <span className="jam-publish-value">
            {(data.participationTypes || []).join(', ') || '—'}
          </span>
        </div>
        {data.category && (
          <div className="jam-publish-row">
            <span className="jam-publish-label">Category</span>
            <span className="jam-publish-value">{data.category}</span>
          </div>
        )}
        {data.deadline && (
          <div className="jam-publish-row">
            <span className="jam-publish-label">Deadline</span>
            <span className="jam-publish-value">
              {new Date(data.deadline).toLocaleString('en-KE', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      <div className="jam-publish-actions">
        <button
          type="button"
          className="btn btn-primary jam-publish-btn"
          onClick={handlePublish}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Publishing…'
          ) : (
            <>
              <FaRocket aria-hidden="true" /> Publish Jam
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary jam-publish-btn"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
        >
          <FaSave aria-hidden="true" /> Save as draft
        </button>
      </div>
    </div>
  );
}
