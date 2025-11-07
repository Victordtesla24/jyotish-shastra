import React from 'react';
import clsx from 'clsx';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import '../../styles/vedic-design-system.css';

export const Alert = ({ 
  children, 
  type = 'info', 
  className, 
  fieldErrors = [],
  suggestion = null,
  ...props 
}) => {
  const baseClasses = 'p-4 rounded-lg border flex items-start gap-3';
  
  const variants = {
    info: 'bg-white/5 border-white/20 text-white',
    success: 'bg-white/5 border-white/20 text-white',
    warning: 'bg-white/5 border-white/20 text-white',
    error: 'bg-white/5 border-white/20 text-white',
  };
  
  const variantStyles = {
    success: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      color: 'rgb(255, 255, 255)'
    },
    error: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      color: 'rgb(255, 255, 255)'
    }
  };
  
  const icons = {
    info: <FaInfoCircle style={{ color: 'rgb(255, 255, 255)' }} />,
    success: <FaCheckCircle style={{ color: 'rgb(255, 255, 255)' }} />,
    warning: <FaExclamationTriangle style={{ color: 'rgb(255, 255, 255)' }} />,
    error: <FaTimesCircle style={{ color: 'rgb(255, 255, 255)' }} />,
  };

  // Parse field-specific errors from validation messages
  const parseValidationErrors = (errorText) => {
    if (typeof errorText !== 'string') return [];
    
    // Parse errors like "Validation failed: dateOfBirth: Date is required, timeOfBirth: Time should be HH:MM"
    const fieldErrorPattern = /([a-zA-Z_]+):\s*([^,]+)/g;
    const errors = [];
    let match;
    
    while ((match = fieldErrorPattern.exec(errorText)) !== null) {
      errors.push({
        field: match[1].toLowerCase(),
        message: match[2].trim()
      });
    }
    
    return errors;
  };

  // Convert children to string for parsing
  const textContent = React.Children.toArray(children).join('');
  const validationErrors = [...parseValidationErrors(textContent), ...fieldErrors];

  const getVariantStyle = () => {
    if (type === 'success' || type === 'error') {
      return variantStyles[type];
    }
    return {};
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variants[type],
        className
      )}
      style={getVariantStyle()}
      {...props}
    >
      <span className="text-xl flex-shrink-0 flex items-center">{icons[type]}</span>
      <div className="flex-1">
        {/* Display main message */}
        <div className="font-medium mb-1">
          {type === 'error' && validationErrors.length > 0 ? 'Validation Error' : null}
          {type === 'error' && validationErrors.length === 0 ? null : children}
        </div>
        
        {/* Display field-specific errors */}
        {validationErrors.length > 0 && (
          <div className="mt-2 space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-sm opacity-90">
                <span className="font-medium capitalize">
                  {error.field.replace('_', ' ')}:
                </span> {error.message}
              </div>
            ))}
          </div>
        )}
        
        {/* Display suggestion if provided */}
        {suggestion && (
          <div className="mt-3 pt-2 border-t border-current border-opacity-20">
            <div className="text-sm font-medium flex items-center gap-2">
              <FaLightbulb style={{ color: 'rgb(255, 255, 255)' }} />
              Suggestion:
            </div>
            <div className="text-sm opacity-90">{suggestion}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
