import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import VedicLoadingSpinner from '../loading/VedicLoadingSpinner';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-vedic font-medium transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    'transform hover:scale-105 active:scale-95',
    'relative overflow-hidden'
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-earth-brown text-white shadow-vedic-soft',
          'hover:bg-earth-brown/90 hover:shadow-vedic-medium',
          'focus:ring-earth-brown/50'
        ],
        golden: [
          'bg-gradient-to-r from-gold to-saffron text-white shadow-golden',
          'hover:from-saffron hover:to-gold hover:shadow-xl',
          'focus:ring-gold/50',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300',
          'hover:before:opacity-100'
        ],
        cosmic: [
          'bg-gradient-to-r from-cosmic-purple to-stellar-blue text-white shadow-cosmic',
          'hover:from-stellar-blue hover:to-cosmic-purple hover:shadow-celestial',
          'focus:ring-cosmic-purple/50'
        ],
        vedic: [
          'bg-gradient-vedic text-white shadow-vedic-medium',
          'hover:shadow-vedic-strong focus:ring-saffron/50'
        ],
        secondary: [
          'bg-transparent border-2 border-white text-white',
          'hover:bg-white hover:text-earth-brown',
          'focus:ring-white/50'
        ],
        outline: [
          'border-2 border-earth-brown text-earth-brown bg-transparent',
          'hover:bg-earth-brown hover:text-white',
          'focus:ring-earth-brown/50'
        ],
        ghost: [
          'bg-transparent text-earth-brown',
          'hover:bg-earth-brown/10 hover:text-earth-brown',
          'focus:ring-earth-brown/50'
        ],
        link: [
          'text-earth-brown underline-offset-4',
          'hover:underline focus:ring-earth-brown/50'
        ]
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const Button = forwardRef(({
  className,
  variant,
  size,
  children,
  loading = false,
  loadingText = 'Loading...',
  disabled,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? motion.div : motion.button;

  const isDisabled = disabled || loading;

  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading ? (
        <>
          <VedicLoadingSpinner
            variant="mandala"
            size="small"
            className="mr-2"
            text=""
            subtext=""
            fullscreen={false}
          />
          {loadingText}
        </>
      ) : (
        children
      )}

      {/* Vedic sparkle effect for golden variant */}
      {variant === 'golden' && !loading && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </motion.div>
      )}
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
