/**
 * Tooltip Component
 * Accessible tooltip with keyboard support and Vedic design system styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import '../../styles/vedic-design-system.css';

const Tooltip = ({ 
  content, 
  children, 
  position = 'top',
  className = '',
  showIcon = true,
  iconSize = 'sm'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isVisible]);

  const iconSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowPositions = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-vedic-saffron',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-vedic-saffron',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-vedic-saffron',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-vedic-saffron'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        className="inline-flex items-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        role="button"
        tabIndex={0}
        aria-describedby={`tooltip-${content?.slice(0, 10)}`}
        aria-expanded={isVisible}
      >
        {children}
        {showIcon && (
          <FaQuestionCircle
            className={`${iconSizes[iconSize]} text-vedic-saffron ml-1 cursor-help`}
            aria-hidden="true"
          />
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          id={`tooltip-${content?.slice(0, 10)}`}
          role="tooltip"
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-vedic-saffron rounded-lg shadow-lg max-w-xs ${positions[position]}`}
          style={{
            backgroundColor: 'var(--vedic-saffron)',
            color: 'var(--text-white)'
          }}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowPositions[position]}`}
            style={{
              borderColor: position === 'top' ? 'var(--vedic-saffron) transparent transparent transparent' :
                           position === 'bottom' ? 'transparent transparent var(--vedic-saffron) transparent' :
                           position === 'left' ? 'transparent transparent transparent var(--vedic-saffron)' :
                           'transparent var(--vedic-saffron) transparent transparent'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

