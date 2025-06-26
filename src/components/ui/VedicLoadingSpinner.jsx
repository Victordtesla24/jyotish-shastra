import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { OmIcon, MandalaIcon, LotusIcon } from '../../../client/src/components/ui/VedicIcons';

const VedicLoadingSpinner = ({
  variant = 'mandala',
  size = 'md',
  className,
  message = 'Calculating cosmic energies...',
  showMessage = true,
  color = 'saffron'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const colorClasses = {
    saffron: 'text-saffron',
    gold: 'text-gold',
    cosmic: 'text-cosmic-purple',
    stellar: 'text-stellar-blue',
    maroon: 'text-maroon'
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.5, duration: 0.6 }
    }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'om':
        return (
          <motion.div
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              className
            )}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <OmIcon size="100%" />
          </motion.div>
        );

      case 'lotus':
        return (
          <motion.div
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              className
            )}
            animate={{
              rotate: [0, 360],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <LotusIcon size="100%" />
          </motion.div>
        );

      case 'mandala':
      default:
        return (
          <motion.div
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              className
            )}
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <MandalaIcon size="100%" />
          </motion.div>
        );

      case 'cosmic':
        return (
          <div className={cn(sizeClasses[size], 'relative', className)}>
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 border-4 border-cosmic-purple/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Middle ring */}
            <motion.div
              className="absolute inset-2 border-3 border-stellar-blue/50 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner ring */}
            <motion.div
              className="absolute inset-4 border-2 border-saffron rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            {/* Center dot */}
            <motion.div
              className="absolute inset-1/2 w-2 h-2 -translate-x-1 -translate-y-1 bg-gold rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case 'sacred':
        return (
          <div className={cn(sizeClasses[size], 'relative', className)}>
            {/* Sanskrit symbols rotating */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-saffron font-vedic text-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              ॐ
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-gold font-vedic text-sm"
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ transform: 'translateY(-12px)' }}
            >
              श्री
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-maroon font-vedic text-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ transform: 'translateY(12px)' }}
            >
              गं
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {renderSpinner()}

        {/* Subtle glow effect */}
        <div className={cn(
          'absolute inset-0 rounded-full blur-lg opacity-20',
          colorClasses[color],
          'bg-current'
        )} />
      </div>

      {showMessage && message && (
        <motion.div
          className="text-center"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary font-medium">
            {message}
          </p>
          <div className="flex justify-center space-x-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-saffron rounded-full"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Preset configurations for common use cases
export const VedicSpinnerPresets = {
  chartGeneration: {
    variant: 'mandala',
    size: 'lg',
    color: 'cosmic',
    message: 'Generating your cosmic blueprint...'
  },
  analysis: {
    variant: 'om',
    size: 'md',
    color: 'saffron',
    message: 'Analyzing planetary influences...'
  },
  calculation: {
    variant: 'cosmic',
    size: 'md',
    color: 'stellar',
    message: 'Computing astrological calculations...'
  },
  report: {
    variant: 'lotus',
    size: 'lg',
    color: 'gold',
    message: 'Preparing your detailed report...'
  },
  sacred: {
    variant: 'sacred',
    size: 'xl',
    color: 'saffron',
    message: 'Invoking divine wisdom...'
  }
};

// Simple loading hook for easy integration
export const useVedicLoading = (isLoading, preset = 'analysis') => {
  const config = VedicSpinnerPresets[preset] || VedicSpinnerPresets.analysis;

  return {
    isLoading,
    LoadingComponent: () => isLoading ? (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-8 shadow-vedic-strong">
          <VedicLoadingSpinner {...config} />
        </div>
      </div>
    ) : null
  };
};

export default VedicLoadingSpinner;
