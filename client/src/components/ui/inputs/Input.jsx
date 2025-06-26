import React, { forwardRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';

const inputVariants = cva(
  'w-full rounded-xl border bg-vedic-surface text-vedic-text transition-all duration-300 placeholder:text-vedic-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-vedic-border focus:border-vedic-primary focus:ring-vedic-primary/20',
        cosmic: 'border-cosmic-purple/30 focus:border-cosmic-purple focus:ring-cosmic-purple/20 bg-cosmic-purple/5',
        vedic: 'border-vedic-primary/30 focus:border-vedic-primary focus:ring-vedic-accent/20 bg-vedic-primary/5',
        error: 'border-red-500 focus:border-red-600 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-600 focus:ring-green-500/20',
      },
      inputSize: {
        sm: 'h-9 px-3 py-2 text-sm',
        md: 'h-11 px-4 py-3 text-base',
        lg: 'h-14 px-6 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      variant,
      inputSize,
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      required,
      showCharCount = false,
      maxLength,
      onFocus,
      onBlur,
      animate = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(props.value?.length || 0);

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
    };

    const inputVariant = error ? 'error' : success ? 'success' : variant;
    const MotionDiv = animate ? motion.div : 'div';

    return (
      <MotionDiv
        className="relative"
        initial={animate ? { opacity: 0, y: 10 } : {}}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        transition={animate ? { duration: 0.3 } : {}}
      >
        {/* Label */}
        {label && (
          <label className="block mb-2 text-sm font-medium text-vedic-text">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vedic-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={type}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-vedic-text-muted">
              {rightIcon}
            </div>
          )}

          {/* Focus Glow Effect */}
          {isFocused && animate && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                boxShadow: `0 0 0 3px ${
                  inputVariant === 'cosmic' ? 'rgba(107, 70, 193, 0.1)' :
                  inputVariant === 'vedic' ? 'rgba(255, 215, 0, 0.1)' :
                  inputVariant === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                  inputVariant === 'success' ? 'rgba(34, 197, 94, 0.1)' :
                  'rgba(255, 107, 53, 0.1)'
                }`,
              }}
            />
          )}
        </div>

        {/* Helper Text / Error Message */}
        <AnimatePresence mode="wait">
          {(error || success || helperText || (showCharCount && maxLength)) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 flex justify-between items-center"
            >
              <p className={cn(
                'text-sm',
                error && 'text-red-500',
                success && 'text-green-500',
                !error && !success && 'text-vedic-text-muted'
              )}>
                {error || success || helperText}
              </p>

              {showCharCount && maxLength && (
                <span className={cn(
                  'text-xs',
                  charCount >= maxLength ? 'text-red-500' : 'text-vedic-text-muted'
                )}>
                  {charCount}/{maxLength}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </MotionDiv>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
const Textarea = forwardRef(
  ({ className, variant, inputSize, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          inputVariants({ variant, inputSize }),
          'resize-y min-h-[100px]',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

// Input Group Component for complex layouts
const InputGroup = ({ children, className }) => {
  return (
    <div className={cn('flex gap-2', className)}>
      {children}
    </div>
  );
};

InputGroup.displayName = 'InputGroup';

export { Input, Textarea, InputGroup, inputVariants };
