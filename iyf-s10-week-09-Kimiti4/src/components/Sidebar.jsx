import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import './Sidebar.css'

function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const isActive = (path) => location.pathname === path

  if (!isAuthenticated) return null

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
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
          <span className="logo-icon">🌍</span>
          {!isCollapsed && <span className="logo-text">JamiiLink</span>}
        </Link>
      </div>

      <nav className="sidebar-nav">
        {/* Main Navigation */}
        {!isCollapsed && <h3 className="nav-section-title">Main</h3>}
        <Link 
          to="/" 
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
          title={isCollapsed ? 'Feed' : ''}
        >
          <span className="nav-icon">🏠</span>
          {!isCollapsed && <span className="nav-label">Feed</span>}
        </Link>
        <Link 
          to="/reels" 
          className={`nav-item ${isActive('/reels') ? 'active' : ''}`}
          title={isCollapsed ? 'Reels' : ''}
        >
          <span className="nav-icon">🎬</span>
          {!isCollapsed && <span className="nav-label">Reels</span>}
        </Link>
        <Link 
          to="/events" 
          className={`nav-item ${isActive('/events') ? 'active' : ''}`}
          title={isCollapsed ? 'Events' : ''}
        >
          <span className="nav-icon">📅</span>
          {!isCollapsed && <span className="nav-label">Events</span>}
        </Link>
        <Link 
          to="/alerts" 
          className={`nav-item ${isActive('/alerts') ? 'active' : ''}`}
          title={isCollapsed ? 'Alerts' : ''}
        >
          <span className="nav-icon">🚨</span>
          {!isCollapsed && <span className="nav-label">Alerts</span>}
        </Link>

        {/* Feed Categories */}
        {!isCollapsed && <h3 className="nav-section-title">Feeds</h3>}
        <Link 
          to="/?feed=mtaani" 
          className={`nav-item ${location.search.includes('mtaani') ? 'active' : ''}`}
          title={isCollapsed ? 'Mtaani Alerts' : ''}
        >
          <span className="nav-icon">🔔</span>
          {!isCollapsed && <span className="nav-label">Mtaani Alerts</span>}
        </Link>
        <Link 
          to="/?feed=skills" 
          className={`nav-item ${location.search.includes('skills') ? 'active' : ''}`}
          title={isCollapsed ? 'Skill Swaps' : ''}
        >
          <span className="nav-icon">🤝</span>
          {!isCollapsed && <span className="nav-label">Skill Swaps</span>}
        </Link>
        <Link 
          to="/?feed=farm" 
          className={`nav-item ${location.search.includes('farm') ? 'active' : ''}`}
          title={isCollapsed ? 'Farm Market' : ''}
        >
          <span className="nav-icon">🌱</span>
          {!isCollapsed && <span className="nav-label">Farm Market</span>}
        </Link>
        <Link 
          to="/?feed=gigs" 
          className={`nav-item ${location.search.includes('gigs') ? 'active' : ''}`}
          title={isCollapsed ? 'Gig Economy' : ''}
        >
          <span className="nav-icon">💼</span>
          {!isCollapsed && <span className="nav-label">Gig Economy</span>}
        </Link>

        {/* Community Features */}
        {!isCollapsed && <h3 className="nav-section-title">Community</h3>}
        <Link 
          to="/tiannara" 
          className={`nav-item ${isActive('/tiannara') ? 'active' : ''}`}
          title={isCollapsed ? 'Tiannara AI' : ''}
        >
          <span className="nav-icon">🤖</span>
          {!isCollapsed && <span className="nav-label">Tiannara AI</span>}
        </Link>
        <Link 
          to="/marketplace" 
          className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}
          title={isCollapsed ? 'Marketplace' : ''}
        >
          <span className="nav-icon">🛒</span>
          {!isCollapsed && <span className="nav-label">Marketplace</span>}
        </Link>
        <Link 
          to="/groups" 
          className={`nav-item ${isActive('/groups') ? 'active' : ''}`}
          title={isCollapsed ? 'Groups' : ''}
        >
          <span className="nav-icon">👥</span>
          {!isCollapsed && <span className="nav-label">Groups</span>}
        </Link>

        {/* Personal */}
        {!isCollapsed && <h3 className="nav-section-title">Personal</h3>}
        <Link 
          to={`/profile/${user._id || user.id}`} 
          className={`nav-item ${isActive(`/profile/${user._id || user.id}`) ? 'active' : ''}`}
          title={isCollapsed ? 'Profile' : ''}
        >
          <span className="nav-icon">👤</span>
          {!isCollapsed && <span className="nav-label">Profile</span>}
        </Link>
        <Link 
          to="/settings" 
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <span className="nav-icon">️</span>
          {!isCollapsed && <span className="nav-label">Settings</span>}
        </Link>
        <Link 
          to="/messages" 
          className={`nav-item ${isActive('/messages') ? 'active' : ''}`}
          title={isCollapsed ? 'Messages' : ''}
        >
          <span className="nav-icon">💬</span>
          {!isCollapsed && <span className="nav-label">Messages</span>}
          {!isCollapsed && <span className="nav-badge">3</span>}
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
                <span className="nav-icon">👑</span>
                {!isCollapsed && <span className="nav-label">Founder Dashboard</span>}
              </Link>
            ) : (
              <Link 
                to="/admin" 
                className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                title={isCollapsed ? 'Admin Panel' : ''}
              >
                <span className="nav-icon"></span>
                {!isCollapsed && <span className="nav-label">Admin Panel</span>}
              </Link>
            )}
          </>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.avatar_icon || '🦁'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || user?.username}</div>
              <div className="user-role">{user?.role || 'Member'}</div>
            </div>
          )}
          <button onClick={logout} className="btn-logout-sidebar" title="Logout">
            🚪
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
