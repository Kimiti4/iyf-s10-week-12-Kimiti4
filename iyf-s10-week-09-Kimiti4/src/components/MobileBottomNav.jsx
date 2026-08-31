/**
 * 🔹 Mobile Bottom Navigation
 * JamiiLink 2.0 mobile bottom bar — primary destinations only.
 */

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaCompass, FaPlus, FaBell, FaUser } from 'react-icons/fa';
import { triggerHaptic } from '../utils/hapticFeedback';

export default function MobileBottomNav() {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: <FaHome />, label: 'Home' },
        { path: '/marketplace', icon: <FaCompass />, label: 'Explore' },
        { path: '/create/jam', icon: <FaPlus />, label: 'Create', highlight: true },
        { path: '/alerts', icon: <FaBell />, label: 'Alerts' },
        { path: '/profile', icon: <FaUser />, label: 'Profile' }
    ];

    return (
        <div className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        aria-label={item.label}
                        className={`mobile-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'mobile-create' : ''}`}
                        onClick={() => triggerHaptic('click')}
                    >
                        {item.highlight ? (
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="mobile-create-icon"
                            >
                                {item.icon}
                            </motion.div>
                        ) : (
                            <motion.span
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.15 : 1
                                }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="mobile-nav-item-icon"
                            >
                                {item.icon}
                            </motion.span>
                        )}
                        <span className="mobile-nav-item-label">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
