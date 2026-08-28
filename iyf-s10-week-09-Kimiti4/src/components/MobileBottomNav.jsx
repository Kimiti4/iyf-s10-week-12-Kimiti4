/**
 * 🔹 Mobile Bottom Navigation
 * Instagram-esque bottom nav
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
        { path: '/original/posts/create', icon: <FaPlusCircle />, label: 'Create', highlight: true },
        { path: '/alerts', icon: <FaBell />, label: 'Alerts' },
        { path: '/profile', icon: <FaUser />, label: 'Profile' }
    ];

    return (
        <div className="ig-nav" role="navigation" aria-label="Mobile navigation">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        aria-label={item.label}
                        className={`ig-nav__btn ${isActive ? 'ig-nav__btn--active' : ''}`}
                        onClick={() => triggerHaptic('click')}
                    >
                        {item.highlight ? (
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                            >
                                <div className="nav-icon-circle">
                                    {item.icon}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.span
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.2 : 1
                                }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {item.icon}
                            </motion.span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
