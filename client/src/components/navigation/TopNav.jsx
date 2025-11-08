import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StarLetterAnimation from './StarLetterAnimation.jsx';
import './header.css';

/**
 * Top Navigation Component
 * EXACTLY matching Chris Cole's design:
 * - Logo "chris cole" centered at top (H6, Roboto Condensed, 14px, rgba(255,255,255,0.6))
 * - Navigation links Work/About/Contact/Sketches on RIGHT side as large H1 headings
 *   (63.968px, fontWeight: 100, rgba(255,255,255,0.6))
 * - Star-to-letter animation on hover (W-left, A-right, C-left, S-right)
 */
const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Navigation items with letter animation configuration
  // Pattern: WORK (W-left), ABOUT (A-right), CONTACT (C-left), SKETCHES (S-right)
  const navItems = [
    { path: '/chart', label: 'Work', key: 'work', letter: 'W', position: 'left' },
    { path: '/analysis', label: 'About', key: 'about', letter: 'A', position: 'right' },
    { path: '/comprehensive-analysis', label: 'Contact', key: 'contact', letter: 'C', position: 'left' },
    { path: '/birth-time-rectification', label: 'Sketches', key: 'sketches', letter: 'S', position: 'right' }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <header className="chris-cole-top-nav" role="banner">
      <div className="chris-cole-top-nav-frame">
        <div className="chris-cole-logo-container">
          <button
            className="chris-cole-logo"
            onClick={() => navigate('/')}
            aria-label="Navigate to Home"
          >
            <h6 className="chris-cole-logo-text">CHRIS COLE</h6>
          </button>
        </div>

        <div className="chris-cole-nav-region" aria-hidden={false}>
          <nav
            className="chris-cole-nav-right"
            role="navigation"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <div 
                  key={item.key} 
                  className="chris-cole-nav-item"
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <StarLetterAnimation
                    letter={item.letter}
                    position={item.position}
                    isHovered={hoveredItem === item.key}
                    path={item.path}
                    label={item.label}
                    isActive={active}
                    onClick={() => navigate(item.path)}
                  />
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
