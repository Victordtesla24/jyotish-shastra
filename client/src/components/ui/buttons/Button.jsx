import React from 'react';

const Button = ({ children, onClick, disabled = false, loading = false, type = 'button', className = '', ...props }) => {
  // Remove loading from props to prevent it from being passed to the DOM element
  const { loading: _, ...otherProps } = props;

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`bg-saffron text-white px-6 py-3 rounded hover:bg-saffron/90 disabled:opacity-50 ${className}`}
      {...otherProps}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export { Button };
