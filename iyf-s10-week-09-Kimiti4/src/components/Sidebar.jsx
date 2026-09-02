import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import OfflineBadge from './OfflineBadge'
import './Sidebar.css'

const Sidebar = memo(function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const isActive = (path, prefix = false) => prefix
    ? location.pathname === path || location.pathname.startsWith(path + '/')
    : location.pathname === path

  if (!isAuthenticated) return null

  return (
    <aside className={`app-sidebar sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isOpen ? 'mobile-open' : ''}`}>
      <button
        className="sidebar-collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '»' : '«'}
      </button>

      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo" aria-label="JamiiLink home">
          <span className="logo-icon" aria-hidden="true">🌍</span>
          {!isCollapsed && <span className="logo-text">JamiiLink</span>}
        </Link>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {/* ── Main ── */}
        <div className="nav-group">
          {!isCollapsed && <h3 className="nav-section-title">Main</h3>}
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`} aria-current={isActive('/') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🏠</span>
            {!isCollapsed && <span className="nav-label">Home</span>}
          </Link>
          <Link to="/discover" className={`nav-item ${isActive('/discover') ? 'active' : ''}`} aria-current={isActive('/discover') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🔍</span>
            {!isCollapsed && <span className="nav-label">Discover</span>}
          </Link>
          <Link to="/reels" className={`nav-item ${isActive('/reels') ? 'active' : ''}`} aria-current={isActive('/reels') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🎬</span>
            {!isCollapsed && <span className="nav-label">Reels</span>}
          </Link>
          <Link to="/jams" className={`nav-item ${isActive('/jams') ? 'active' : ''}`} aria-current={isActive('/jams') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🔥</span>
            {!isCollapsed && <span className="nav-label">Jams</span>}
          </Link>
        </div>

        {/* ── Community ── */}
        <div className="nav-group">
          {!isCollapsed && <h3 className="nav-section-title">Community</h3>}
          <Link to="/mtaani" className={`nav-item ${isActive('/mtaani') ? 'active' : ''}`} aria-current={isActive('/mtaani') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🔔</span>
            {!isCollapsed && <span className="nav-label">Mtaani</span>}
          </Link>
          <Link to="/skills" className={`nav-item ${isActive('/skills') ? 'active' : ''}`} aria-current={isActive('/skills') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🤝</span>
            {!isCollapsed && <span className="nav-label">Skills</span>}
          </Link>
          <Link to="/farm" className={`nav-item ${isActive('/farm') ? 'active' : ''}`} aria-current={isActive('/farm') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🌱</span>
            {!isCollapsed && <span className="nav-label">Farm</span>}
          </Link>
          <Link to="/gigs" className={`nav-item ${isActive('/gigs') ? 'active' : ''}`} aria-current={isActive('/gigs') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">💼</span>
            {!isCollapsed && <span className="nav-label">Gigs</span>}
          </Link>
        </div>

        {/* ── Activity ── */}
        <div className="nav-group">
          {!isCollapsed && <h3 className="nav-section-title">Activity</h3>}
          <Link to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`} aria-current={isActive('/notifications') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🔔</span>
            {!isCollapsed && <span className="nav-label">Notifications</span>}
          </Link>
          <Link to="/chat" className={`nav-item ${isActive('/chat') ? 'active' : ''}`} aria-current={isActive('/chat') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">💬</span>
            {!isCollapsed && <span className="nav-label">Messages</span>}
          </Link>
          <Link to="/alerts" className={`nav-item ${isActive('/alerts') ? 'active' : ''}`} aria-current={isActive('/alerts') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">🚨</span>
            {!isCollapsed && <span className="nav-label">Alerts</span>}
          </Link>
          <Link to="/events" className={`nav-item ${isActive('/events') ? 'active' : ''}`} aria-current={isActive('/events') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">📅</span>
            {!isCollapsed && <span className="nav-label">Events</span>}
          </Link>
        </div>

        {/* ── Your Space ── */}
        <div className="nav-group">
          {!isCollapsed && <h3 className="nav-section-title">Your Space</h3>}
          <Link to={`/profile/${user._id || user.id}`} className={`nav-item ${isActive('/profile', true) ? 'active' : ''}`} aria-current={isActive('/profile', true) ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">👤</span>
            {!isCollapsed && <span className="nav-label">Profile</span>}
          </Link>
          <Link to="/creator/studio" className={`nav-item ${isActive('/creator/studio') ? 'active' : ''}`} aria-current={isActive('/creator/studio') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">📊</span>
            {!isCollapsed && <span className="nav-label">Creator Studio</span>}
          </Link>
          <Link to="/drafts" className={`nav-item ${isActive('/drafts') ? 'active' : ''}`} aria-current={isActive('/drafts') ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">📝</span>
            {!isCollapsed && <span className="nav-label">Drafts</span>}
            <OfflineBadge />
          </Link>
        </div>

        {/* ── Admin (conditional) ── */}
        {(user?.role === 'admin' || user?.role === 'founder' || user?.isFounder) && (
          <div className="nav-group">
            {!isCollapsed && <h3 className="nav-section-title">Admin</h3>}
            {user?.role === 'founder' || user?.isFounder ? (
              <Link to="/admin/founder" className={`nav-item ${isActive('/admin/founder') ? 'active' : ''}`} aria-current={isActive('/admin/founder') ? 'page' : undefined}>
                <span className="nav-icon" aria-hidden="true">👑</span>
                {!isCollapsed && <span className="nav-label">Founder Dashboard</span>}
              </Link>
            ) : (
              <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`} aria-current={isActive('/admin') ? 'page' : undefined}>
                <span className="nav-icon" aria-hidden="true">🛠️</span>
                {!isCollapsed && <span className="nav-label">Admin Panel</span>}
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── User Footer ── */}
      <div className="sidebar-footer">
        <div className="user-card">
          <Link to={`/profile/${user._id || user.id}`} className="user-avatar-link">
            <div className="user-avatar" aria-hidden="true">
              {user?.avatar_icon || '🦁'}
            </div>
          </Link>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || user?.username}</div>
              <div className="user-role">{user?.role || 'Member'}</div>
            </div>
          )}
          <button onClick={logout} className="btn-logout-sidebar" aria-label="Log out">
            <span aria-hidden="true">🚪</span>
          </button>
        </div>
      </div>
    </aside>
  )
})

export default Sidebar
