import React from 'react';

/**
 * Footer Component
 * Chris Cole inspired minimal footer - adapted for Jyotish Shastra
 * - Minimal bottom-center positioning
 * - Font: Roboto Condensed, 10px, weight 300
 * - Color: rgba(255, 255, 255, 0.3) - Very subtle on black background
 * - Generous spacing from bottom
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="footer-minimal"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        fontFamily: 'Roboto Condensed, sans-serif',
        fontSize: '10px',
        fontWeight: 300,
        color: 'rgba(255, 255, 255, 0.3)',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textAlign: 'center',
        padding: '8px 16px',
        pointerEvents: 'none'
      }}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div 
        className="footer-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'center'
        }}
      >
        <span>© {currentYear} Jyotish Shastra</span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span>Vedic Astrology</span>
      </div>
    </footer>
  );
};

export default Footer;
