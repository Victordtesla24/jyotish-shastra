import React from 'react';
import { cn } from '../../lib/utils.js';

/**
 * Card Component and Variants
 * Provides card components for displaying content in a structured format
 */

// Card variants configuration
export const cardVariants = {
  default: 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border',
  primary: 'bg-vedic-primary/5 border-vedic-primary/20',
  cosmic: 'bg-cosmic-purple/5 border-cosmic-purple/20',
  elevated: 'shadow-lg border-transparent',
  outlined: 'bg-transparent border-2',
};

/**
 * Card Header Component
 */
export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 p-6',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * Card Title Component
 */
export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-vedic-text dark:text-dark-text-primary',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 */
export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-vedic-text-muted dark:text-dark-text-secondary',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * Card Content Component
 */
export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-0', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 */
export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-6 pt-0',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

/**
 * Default Card Component (also exported from index.js)
 */
export default function Card({ children, className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border shadow-md transition-shadow',
        cardVariants[variant] || cardVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
