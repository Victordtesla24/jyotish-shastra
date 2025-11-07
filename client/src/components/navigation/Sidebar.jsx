import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Sidebar Navigation Component
 * Responsive sidebar with static mode (≥1024px) and overlay mode (<1024px)
 * Features: Toggle functionality, route highlighting, smooth animations
 */
const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState('static'); // 'static' or 'overlay'

  // Navigation items configuration
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠', ariaLabel: 'Navigate to Home' },
    { path: '/chart', label: 'Chart', icon: '✨', ariaLabel: 'Navigate to Chart Generation' },
    { path: '/analysis', label: 'Analysis', icon: '📊', ariaLabel: 'Navigate to Analysis' },
    { path: '/btr', label: 'Birth Time Rectification', icon: '🕐', ariaLabel: 'Navigate to Birth Time Rectification' }
  ];

  // Breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setMode('static');
        setIsOpen(true);
      } else {
        setMode('overlay');
        setIsOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change in overlay mode
  useEffect(() => {
    if (mode === 'overlay') {
      setIsOpen(false);
    }
  }, [location.pathname, mode]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Sidebar animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: mode === 'static' ? -300 : -300,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Overlay backdrop animation
  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <>
      {/* Hamburger Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="sidebar-toggle"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
        aria-controls="main-sidebar"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Overlay Backdrop (mobile/tablet only) */}
      <AnimatePresence>
        {mode === 'overlay' && isOpen && (
          <motion.div
            className="sidebar-backdrop"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        id="main-sidebar"
        className={`sidebar sidebar-${mode} shadow-prominent`}
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        aria-label="Main Navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header shadow-soft">
          <h2 className="sidebar-title typography-roboto typography-h2">Jyotish Shastra</h2>
          <span className="sidebar-subtitle typography-roboto typography-body-small">Vedic Astrology</span>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav" role="navigation">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="sidebar-nav-item">
                  <Link
                    to={item.path}
                    className={`sidebar-nav-link ${isActive ? 'active' : ''} shadow-hover`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.ariaLabel}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {isActive && (
                      <motion.span
                        className="active-indicator"
                        layoutId="activeIndicator"
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer shadow-subtle">
          <p className="sidebar-footer-text typography-roboto typography-body-small">
            Version 1.0.0
          </p>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
