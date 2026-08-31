import { FaFire, FaUsers, FaBullseye, FaPaintBrush, FaMusic, FaGamepad, FaGraduationCap, FaLaptop } from 'react-icons/fa';

const DEFAULT_CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: FaFire, color: '#ef4444' },
  { id: 'jams', label: 'Active Jams', icon: FaBullseye, color: '#ff6b6b' },
  { id: 'creators', label: 'Creators', icon: FaUsers, color: '#3b82f6' },
  { id: 'art', label: 'Art & Design', icon: FaPaintBrush, color: '#8b5cf6' },
  { id: 'music', label: 'Music', icon: FaMusic, color: '#ec4899' },
  { id: 'gaming', label: 'Gaming', icon: FaGamepad, color: '#10b981' },
  { id: 'education', label: 'Learning', icon: FaGraduationCap, color: '#f59e0b' },
  { id: 'tech', label: 'Technology', icon: FaLaptop, color: '#06b6d4' },
];

export default function CategoryGrid({ categories = [], onSelect }) {
  const items = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="category-grid">
      {items.map((cat) => {
        const Icon = cat.icon || FaFire;
        return (
          <button
            key={cat.id || cat._id}
            className="category-card"
            onClick={() => onSelect?.(cat.id || cat._id)}
            style={{ '--cat-color': cat.color || '#6b7280' }}
          >
            <Icon className="category-card-icon" />
            <span className="category-card-label">{cat.label || cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
