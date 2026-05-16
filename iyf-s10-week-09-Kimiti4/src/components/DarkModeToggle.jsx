/**
 * 🌙 Dark Mode Toggle Component
 * Switches between light and dark themes with constellation background animation
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import './DarkModeToggle.css';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode to document
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDark);
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.button
      className="dark-mode-toggle"
      onClick={toggleDarkMode}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <motion.div
        className="toggle-icon"
        initial={false}
        animate={{
          rotate: isDark ? 360 : 0,
          scale: isDark ? 1.2 : 1
        }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
      >
        {isDark ? <FaSun className="icon-sun" /> : <FaMoon className="icon-moon" />}
      </motion.div>
      
      {/* Animated background particles for dark mode */}
      {isDark && (
        <div className="constellation-bg">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}
