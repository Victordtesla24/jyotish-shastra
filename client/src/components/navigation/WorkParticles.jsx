import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import errorLogger from '../../utils/errorLogger.js';
import './particles.css';

/**
 * WorkParticles Component
 * PixiJS v8 particle field morphing to "WORK" text outline on hover
 * Matches Chris Cole's WORK hover effect with star particles
 */
const WorkParticles = ({ path, label, isActive, onClick }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const particlesRef = useRef([]);
  const targetPointsRef = useRef([]);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion || isInitializedRef.current) return;

    const container = containerRef.current;
    const width = 120;
    const height = 40;
    let app = null;
    let particleContainer = null;
    let isDestroyed = false;

    // Initialize PixiJS application (v8 API)
    const initPixi = async () => {
      try {
        if (isDestroyed) return;

        app = new PIXI.Application();
        
        await app.init({
          width,
          height,
          backgroundColor: 0x000000,
          alpha: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          antialias: false
        });

        if (isDestroyed || !containerRef.current) {
          app.destroy(true);
          return;
        }

        appRef.current = app;
        container.appendChild(app.canvas);
        canvasRef.current = app.canvas;

        // Use Container instead of ParticleContainer for v8 compatibility
        particleContainer = new PIXI.Container();
        app.stage.addChild(particleContainer);

        // Generate particles using v8 API
        const particles = [];
        const particleCount = 1500;

        for (let i = 0; i < particleCount; i++) {
          const particle = new PIXI.Graphics();
          
          // PixiJS v8 API: Use fill() and circle() instead of beginFill/drawCircle/endFill
          particle.fill({ color: 0xFFFFFF, alpha: 0.8 });
          particle.circle(0, 0, 1);
          
          // Random initial position
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
          
          // Random velocity
          particle.vx = (Math.random() - 0.5) * 0.5;
          particle.vy = (Math.random() - 0.5) * 0.5;
          
          particle.alpha = Math.random() * 0.5 + 0.3;
          particleContainer.addChild(particle);
          particles.push(particle);
        }

        particlesRef.current = particles;

        // Precompute target points from "WORK" text
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WORK', width / 2, height / 2);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const targetPoints = [];
        
        for (let y = 0; y < height; y += 2) {
          for (let x = 0; x < width; x += 2) {
            const index = (y * width + x) * 4;
            if (imageData.data[index + 3] > 128) {
              targetPoints.push({ x, y });
            }
          }
        }
        
        targetPointsRef.current = targetPoints;

        // Animation loop
        let targetMode = false;
        
        const animate = () => {
          if (isDestroyed || !appRef.current || !particlesRef.current.length) {
            return;
          }

          const particles = particlesRef.current;
          const targetPoints = targetPointsRef.current;

          if (!isHovered && targetMode) {
            // Disperse particles
            particles.forEach((particle) => {
              const targetX = Math.random() * width;
              const targetY = Math.random() * height;
              
              particle.x += (targetX - particle.x) * 0.05;
              particle.y += (targetY - particle.y) * 0.05;
              
              if (Math.abs(particle.x - targetX) < 1 && Math.abs(particle.y - targetY) < 1) {
                targetMode = false;
              }
            });
          } else if (isHovered) {
            // Morph to text
            targetMode = true;
            particles.forEach((particle, i) => {
              if (!targetPoints.length) return;
              const targetIndex = i % targetPoints.length;
              const target = targetPoints[targetIndex];
              
              particle.x += (target.x - particle.x) * 0.1;
              particle.y += (target.y - particle.y) * 0.1;
              
              particle.alpha = Math.min(1, particle.alpha + 0.02);
            });
          } else {
            // Free movement
            particles.forEach((particle) => {
              particle.x += particle.vx;
              particle.y += particle.vy;
              
              if (particle.x < 0 || particle.x > width) particle.vx *= -1;
              if (particle.y < 0 || particle.y > height) particle.vy *= -1;
              
              particle.x = Math.max(0, Math.min(width, particle.x));
              particle.y = Math.max(0, Math.min(height, particle.y));
            });
          }
          
          if (!isDestroyed && appRef.current) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animate();
        isInitializedRef.current = true;
      } catch (error) {
        errorLogger.logError({
          type: 'pixijs_initialization_error',
          error: error,
          message: error?.message || 'PixiJS initialization failed',
          stack: error?.stack,
          timestamp: new Date().toISOString()
        });
      }
    };

    initPixi();

    return () => {
      isDestroyed = true;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Capture refs for cleanup
      const app = appRef.current;
      const container = containerRef.current;
      
      if (app) {
        try {
          // Proper cleanup for PixiJS v8
          if (app.canvas && container && container.contains(app.canvas)) {
            container.removeChild(app.canvas);
          }
          app.destroy({
            children: true,
            texture: true,
            baseTexture: true
          });
        } catch (error) {
          errorLogger.logWarning({
            type: 'pixijs_cleanup_error',
            message: error?.message || 'PixiJS cleanup failed',
            context: { error },
            timestamp: new Date().toISOString()
          });
        }
        appRef.current = null;
      }
      
      particlesRef.current = [];
      targetPointsRef.current = [];
      isInitializedRef.current = false;
    };
  }, [prefersReducedMotion, isHovered]);

  // Hover state is handled in the main effect's animation loop
  // No separate effect needed - animation loop checks isHovered state

  const handleMouseEnter = () => {
    if (!prefersReducedMotion) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className={`work-particles-link ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Navigate to ${label}`}
    >
      {prefersReducedMotion ? (
        <h1 className="work-particles-text chris-cole-nav-heading">{label}</h1>
      ) : (
        <>
          <h1 className="work-particles-text chris-cole-nav-heading">{label}</h1>
          <div ref={containerRef} className="work-particles-canvas" aria-hidden="true" />
        </>
      )}
    </button>
  );
};

export default WorkParticles;
