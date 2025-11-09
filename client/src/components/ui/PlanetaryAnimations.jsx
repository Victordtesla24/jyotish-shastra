import React from 'react';
import SaturnCanvasAnimation from './SaturnCanvasAnimation.jsx';

/**
 * PlanetaryAnimations Component
 * EXACT replica of hellochriscole.webflow.io Saturn animation
 * Uses canvas-based rendering with parallax effects
 * Replaces SVG version with canvas for better performance and effects
 */
const PlanetaryAnimations = ({ count = 1 }) => {
  // Use default config from SaturnCanvasAnimation (EXACT replica settings)
  // Config can be overridden if needed for customization
  return (
    <SaturnCanvasAnimation />
  );
};

export default PlanetaryAnimations;

