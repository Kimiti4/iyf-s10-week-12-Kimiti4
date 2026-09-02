import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCompass, FaPlus, FaBell, FaUser } from 'react-icons/fa';

const MobileBottomNav = memo(function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/discover', icon: <FaCompass />, label: 'Discover' },
    { path: '/create/jam', icon: <FaPlus />, label: 'Create', highlight: true },
    { path: '/alerts', icon: <FaBell />, label: 'Alerts' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => {
        const isActive = item.path === '/profile'
          ? location.pathname === '/profile' || location.pathname.startsWith('/profile/')
          : location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`mobile-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'mobile-nav-item--create' : ''}`}
          >
            <span className="mobile-nav-item__icon">{item.icon}</span>
            <span className="mobile-nav-item__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});

export default MobileBottomNav;
