import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiUser } from 'react-icons/fi';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    success(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-sections">
        <div className="card settings-card">
          <div className="card-header">
            <FiUser size={20} />
            <h3>Profile</h3>
          </div>
          <div className="settings-profile">
            <div className="settings-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="settings-profile-info">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={user?.name || ''} readOnly className="input-readonly" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email || ''} readOnly className="input-readonly" />
              </div>
            </div>
          </div>
        </div>

        <div className="card settings-card">
          <div className="card-header">
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            <h3>Appearance</h3>
          </div>
          <div className="settings-theme">
            <p>Switch between light and dark mode.</p>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              {theme === 'light' ? (
                <><FiMoon size={16} /> Switch to Dark Mode</>
              ) : (
                <><FiSun size={16} /> Switch to Light Mode</>
              )}
            </button>
          </div>
        </div>

        <div className="card settings-card">
          <div className="card-header">
            <h3>Notifications</h3>
          </div>
          <p className="text-muted">Notification settings coming soon.</p>
        </div>
      </div>
    </div>
  );
}
