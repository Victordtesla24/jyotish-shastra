import React from 'react';
import SaturnCanvasAnimation from './SaturnCanvasAnimation.jsx';

/**
 * HeroSection Component
 * EXACTLY matching implementation plan specifications:
 * - Full viewport height with position: relative
 * - Starfield Canvas: Absolutely positioned; cover entire container; z-index below content
 * - Planet Illustration: Place near the left half; SVG with animated rings
 * - Title: Top center in small uppercase font
 * - Menu Items: Right of planet, vertically spaced
 */
const HeroSection = ({ children, title = 'JYOTISH SHASTRA' }) => {
  return (
    <section className="hero-section" style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Saturn Canvas Animation - Handles starfield, planet, and rings with parallax */}
      {/* Starfield, planet, and rings are all drawn on the same canvas for proper layering */}
      <SaturnCanvasAnimation />

      {/* Title - Top center in small uppercase font */}
      {title && (
        <h6 className="hero-title" style={{
          position: 'absolute',
          top: 'clamp(12px, 2vw, 20px)',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 'clamp(11px, 1.5vw, 14px)',
          fontWeight: 400,
          letterSpacing: 'clamp(1px, 0.2vw, 2px)',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          zIndex: 10,
          margin: 0,
          padding: '0 20px',
          textAlign: 'center',
          maxWidth: '100%'
        }}>
          {title}
        </h6>
      )}

      {/* Menu Items Container - Responsive positioning */}
      <div className="menu-container" style={{
        position: 'absolute',
        right: 'clamp(5%, 10vw, 15%)',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        maxWidth: '90%',
        paddingLeft: 'clamp(10px, 2vw, 20px)'
      }}>
        {children}
      </div>
    </section>
  );
};


export default HeroSection;

