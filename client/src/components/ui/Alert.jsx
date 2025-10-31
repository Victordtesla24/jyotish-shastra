import React from 'react';
import clsx from 'clsx';

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
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
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

  return (
    <div
      className={clsx(
        baseClasses,
        variants[type],
        className
      )}
      {...props}
    >
      <span className="text-xl flex-shrink-0">{icons[type]}</span>
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
            <div className="text-sm font-medium">💡 Suggestion:</div>
            <div className="text-sm opacity-90">{suggestion}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
