"use client";
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const cardVariants = cva(
  [
    'rounded-2xl transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2'
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white border border-gray-200 shadow-vedic-soft',
          'hover:shadow-vedic-medium focus:ring-earth-brown/50',
          'dark:bg-dark-surface dark:border-dark-border dark:shadow-cosmic'
        ],
        elevated: [
          'bg-white shadow-vedic-medium border-0',
          'hover:shadow-vedic-strong focus:ring-earth-brown/50',
          'dark:bg-dark-surface-elevated dark:shadow-celestial'
        ],
        glassmorphic: [
          'bg-white/10 backdrop-blur-xl border border-white/20',
          'hover:bg-white/20 focus:ring-white/50',
          'dark:bg-dark-surface/10 dark:border-dark-border/20'
        ],
        cosmic: [
          'bg-gradient-cosmic text-white shadow-cosmic',
          'hover:shadow-celestial focus:ring-cosmic-purple/50'
        ],
        vedic: [
          'bg-gradient-vedic text-white shadow-golden',
          'hover:shadow-vedic-strong focus:ring-saffron/50'
        ],
        sacred: [
          'bg-sacred-white border-2 border-gold/20 shadow-golden',
          'hover:border-gold/40 hover:shadow-xl focus:ring-gold/50',
          'dark:bg-dark-surface dark:border-dark-accent/20'
        ]
      },
      hover: {
        true: 'cursor-pointer transform hover:scale-105',
        false: ''
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      hover: false,
      padding: 'md'
    }
  }
);

const Card = forwardRef(({
  className,
  variant,
  hover = false,
  padding,
  children,
  decorative,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(cardVariants({ variant, hover, padding, className }))}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
});

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
));

const CardTitle = forwardRef(({
  className,
  size = 'lg',
  gradient = false,
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };

  return (
    <h3
      ref={ref}
      className={cn(
        'font-accent font-bold leading-none tracking-tight',
        sizeClasses[size],
        gradient && 'bg-gradient-vedic bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children || 'Card Title'}
    </h3>
  );
});

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-wisdom-gray leading-relaxed', className)}
    {...props}
  />
));

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0 text-gray-800 dark:text-gray-200', className)} {...props} />
));

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

// Display names for debugging
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants
};
