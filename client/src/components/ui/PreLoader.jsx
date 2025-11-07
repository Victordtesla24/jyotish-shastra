import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PreLoader Component
 * Vedic-themed pre-loading animation similar to Chris Cole's "loading" text
 * Features: Fade-in content after loading, maintains starfield canvas as background
 */
const PreLoader = ({ onComplete, delay = 1500 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Hide preloader after delay
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500); // Wait for fade-out animation
      }
    }, delay);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [delay, onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="preloader-vedic"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Cosmic Background */}
          <div className="preloader-background" aria-hidden="true" />
          
          {/* Loading Content */}
          <motion.div
            className="preloader-content"
            variants={itemVariants}
          >
            {/* Om Symbol */}
            <motion.div
              className="preloader-om"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              aria-hidden="true"
            >
              ॐ
            </motion.div>

            {/* Loading Text - Matching Chris Cole Style */}
            <motion.h2
              className="preloader-text typography-roboto"
              variants={itemVariants}
              style={{ 
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 300,
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              loading
            </motion.h2>

            {/* Progress Bar */}
            <motion.div
              className="preloader-progress-container"
              variants={itemVariants}
            >
              <div className="preloader-progress-bar">
                <motion.div
                  className="preloader-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                />
              </div>
              <span className="preloader-progress-text">
                {loadingProgress}%
              </span>
            </motion.div>

            {/* Sacred Message */}
            <motion.p
              className="preloader-message"
              variants={itemVariants}
            >
              Ancient Wisdom, Modern Precision
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreLoader;

