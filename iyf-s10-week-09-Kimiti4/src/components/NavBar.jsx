import { useState, useEffect, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from './SearchBar'
import DarkModeToggle from './DarkModeToggle'
import CreateMenu from './jam/CreateMenu'
import NotificationBell from './notifications/NotificationBell'
import { useNotifications } from '../hooks/useNotifications'
import './NavBar.css'

const NavBar = memo(function NavBar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { unreadCount } = useNotifications()

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}

      <nav className="topbar" role="navigation" aria-label="Primary">
        <div className="topbar__inner">
          {/* Left */}
          <div className="topbar__left">
            <button
              className="topbar__menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} aria-hidden="true">
                <span /><span /><span />
              </span>
            </button>
            <Link to="/" className="topbar__logo" aria-label="JamiiLink home">
              <span className="topbar__logo-icon" aria-hidden="true">🌍</span>
              <span className="topbar__logo-text">Jamii<span className="topbar__logo-accent">Link</span></span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="topbar__center">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="topbar__right">
            {isAuthenticated ? (
              <>
                <NotificationBell unreadCount={unreadCount} />
                <CreateMenu />
                <DarkModeToggle />
                <Link to={`/profile/${user._id || user.id}`} className="topbar__avatar" aria-label="Your profile">
                  {user.avatar
                    ? <img src={user.avatar} alt="" />
                    : <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  }
                </Link>
              </>
            ) : (
              <div className="topbar__auth">
                <Link to="/login" className="topbar__btn topbar__btn--ghost">Log in</Link>
                <Link to="/register" className="topbar__btn topbar__btn--primary">Sign up</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" role="menu">
            <Link to="/" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/discover" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
            <Link to="/reels" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Reels</Link>
            <Link to="/jams" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Jams</Link>
            <Link to="/notifications" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Notifications</Link>
            <Link to="/chat" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
            <Link to="/alerts" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Alerts</Link>
            <Link to="/creator/studio" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Creator Studio</Link>
            <Link to={`/profile/${user._id || user.id}`} className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
            <Link to="/settings" className="mobile-menu__item" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
            <button className="mobile-menu__item mobile-menu__item--danger" role="menuitem" onClick={() => { logout(); setMobileMenuOpen(false); }}>Log out</button>
          </div>
        )}
      </nav>
    </>
  )
})

export default NavBar
