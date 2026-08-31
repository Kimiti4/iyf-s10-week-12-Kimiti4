import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from './SearchBar'
import OrganizationSelector from './OrganizationSelector'
import DarkModeToggle from './DarkModeToggle'
import { FaHome, FaStore, FaCalendarAlt, FaRobot, FaBell, FaComments, FaChartLine, FaPalette, FaTrophy, FaVoteYea, FaBullseye, FaUserShield, FaCrown, FaSignOutAlt, FaFire } from 'react-icons/fa'
import CreateMenu from './jam/CreateMenu'
import NotificationBell from './notifications/NotificationBell'
import { useNotifications } from '../hooks/useNotifications'
import './NavBar.css'

function NavBar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const isActive = (path) => location.pathname === path

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <nav className="enhanced-navbar topbar">
      <div className="navbar-container">
        {/* Left: Logo & Brand */}
        <div className="navbar-left">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <Link to="/" className="navbar-logo">
            <span className="logo-icon" aria-hidden="true">🌍</span>
            <span className="logo-text">
              Jamii<span className="logo-highlight">Link</span>
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="navbar-center">
          <SearchBar />
        </div>

        {/* Right: Navigation Links */}
        <div 
          className={`navbar-right ${mobileMenuOpen ? 'active' : ''}`}
          style={{
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            visibility: mobileMenuOpen ? 'visible' : 'hidden',
            pointerEvents: mobileMenuOpen ? 'auto' : 'none',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Primary Navigation */}
          <div className="nav-group primary-nav">
            <Link 
              to="/" 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon"><FaHome /></span>
              <span className="nav-text">Feed</span>
            </Link>
            <Link 
              to="/marketplace" 
              className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon"><FaStore /></span>
              <span className="nav-text">Market</span>
            </Link>
            <Link 
              to="/events" 
              className={`nav-item ${isActive('/events') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon"><FaCalendarAlt /></span>
              <span className="nav-text">Events</span>
            </Link>
            <Link 
              to="/jams" 
              className={`nav-item ${isActive('/jams') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon"><FaFire /></span>
              <span className="nav-text">Jams</span>
            </Link>
          </div>

          {/* Feature Navigation */}
          <div className="nav-group feature-nav">
            <Link 
              to="/tiannara" 
              className={`nav-item nav-feature ${isActive('/tiannara') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon"><FaRobot /></span>
              <span className="nav-text">Tiannara</span>
            </Link>
            <Link
              to="/notifications"
              className={`nav-item nav-notifications ${isActive('/notifications') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <NotificationBell unreadCount={unreadCount} onClick={(e) => e.preventDefault()} />
              <span className="nav-text">Notifications</span>
            </Link>
            {/* Chat Icon with Notification Badge */}
            <Link 
              to="/chat" 
              className="nav-item nav-chat"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon chat-icon"><FaComments /></span>
              <span className="nav-text">Chat</span>
            </Link>
            <Link 
              to="/activity" 
              className={`nav-item nav-activity ${isActive('/activity') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon activity-icon"><FaChartLine /></span>
              <span className="nav-text">Activity</span>
            </Link>
            <Link
              to="/creator/studio"
              className={`nav-item nav-creator ${isActive('/creator/studio') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon creator-icon"><FaPalette /></span>
              <span className="nav-text">Creator</span>
            </Link>
            <Link 
              to="/reputation" 
              className={`nav-item nav-reputation ${isActive('/reputation') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon reputation-icon"><FaTrophy /></span>
              <span className="nav-text">Reputation</span>
            </Link>
            <Link 
              to="/governance" 
              className={`nav-item nav-governance ${isActive('/governance') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon governance-icon"><FaVoteYea /></span>
              <span className="nav-text">Governance</span>
            </Link>
            <Link 
              to="/quests" 
              className={`nav-item nav-quests ${isActive('/quests') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon quests-icon"><FaBullseye /></span>
              <span className="nav-text">Quests</span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="nav-group user-nav">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            
            {isAuthenticated ? (
              <>
                <OrganizationSelector />
                
                {user?.role === 'founder' || user?.isFounder ? (
                  <Link 
                    to="/admin/founder" 
                    className="nav-btn btn-founder"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="btn-icon"><FaCrown /></span>
                    <span className="btn-text">Founder</span>
                  </Link>
                ) : (user?.role === 'admin' || user?.isAdmin ? (
                  <Link 
                    to="/admin" 
                    className="nav-btn btn-admin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="btn-icon"><FaUserShield /></span>
                    <span className="btn-text">Admin</span>
                  </Link>
                ) : null)}
                
                <CreateMenu />

                <div className="user-profile-group">
                  <Link 
                    to={`/profile/${user._id}`} 
                    className="user-profile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="user-name">{user.name}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }} 
                    className="nav-btn btn-logout"
                  >
                    <span className="btn-icon"><FaSignOutAlt /></span>
                    <span className="btn-text">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className="nav-btn btn-login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="nav-btn btn-signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}

export default NavBar
