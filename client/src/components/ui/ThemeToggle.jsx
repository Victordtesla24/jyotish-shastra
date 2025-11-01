import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext.js';
import { SunIcon, MoonIcon, StarIcon } from './VedicIcons.js';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon size={iconSizes[size]} className="text-amber-500" />;
      case 'dark':
        return <MoonIcon size={iconSizes[size]} className="text-slate-300" />;
      case 'system':
        return <StarIcon size={iconSizes[size]} className="text-cosmic-purple" />;
      default:
        return <SunIcon size={iconSizes[size]} className="text-amber-500" />;
    }
  };

  const getTooltipText = () => {
    switch (theme) {
      case 'light':
        return 'Switch to Dark Mode';
      case 'dark':
        return 'Switch to System Theme';
      case 'system':
        return 'Switch to Light Mode';
      default:
        return 'Toggle Theme';
    }
  };

  return (
    <div className="relative group">
      <motion.button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          relative flex items-center justify-center
          rounded-full border-2 transition-all duration-300
          ${isDark
            ? 'bg-dark-surface border-dark-border hover:border-dark-accent text-dark-text-primary'
            : 'bg-white border-gray-200 hover:border-saffron text-earth-brown'
          }
          hover:shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-saffron/50
          ${className}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        aria-label={getTooltipText()}
      >
        {/* Background glow effect */}
        <motion.div
          className={`
            absolute inset-0 rounded-full blur-md opacity-0 transition-opacity duration-300
            ${theme === 'light' ? 'bg-amber-200' : theme === 'dark' ? 'bg-slate-400' : 'bg-purple-300'}
            group-hover:opacity-30
          `}
          initial={false}
          animate={{
            opacity: 0,
            scale: 0.8,
          }}
          whileHover={{
            opacity: 0.3,
            scale: 1.2,
          }}
        />

        {/* Icon with rotation animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            {getThemeIcon()}
          </motion.div>
        </AnimatePresence>

        {/* Ripple effect */}
        <motion.div
          className={`
            absolute inset-0 rounded-full pointer-events-none
            ${theme === 'light' ? 'bg-amber-200' : theme === 'dark' ? 'bg-slate-300' : 'bg-purple-300'}
          `}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1.5, opacity: 0.3 }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>

      {/* Tooltip */}
      <div className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        pointer-events-none z-50
        ${isDark
          ? 'bg-dark-surface-elevated text-dark-text-primary border border-dark-border'
          : 'bg-white text-earth-brown border border-gray-200 shadow-vedic-soft'
        }
      `}>
        {getTooltipText()}
        <div className={`
          absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent
          ${isDark ? 'border-t-dark-surface-elevated' : 'border-t-white'}
        `} />
      </div>
    </div>
  );
};

export default ThemeToggle;
