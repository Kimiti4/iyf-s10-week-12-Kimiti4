import { FaUserPlus } from 'react-icons/fa';
import AvatarIcon from '../AvatarIcon';
import { useFollow } from '../../hooks/useFollow';

export default function SuggestedUsers({ users = [] }) {
  if (users.length === 0) return null;

  return (
    <div className="suggested-users">
      <h2 className="suggested-users-title">Suggested for you</h2>
      <div className="suggested-users-list">
        {users.map((user) => (
          <SuggestedUserCard key={user.id || user._id} user={user} />
        ))}
      </div>
    </div>
  );
}

function SuggestedUserCard({ user }) {
  const { isFollowing, toggleFollow } = useFollow(user.id || user._id);

  return (
    <div className="suggested-user-card">
      <AvatarIcon user={user} size="medium" />
      <div className="suggested-user-info">
        <p className="suggested-user-name">{user.username}</p>
        <p className="suggested-user-bio">{user.profile?.bio?.substring(0, 50) || ''}</p>
      </div>
      <button
        className={`suggested-user-follow ${isFollowing ? 'following' : ''}`}
        onClick={toggleFollow}
      >
        {isFollowing ? 'Following' : <><FaUserPlus /> Follow</>}
      </button>
    </div>
  );
}
