import { FaTrash, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function DraftsList({ drafts = [], onDelete }) {
  if (drafts.length === 0) {
    return (
      <div className="drafts-empty">
        <p>No drafts. All caught up!</p>
      </div>
    );
  }

  return (
    <div className="drafts-list">
      {drafts.map((draft) => (
        <div key={draft.id} className="drafts-item">
          <div className="drafts-info">
            <p className="drafts-title">{draft.title || draft.content?.substring(0, 50) || 'Untitled draft'}</p>
            <span className="drafts-date">
              Last edited {new Date(draft.updatedAt || draft.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="drafts-actions">
            <Link to={`/create/post?edit=${draft.id}`} className="drafts-edit" aria-label="Edit draft">
              <FaEdit />
            </Link>
            <button
              className="drafts-delete"
              onClick={() => onDelete?.(draft.id)}
              aria-label="Delete draft"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
