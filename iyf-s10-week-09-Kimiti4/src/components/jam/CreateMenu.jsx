import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaPen, FaVideo, FaFire, FaBriefcase, FaStore } from 'react-icons/fa';
import './CreateMenu.css';

const CREATE_OPTIONS = [
  { id: 'post', label: 'Post', icon: FaPen, color: '#4ecdc4', route: '/create/post' },
  { id: 'jam', label: 'Jam', icon: FaFire, color: '#ff6b6b', route: '/create/jam', signature: true },
  { id: 'reel', label: 'Reel', icon: FaVideo, color: '#a855f7', route: '/create/reel' },
  { id: 'gig', label: 'Gig', icon: FaBriefcase, color: '#f59e0b', route: '/create/gig' },
  { id: 'listing', label: 'Listing', icon: FaStore, color: '#10b981', route: '/create/listing' },
];

export default function CreateMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setIsOpen(false);
    navigate(option.route);
  };

  return (
    <div className="create-menu" ref={menuRef}>
      <button
        className="create-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Create content"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FaPlus />
        <span className="create-menu-trigger-text">Create</span>
      </button>

      {isOpen && (
        <div className="create-menu-dropdown" role="menu">
          {CREATE_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`create-menu-option ${option.signature ? 'signature' : ''}`}
              onClick={() => handleSelect(option)}
              role="menuitem"
            >
              <span className="create-menu-icon" style={{ color: option.color }}>
                <option.icon />
              </span>
              <span className="create-menu-label">{option.label}</span>
              {option.signature && <span className="create-menu-badge">Signature</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
