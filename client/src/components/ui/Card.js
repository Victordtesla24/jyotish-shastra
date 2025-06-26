import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  variant = 'default',
  className = '',
  hover = true,
  padding = 'md',
  ...props
}) => {
  const baseClasses = [
    'rounded-2xl',
    'transition-all duration-300',
    hover ? 'transform hover:scale-[1.02]' : ''
  ].filter(Boolean).join(' ');

  const variantClasses = {
    default: [
      'bg-white',
      'shadow-vedic-soft border border-gray-100',
      hover ? 'hover:shadow-vedic-medium' : ''
    ].filter(Boolean).join(' '),

    cosmic: [
      'bg-gradient-cosmic text-white',
      'shadow-cosmic backdrop-blur-sm'
    ].join(' '),

    vedic: [
      'bg-gradient-vedic text-white',
      'shadow-vedic-medium'
    ].join(' '),

    elevated: [
      'bg-white',
      'shadow-vedic-strong border border-gray-200',
      hover ? 'hover:shadow-xl' : ''
    ].filter(Boolean).join(' '),

    glassmorphic: [
      'bg-white/20 backdrop-blur-lg',
      'border border-white/30',
      'shadow-celestial'
    ].join(' '),

    golden: [
      'bg-gradient-to-br from-gold/20 to-saffron/20',
      'border-2 border-gold/30',
      'shadow-golden backdrop-blur-sm'
    ].join(' ')
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  ].join(' ');

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', size = 'lg', ...props }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <h3
      className={`font-accent font-semibold text-earth-brown mb-2 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`text-wisdom-gray leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'cosmic', 'vedic', 'elevated', 'glassmorphic', 'golden']),
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Export individual components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
export { CardHeader, CardTitle, CardContent, CardFooter };
