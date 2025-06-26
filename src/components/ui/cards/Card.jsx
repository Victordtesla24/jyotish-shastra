import React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const cardVariants = cva(
  'relative rounded-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-vedic-surface border border-vedic-border shadow-soft hover:shadow-medium',
        elevated: 'bg-vedic-surface shadow-medium hover:shadow-strong',
        cosmic: 'bg-gradient-to-br from-cosmic-purple/10 to-stellar-blue/10 border border-cosmic-purple/20 backdrop-blur-sm',
        vedic: 'bg-gradient-to-br from-vedic-primary/5 to-vedic-secondary/5 border border-vedic-primary/20',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20',
        outlined: 'bg-transparent border-2 border-vedic-border',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-2',
        glow: 'hover:shadow-celestial',
        scale: 'hover:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'lift',
    },
  }
);

const Card = React.forwardRef(
  ({
    className,
    variant,
    padding,
    hover,
    children,
    animate = true,
    onClick,
    header,
    footer,
    badge,
    decorative = false,
    ...props
  }, ref) => {
    const isClickable = !!onClick;
    const Component = animate ? motion.div : 'div';

    const animationProps = animate ? {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: 'easeOut' },
      whileHover: isClickable ? { scale: 1.01 } : {},
    } : {};

    return (
      <Component
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, hover }),
          isClickable && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...animationProps}
        {...props}
      >
        {/* Decorative gradient line */}
        {decorative && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vedic-primary via-vedic-accent to-vedic-secondary rounded-t-2xl" />
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute -top-3 -right-3 z-10">
            {badge}
          </div>
        )}

        {/* Header */}
        {header && (
          <div className="mb-4 pb-4 border-b border-vedic-border/50">
            {header}
          </div>
        )}

        {/* Main content */}
        <div className="relative">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-vedic-border/50">
            {footer}
          </div>
        )}

        {/* Cosmic variant special effects */}
        {variant === 'cosmic' && (
          <>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cosmic-purple to-stellar-blue rounded-2xl opacity-20 blur-sm -z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cosmic-purple/5 to-transparent rounded-2xl pointer-events-none" />
          </>
        )}

        {/* Glass variant special effects */}
        {variant === 'glass' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none" />
        )}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-1.5', className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

// Card Title Component
const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-cinzel font-bold text-vedic-text', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

// Card Description Component
const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-vedic-text-muted', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

// Card Content Component
const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('', className)}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

// Card Footer Component
const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
