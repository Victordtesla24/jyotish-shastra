import React, { forwardRef } from 'react';
import clsx from 'clsx';
import VedicLoadingSpinner from './VedicLoadingSpinner.jsx';

// Updated Button component with more variants
export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'text-white focus:ring-cosmic-purple',
    secondary: 'text-primary border focus:ring-gray-300',
    cosmic: 'bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white hover:from-cosmic-purple-dark hover:to-cosmic-pink-dark focus:ring-cosmic-purple',
    ghost: 'text-primary hover:bg-card-hover focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = clsx(
    baseClasses,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className
  );

  const getButtonStyle = () => {
    if (variant === 'primary') {
      return { background: 'linear-gradient(135deg, #FFD700 0%, #FF9933 100%)', color: '#000000' };
    } else if (variant === 'secondary') {
      return { backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' };
    } else if (variant === 'ghost') {
      return { backgroundColor: 'transparent', color: 'var(--text-primary)' };
    }
    return {};
  };

  return (
    <button
      ref={ref}
      className={classes}
      style={getButtonStyle()}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (variant === 'secondary') {
          e.currentTarget.style.borderColor = 'var(--divine-gold)';
          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary') {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.backgroundColor = 'transparent';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// Card component
export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-lg shadow-md border',
        className
      )}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced Card Components
export {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants
} from './cards/Card.jsx';

// Modal Components
export { default as Modal, AlertModal, SuccessModal } from './modals/Modal.jsx';

// Input Components
export {
  Input,
  Textarea,
  InputGroup,
  inputVariants
} from './inputs/Input.jsx';

export { default as Select } from './inputs/Select.jsx';

// Loading Components
export {
  default as Skeleton,
  SkeletonContainer,
  SkeletonCard,
  SkeletonForm,
  SkeletonTable,
  SkeletonChart
} from './loading/Skeleton.jsx';

// Loading Components - export from correct location
export {
  VedicLoadingSpinner as default,
  VedicLoadingSpinner
};

// Named exports from VedicLoadingSpinner (for backward compatibility)
export const ChartLoadingSpinner = VedicLoadingSpinner;
export const AnalysisLoadingSpinner = VedicLoadingSpinner;
export const PageLoadingSpinner = VedicLoadingSpinner;
export const InlineVedicSpinner = VedicLoadingSpinner;

// Alias for LoadingSpinner (expected by tests)
export { VedicLoadingSpinner as LoadingSpinner };

// Theme Components
export { default as ThemeToggle } from './ThemeToggle.jsx';

// Vedic Icons
export {
  OmIcon,
  LotusIcon,
  MandalaIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  TrishulIcon,
  YantraIcon,
  ChakraIcon,
  default as VedicIcons
} from './VedicIcons.jsx';

// Typography Components
export {
  SacredText,
  MantraWheel,
  VedicQuote,
  SanskritNumber,
  BreathingText,
  TypewriterText,
  VedicHeading
} from './typography/VedicTypography.jsx';

// Chart Components
export { default as VedicChartDisplay } from '../charts/VedicChartDisplay.jsx';


// Error Components
export { default as ErrorMessage } from './ErrorMessage.jsx';

// Alert Component  
export { default as Alert } from './Alert.jsx';

// Tooltip Component
export { default as Tooltip } from './Tooltip.jsx';

// LocationAutoComplete Component
export { default as LocationAutoComplete } from './LocationAutoComplete.jsx';

// Utility function for class names
export const cn = (...args) => args.filter(Boolean).join(' ');
