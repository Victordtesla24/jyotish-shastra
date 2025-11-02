import React from 'react';
import { cn } from '../../../lib/utils.js';

/**
 * Card Component
 * Base card component with Vedic design system styling
 */
export const Card = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-dark-surface rounded-lg shadow-md border border-gray-200 dark:border-dark-border',
        className
      )}
      {...props}
    />
  );
});

Card.displayName = 'Card';

/**
 * CardHeader Component
 * Header section of the card
 */
export const CardHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * CardTitle Component
 * Title section of the card
 */
export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-dark-text-primary',
        className
      )}
      aria-label={children || 'Card title'}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * CardDescription Component
 * Description section of the card
 */
export const CardDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500 dark:text-dark-text-secondary', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * CardContent Component
 * Main content section of the card
 */
export const CardContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  );
});

CardContent.displayName = 'CardContent';

/**
 * CardFooter Component
 * Footer section of the card
 */
export const CardFooter = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
});

CardFooter.displayName = 'CardFooter';

/**
 * Card Variants
 * Variant definitions for different card styles
 */
export const cardVariants = {
  default: 'bg-white dark:bg-dark-surface',
  sacred: 'card-sacred',
  cosmic: 'card-cosmic',
  vedic: 'card-vedic',
};

export default Card;
