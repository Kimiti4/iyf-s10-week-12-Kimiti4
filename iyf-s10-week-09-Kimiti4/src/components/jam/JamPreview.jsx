import { JAM_CATEGORIES } from '../../models/jam';

const CATEGORY_LABELS = {
  [JAM_CATEGORIES.CREATOR]: '🎨 Creator',
  [JAM_CATEGORIES.MTAAI]: '📍 Mtaani',
  [JAM_CATEGORIES.SKILLS]: '🛠️ Skills',
  [JAM_CATEGORIES.GIGS]: '💼 Gigs',
  [JAM_CATEGORIES.FARM]: '🌱 Farm',
  [JAM_CATEGORIES.GAMING]: '🎮 Gaming',
  [JAM_CATEGORIES.MUSIC]: '🎵 Music',
  [JAM_CATEGORIES.CHALLENGE]: '🏆 Challenge',
  [JAM_CATEGORIES.COMMUNITY]: '🤝 Community',
  [JAM_CATEGORIES.OTHER]: '📦 Other',
};

export default function JamPreview({ data }) {
  const deadline = data.deadline
    ? new Date(data.deadline).toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="jam-preview">
      <h2 className="jam-preview-title">Preview</h2>
      <p className="jam-preview-subtitle">
        This is how your Jam will appear to others
      </p>

      <div className="jam-preview-card">
        {/* Header */}
        <div className="jam-preview-header">
          <span className="jam-preview-badge">🔥 JAM</span>
          {data.category && (
            <span className="jam-preview-category">
              {CATEGORY_LABELS[data.category] || data.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="jam-preview-card-title">
          {data.title || 'Your Jam Title'}
        </h3>

        {/* Prompt */}
        {data.prompt && (
          <p className="jam-preview-prompt">{data.prompt}</p>
        )}

        {/* Description */}
        {data.description && (
          <p className="jam-preview-description">{data.description}</p>
        )}

        {/* Participation Types */}
        <div className="jam-preview-types">
          <span className="jam-preview-types-label">Accepts:</span>
          <div className="jam-preview-types-list">
            {data.participationTypes.map((type) => (
              <span key={type} className="jam-preview-type-chip">
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Deadline */}
        {deadline && (
          <div className="jam-preview-deadline">
            ⏱️ Ends {deadline}
          </div>
        )}

        {/* Footer */}
        <div className="jam-preview-footer">
          <div className="jam-preview-participants">
            <span className="jam-preview-avatars">
              <span className="jam-preview-avatar">?</span>
            </span>
            <span className="jam-preview-count">0 participating</span>
          </div>
          <button className="jam-preview-join-btn" disabled>
            JOIN THIS JAM
          </button>
        </div>
      </div>
    </div>
  );
}
