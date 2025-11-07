import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FloatingElements from './FloatingElements.jsx';
import PlanetaryAnimations from './PlanetaryAnimations.jsx';

/**
 * HeroSection Component
 * Cosmic hero section with starfield background and parallax effects
 * Features: Animated entrance, divine CTA styling, responsive layout
 */
const HeroSection = ({ 
  children, 
  title = 'Jyotish Shastra', 
  subtitle = 'Ancient Wisdom, Modern Precision' 
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sectionRef = useRef(null);
  
  // Scroll-based parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  // Transform scroll progress to parallax values
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  // Initialize starfield animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const stars = [];
    const starCount = 150;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }

    // Animate starfield
    let twinkleOffset = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      twinkleOffset += 0.01;

      stars.forEach((star, index) => {
        const twinkle = Math.sin(twinkleOffset + index * star.twinkleSpeed) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      className="hero-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ y, opacity }}
      data-testid="cosmic-hero"
    >
      {/* Cosmic Background */}
      <div className="hero-background">
        <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />
        <div className="cosmic-gradient" aria-hidden="true" />
        {/* Floating Vedic Elements */}
        <FloatingElements count={8} />
        {/* White Saturn & Planetary Animations */}
        <PlanetaryAnimations count={8} />
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        {/* Title Section */}
        {(title || subtitle) && (
          <motion.div className="hero-header" variants={itemVariants}>
            {title && (
              <h1 className="hero-title typography-roboto typography-h1">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="hero-subtitle typography-roboto typography-body-large">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Main Content (Form or other) */}
        <motion.div className="hero-main" variants={itemVariants}>
          {children}
        </motion.div>

        {/* Decorative Om Symbol */}
        <motion.div
          className="om-watermark"
          variants={itemVariants}
          aria-hidden="true"
        >
          ॐ
        </motion.div>
      </div>

      {/* Feature Cards (Optional) */}
      <motion.div className="hero-features" variants={itemVariants}>
        <div className="feature-card feature-card-shadow">
          <span className="feature-icon" aria-hidden="true">🌟</span>
          <h3 className="feature-title typography-roboto typography-h5">Authentic Vedic Calculations</h3>
          <p className="feature-description typography-roboto typography-body-small">
            Swiss Ephemeris powered precision
          </p>
        </div>
        <div className="feature-card feature-card-shadow">
          <span className="feature-icon" aria-hidden="true">📊</span>
          <h3 className="feature-title typography-roboto typography-h5">Comprehensive Analysis</h3>
          <p className="feature-description typography-roboto typography-body-small">
            In-depth astrological insights
          </p>
        </div>
        <div className="feature-card feature-card-shadow">
          <span className="feature-icon" aria-hidden="true">🕐</span>
          <h3 className="feature-title typography-roboto typography-h5">Birth Time Rectification</h3>
          <p className="feature-description typography-roboto typography-body-small">
            BPHS-aligned methodology
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
