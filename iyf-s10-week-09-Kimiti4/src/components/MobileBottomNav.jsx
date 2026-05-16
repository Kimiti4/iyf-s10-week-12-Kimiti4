/**
 * 🔹 Mobile Bottom Navigation
 * Modern, app-like navigation for mobile devices
 */

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaCompass, FaPlusCircle, FaBell, FaUser } from 'react-icons/fa';
import { triggerHaptic } from '../utils/hapticFeedback';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
    const location = useLocation();
    
    const navItems = [
        { path: '/', icon: <FaHome />, label: 'Home' },
        { path: '/marketplace', icon: <FaCompass />, label: 'Explore' },
        { path: '/posts/create', icon: <FaPlusCircle />, label: 'Create', highlight: true },
        { path: '/alerts', icon: <FaBell />, label: 'Alerts' },
        { path: '/profile', icon: <FaUser />, label: 'Profile' }
    ];
    
    return (
        <nav className="mobile-bottom-nav">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
                        onClick={() => triggerHaptic('click')}
                    >
                        {item.highlight ? (
                            <motion.div
                                className="nav-icon-wrapper"
                                whileTap={{ scale: 0.9 }}
                            >
                                <div className="nav-icon-circle">
                                    {item.icon}
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <motion.span
                                    className="nav-icon"
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.2 : 1
                                    }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {item.icon}
                                </motion.span>
                                {isActive && (
                                    <motion.div
                                        className="active-indicator"
                                        layoutId="activeTab"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 500,
                                            damping: 30
                                        }}
                                    />
                                )}
                            </>
                        )}
                        <span className="nav-label">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
