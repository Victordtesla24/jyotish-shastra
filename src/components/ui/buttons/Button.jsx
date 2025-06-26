import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-saffron to-maroon text-white hover:shadow-vedic-medium focus:ring-saffron',
        secondary: 'bg-white border-2 border-saffron text-saffron hover:bg-saffron hover:text-white focus:ring-saffron',
        golden: 'bg-gradient-to-r from-gold to-saffron text-white hover:shadow-golden focus:ring-gold',
        cosmic: 'bg-gradient-to-r from-cosmic-purple to-stellar-blue text-white hover:shadow-cosmic focus:ring-cosmic-purple',
        ghost: 'bg-transparent text-current hover:bg-gray-100 dark:hover:bg-dark-surface focus:ring-saffron',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
      },
      size: {
        sm: 'h-9 px-3 py-2 text-sm rounded-lg',
        md: 'h-11 px-6 py-3 text-base rounded-xl',
        lg: 'h-14 px-8 py-4 text-lg rounded-xl',
        xl: 'h-16 px-10 py-5 text-xl rounded-2xl',
        icon: 'h-10 w-10 rounded-full p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

const Button = forwardRef(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      children,
      disabled,
      leftIcon,
      rightIcon,
      onClick,
      animate = true,
      ...props
    },
    ref
  ) => {
    const handleClick = (e) => {
      if (!disabled && !loading && onClick) {
        // Create ripple effect
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);

        onClick(e);
      }
    };

    const MotionComponent = animate ? motion.button : 'button';
    const animationProps = animate
      ? {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring', stiffness: 400, damping: 17 },
        }
      : {};

    return (
      <MotionComponent
        ref={ref}
        type="button"
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        disabled={disabled || loading}
        onClick={handleClick}
        {...animationProps}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Button content */}
        <span className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}>
          {leftIcon && <span className="text-current">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="text-current">{rightIcon}</span>}
        </span>

        {/* Shimmer effect for primary and accent variants */}
        {(variant === 'primary' || variant === 'accent' || variant === 'cosmic') && !disabled && (
          <span className="absolute inset-0 -z-10">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
          </span>
        )}
      </MotionComponent>
    );
  }
);

Button.displayName = 'Button';

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      100% {
        transform: translateX(100%) skewX(-12deg);
      }
    }

    .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    }

    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export { Button, buttonVariants };
