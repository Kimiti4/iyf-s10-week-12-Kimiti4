import { useState } from 'react';
import { FaRocket, FaSave } from 'react-icons/fa';

export default function JamPublish({ data, onPublish }) {
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onPublish();
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    onPublish({ status: 'draft' });
  };

  return (
    <div className="jam-publish">
      <h2 className="jam-publish-title">Ready to go live?</h2>
      <p className="jam-publish-subtitle">
        Your Jam will be visible to everyone once published
      </p>

      <div className="jam-publish-summary">
        <div className="jam-publish-row">
          <span className="jam-publish-label">Title</span>
          <span className="jam-publish-value">{data.title}</span>
        </div>
        <div className="jam-publish-row">
          <span className="jam-publish-label">Prompt</span>
          <span className="jam-publish-value">{data.prompt}</span>
        </div>
        <div className="jam-publish-row">
          <span className="jam-publish-label">Participation</span>
          <span className="jam-publish-value">
            {data.participationTypes.join(', ')}
          </span>
        </div>
        {data.deadline && (
          <div className="jam-publish-row">
            <span className="jam-publish-label">Deadline</span>
            <span className="jam-publish-value">
              {new Date(data.deadline).toLocaleDateString('en-KE', {
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
          className="jam-publish-btn primary"
          onClick={handlePublish}
          disabled={publishing}
        >
          {publishing ? (
            'Publishing...'
          ) : (
            <>
              <FaRocket /> Publish Jam
            </>
          )}
        </button>

        <button
          className="jam-publish-btn secondary"
          onClick={handleSaveDraft}
          disabled={publishing}
        >
          <FaSave /> Save as Draft
        </button>
      </div>
    </div>
  );
}
