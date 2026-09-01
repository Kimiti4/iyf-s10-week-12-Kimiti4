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

  const isActive = (path) => location.pathname === path

  if (!isAuthenticated) return null

  return (
    <aside className={`app-sidebar sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isOpen ? 'mobile-open' : ''}`}>
      {/* Collapse Toggle Button */}
      <button 
        className="sidebar-collapse-btn" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-icon" aria-hidden="true">🌍</span>
          {!isCollapsed && <span className="logo-text">JamiiLink</span>}
        </Link>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {/* Main Navigation */}
        {!isCollapsed && <h3 className="nav-section-title">Main</h3>}
        <Link 
          to="/" 
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
          title={isCollapsed ? 'Feed' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🏠</span>
          {!isCollapsed && <span className="nav-label">Feed</span>}
        </Link>
        <Link 
          to="/reels" 
          className={`nav-item ${isActive('/reels') ? 'active' : ''}`}
          title={isCollapsed ? 'Reels' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🎬</span>
          {!isCollapsed && <span className="nav-label">Reels</span>}
        </Link>
        <Link
          to="/discover"
          className={`nav-item ${isActive('/discover') ? 'active' : ''}`}
          title={isCollapsed ? 'Discover' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🔍</span>
          {!isCollapsed && <span className="nav-label">Discover</span>}
        </Link>
        <Link
          to="/events" 
          className={`nav-item ${isActive('/events') ? 'active' : ''}`}
          title={isCollapsed ? 'Events' : ''}
        >
          <span className="nav-icon" aria-hidden="true">📅</span>
          {!isCollapsed && <span className="nav-label">Events</span>}
        </Link>
        <Link 
          to="/jams" 
          className={`nav-item ${isActive('/jams') ? 'active' : ''}`}
          title={isCollapsed ? 'Jams' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🔥</span>
          {!isCollapsed && <span className="nav-label">Jams</span>}
        </Link>
        <Link
          to="/alerts"
          className={`nav-item ${isActive('/alerts') ? 'active' : ''}`}
          title={isCollapsed ? 'Alerts' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🚨</span>
          {!isCollapsed && <span className="nav-label">Alerts</span>}
        </Link>
        <Link
          to="/creator/studio"
          className={`nav-item ${isActive('/creator/studio') ? 'active' : ''}`}
          title={isCollapsed ? 'Creator Studio' : ''}
        >
          <span className="nav-icon" aria-hidden="true">📊</span>
          {!isCollapsed && <span className="nav-label">Creator Studio</span>}
        </Link>

        {/* Feed Categories */}
        {!isCollapsed && <h3 className="nav-section-title">Feeds</h3>}
        <Link 
          to="/mtaani" 
          className={`nav-item ${isActive('/mtaani') ? 'active' : ''}`}
          title={isCollapsed ? 'Mtaani' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🔔</span>
          {!isCollapsed && <span className="nav-label">Mtaani</span>}
        </Link>
        <Link 
          to="/skills" 
          className={`nav-item ${isActive('/skills') ? 'active' : ''}`}
          title={isCollapsed ? 'Skills' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🤝</span>
          {!isCollapsed && <span className="nav-label">Skills</span>}
        </Link>
        <Link 
          to="/farm" 
          className={`nav-item ${isActive('/farm') ? 'active' : ''}`}
          title={isCollapsed ? 'Farm' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🌱</span>
          {!isCollapsed && <span className="nav-label">Farm</span>}
        </Link>
        <Link 
          to="/gigs" 
          className={`nav-item ${isActive('/gigs') ? 'active' : ''}`}
          title={isCollapsed ? 'Gigs' : ''}
        >
          <span className="nav-icon" aria-hidden="true">💼</span>
          {!isCollapsed && <span className="nav-label">Gigs</span>}
        </Link>

        {/* Community Features */}
        {!isCollapsed && <h3 className="nav-section-title">Community</h3>}
        <Link 
          to="/tiannara" 
          className={`nav-item ${isActive('/tiannara') ? 'active' : ''}`}
          title={isCollapsed ? 'Tiannara AI' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🤖</span>
          {!isCollapsed && <span className="nav-label">Tiannara AI</span>}
        </Link>
        <Link 
          to="/marketplace" 
          className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}
          title={isCollapsed ? 'Marketplace' : ''}
        >
          <span className="nav-icon" aria-hidden="true">🛒</span>
          {!isCollapsed && <span className="nav-label">Marketplace</span>}
        </Link>

        {/* Personal */}
        {!isCollapsed && <h3 className="nav-section-title">Personal</h3>}
        <Link 
          to={`/profile/${user._id || user.id}`} 
          className={`nav-item ${isActive(`/profile/${user._id || user.id}`) ? 'active' : ''}`}
          title={isCollapsed ? 'Profile' : ''}
        >
          <span className="nav-icon" aria-hidden="true">👤</span>
          {!isCollapsed && <span className="nav-label">Profile</span>}
        </Link>
        <Link 
          to="/settings" 
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <span className="nav-icon" aria-hidden="true">⚙️</span>
          {!isCollapsed && <span className="nav-label">Settings</span>}
        </Link>
        <Link 
          to="/chat" 
          className={`nav-item ${isActive('/chat') ? 'active' : ''}`}
          title={isCollapsed ? 'Messages' : ''}
        >
          <span className="nav-icon" aria-hidden="true">💬</span>
          {!isCollapsed && <span className="nav-label">Messages</span>}
        </Link>
        <Link 
          to="/drafts" 
          className={`nav-item ${isActive('/drafts') ? 'active' : ''}`}
          title={isCollapsed ? 'Drafts' : ''}
        >
          <span className="nav-icon" aria-hidden="true">📝</span>
          {!isCollapsed && <span className="nav-label">Drafts</span>}
          <OfflineBadge />
        </Link>

        {/* Admin/Founder */}
        {(user?.role === 'admin' || user?.role === 'founder' || user?.isFounder) && (
          <>
            {!isCollapsed && <h3 className="nav-section-title">Admin</h3>}
            {user?.role === 'founder' || user?.isFounder ? (
              <Link 
                to="/admin/founder" 
                className={`nav-item ${isActive('/admin/founder') ? 'active' : ''}`}
                title={isCollapsed ? 'Founder Dashboard' : ''}
              >
                <span className="nav-icon" aria-hidden="true">👑</span>
                {!isCollapsed && <span className="nav-label">Founder Dashboard</span>}
              </Link>
            ) : (
              <Link 
                to="/admin" 
                className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                title={isCollapsed ? 'Admin Panel' : ''}
              >
                <span className="nav-icon" aria-hidden="true">🛠️</span>
                {!isCollapsed && <span className="nav-label">Admin Panel</span>}
              </Link>
            )}
          </>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar" aria-hidden="true">
            {user?.avatar_icon || '🦁'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || user?.username}</div>
              <div className="user-role">{user?.role || 'Member'}</div>
            </div>
          )}
          <button onClick={logout} className="btn-logout-sidebar" title="Logout" aria-label="Logout">
            <span aria-hidden="true">🚪</span>
          </button>
        </div>
      </div>
    </aside>
  )
})

export default Sidebar
