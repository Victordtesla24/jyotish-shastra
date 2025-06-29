import React from 'react';

// Om Symbol (ॐ)
export const OmIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M25 45c-5 0-10 3-10 8s5 8 10 8c3 0 5-1 7-3l2 2c1 2 1 4-1 6-3 3-8 5-13 5-8 0-15-6-15-15s7-15 15-15c5 0 10 2 13 5 2 2 2 4 1 6l-2 2c-2-2-4-3-7-3zm25-20c8 0 15 7 15 15v20c0 8-7 15-15 15s-15-7-15-15V40c0-8 7-15 15-15zm0 8c-4 0-7 3-7 7v20c0 4 3 7 7 7s7-3 7-7V40c0-4-3-7-7-7zm25 12c5 0 10 3 10 8s-5 8-10 8c-3 0-5-1-7-3l-2 2c-1 2-1 4 1 6 3 3 8 5 13 5 8 0 15-6 15-15s-7-15-15-15c-5 0-10 2-13 5-2 2-2 4-1 6l2 2c2-2 4-3 7-3z"/>
    <circle cx="50" cy="75" r="3"/>
  </svg>
);

// Lotus Flower (🪷)
export const LotusIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      {/* Outer petals */}
      <path d="M0,-30 Q-15,-20 -25,-10 Q-15,0 0,-5 Q15,0 25,-10 Q15,-20 0,-30z" opacity="0.7"/>
      <path d="M25,-10 Q20,5 10,15 Q0,5 5,0 Q0,-15 10,-25 Q20,-15 25,-10z" opacity="0.7"/>
      <path d="M10,15 Q-5,20 -15,25 Q-5,15 0,5 Q15,15 25,25 Q15,20 10,15z" opacity="0.7"/>
      <path d="M-15,25 Q-20,5 -10,-15 Q0,-5 -5,0 Q0,15 -10,25 Q-20,15 -15,25z" opacity="0.7"/>
      <path d="M-25,-10 Q-20,-25 -10,-25 Q0,-15 -5,0 Q-15,0 -25,-10z" opacity="0.7"/>

      {/* Inner petals */}
      <path d="M0,-20 Q-10,-15 -15,-5 Q-10,0 0,-2 Q10,0 15,-5 Q10,-15 0,-20z"/>
      <path d="M15,-5 Q10,10 5,15 Q0,5 2,0 Q0,-10 5,-15 Q10,-10 15,-5z"/>
      <path d="M5,15 Q-10,15 -15,5 Q-5,0 0,2 Q5,0 15,5 Q10,15 5,15z"/>
      <path d="M-15,5 Q-10,-10 -5,-15 Q0,-5 -2,0 Q0,10 -5,15 Q-10,10 -15,5z"/>

      {/* Center */}
      <circle r="4" fill="currentColor"/>
    </g>
  </svg>
);

// Mandala Pattern
export const MandalaIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      <circle r="35" strokeWidth="0.5"/>
      <circle r="25" strokeWidth="0.5"/>
      <circle r="15" strokeWidth="0.5"/>
      <circle r="5" fill="currentColor" stroke="none"/>

      {/* Radiating lines */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
        <line
          key={angle}
          x1="0"
          y1="-35"
          x2="0"
          y2="-40"
          transform={`rotate(${angle})`}
          strokeWidth="1"
        />
      ))}

      {/* Inner pattern */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path d="M0,-20 Q-5,-15 0,-10 Q5,-15 0,-20z" fill="currentColor"/>
        </g>
      ))}
    </g>
  </svg>
);

// Sun (सूर्य)
export const SunIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      <circle r="18" fill="currentColor"/>
      {/* Sun rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path d="M0,-25 L-2,-35 L2,-35 Z" fill="currentColor"/>
          <path d="M0,-40 L-1,-45 L1,-45 Z" fill="currentColor"/>
        </g>
      ))}
      {/* Inner sun face */}
      <circle r="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      <circle cx="-4" cy="-4" r="1.5" fill="rgba(255,255,255,0.8)"/>
      <circle cx="4" cy="-4" r="1.5" fill="rgba(255,255,255,0.8)"/>
      <path d="M-3,4 Q0,8 3,4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none"/>
    </g>
  </svg>
);

// Moon (चन्द्र)
export const MoonIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      <path d="M-15,-25 Q-25,-15 -25,0 Q-25,15 -15,25 Q-5,15 5,0 Q15,-15 5,-25 Q-5,-35 -15,-25z"/>
      <circle cx="-8" cy="-8" r="2" fill="rgba(255,255,255,0.3)"/>
      <circle cx="-5" cy="5" r="1.5" fill="rgba(255,255,255,0.2)"/>
      <circle cx="2" cy="-5" r="1" fill="rgba(255,255,255,0.2)"/>
    </g>
  </svg>
);

// Star / Nakshatra
export const StarIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      <path d="M0,-25 L5,-8 L22,-8 L10,2 L15,18 L0,8 L-15,18 L-10,2 L-22,-8 L-5,-8 Z"/>
      <circle r="3" fill="rgba(255,255,255,0.8)"/>
    </g>
  </svg>
);

// Trishul (त्रिशूल)
export const TrishulIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      {/* Center prong */}
      <rect x="-1" y="-35" width="2" height="60"/>
      {/* Left prong */}
      <path d="M-1,-35 Q-10,-30 -15,-20 Q-10,-15 -5,-20 L-1,-25"/>
      {/* Right prong */}
      <path d="M1,-35 Q10,-30 15,-20 Q10,-15 5,-20 L1,-25"/>
      {/* Handle decoration */}
      <circle cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
    </g>
  </svg>
);

// Yantra Pattern
export const YantraIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      {/* Outer square */}
      <rect x="-30" y="-30" width="60" height="60"/>
      {/* Inner triangles forming Sri Yantra pattern */}
      <path d="M0,-25 L-20,15 L20,15 Z"/>
      <path d="M0,20 L-15,-15 L15,-15 Z"/>
      <path d="M-20,-10 L20,-10 L0,25 Z"/>
      <path d="M-10,-5 L10,-5 L0,15 Z"/>
      <circle r="5" fill="currentColor" stroke="none"/>
    </g>
  </svg>
);

// Chakra (Wheel)
export const ChakraIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(50,50)">
      <circle r="30"/>
      <circle r="20"/>
      <circle r="10"/>
      <circle r="3" fill="currentColor" stroke="none"/>
      {/* Spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <line
          key={angle}
          x1="0"
          y1="-30"
          x2="0"
          y2="-10"
          transform={`rotate(${angle})`}
        />
      ))}
    </g>
  </svg>
);

// Default export with all icons
const VedicIcons = {
  OmIcon,
  LotusIcon,
  MandalaIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  TrishulIcon,
  YantraIcon,
  ChakraIcon
};

export default VedicIcons;
