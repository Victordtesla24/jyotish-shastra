import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-vedic',
    'transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transform hover:scale-105 active:scale-95'
  ].join(' ');

  const variantClasses = {
    primary: [
      'bg-gradient-vedic text-white',
      'shadow-vedic-medium hover:shadow-vedic-strong',
      'focus:ring-saffron'
    ].join(' '),

    secondary: [
      'bg-transparent border-2 border-white text-white',
      'hover:bg-white hover:text-navy',
      'focus:ring-white'
    ].join(' '),

    cosmic: [
      'bg-gradient-cosmic text-white',
      'shadow-cosmic hover:shadow-celestial',
      'focus:ring-cosmic-purple'
    ].join(' '),

    outline: [
      'bg-transparent border-2 border-saffron text-saffron',
      'hover:bg-saffron hover:text-white',
      'focus:ring-saffron'
    ].join(' '),

    ghost: [
      'bg-transparent text-wisdom-gray',
      'hover:bg-gray-100 hover:text-earth-brown',
      'focus:ring-gray-300'
    ].join(' '),

    golden: [
      'bg-gradient-to-r from-gold to-saffron text-white',
      'shadow-golden hover:shadow-xl',
      'focus:ring-gold'
    ].join(' ')
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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
  );

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'cosmic', 'outline', 'ghost', 'golden']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
