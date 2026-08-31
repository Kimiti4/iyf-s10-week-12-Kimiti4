import { FaLink } from 'react-icons/fa';
import JamInlineCard from './JamInlineCard';

export default function PostJamConnector({ jam, contribution }) {
  if (!jam) return null;

  return (
    <div className="post-jam-connector">
      <div className="post-jam-connector-badge">
        <FaLink className="post-jam-connector-icon" />
        <span>Part of a Jam</span>
      </div>
      <JamInlineCard jam={jam} />
      {contribution && (
        <p className="post-jam-connector-contribution">
          {contribution}
        </p>
      )}
    </div>
  );
}
