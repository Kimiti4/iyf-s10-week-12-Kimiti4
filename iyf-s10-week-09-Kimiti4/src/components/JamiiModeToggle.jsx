import { useState } from 'react';
import './JamiiModeToggle.css';

/**
 * 🌙 Jamii Mode Toggle
 * Switch between Focus, Community, and Discovery modes
 */
function JamiiModeToggle() {
  const [currentMode, setCurrentMode] = useState('community');

  const modes = {
    focus: { icon: '🎯', label: 'Focus', description: 'Minimal UI, content-only' },
    community: { icon: '👥', label: 'Community', description: 'Full sidebar, trending tags' },
    discovery: { icon: '✨', label: 'Discovery', description: 'Algorithmic exploration' }
  };

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    document.documentElement.setAttribute('data-jamii-mode', mode);
    
    // Optional: Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10); // Light tap
    }
    
    // Save preference to localStorage
    localStorage.setItem('jamiiMode', mode);
  };

  // Load saved preference on mount
  useState(() => {
    const savedMode = localStorage.getItem('jamiiMode');
    if (savedMode && modes[savedMode]) {
      setCurrentMode(savedMode);
      document.documentElement.setAttribute('data-jamii-mode', savedMode);
    }
  });

  return (
    <div className="jamii-mode-toggle">
      <div className="mode-toggle-header">
        <span className="toggle-icon">🌍</span>
        <span className="toggle-label">Jamii Mode</span>
      </div>
      
      <div className="mode-options">
        {Object.entries(modes).map(([mode, { icon, label, description }]) => (
          <button
            key={mode}
            className={`mode-option ${currentMode === mode ? 'active' : ''}`}
            onClick={() => handleModeChange(mode)}
            title={description}
          >
            <span className="mode-icon">{icon}</span>
            <span className="mode-text">{label}</span>
            {currentMode === mode && <span className="mode-indicator"></span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default JamiiModeToggle;
