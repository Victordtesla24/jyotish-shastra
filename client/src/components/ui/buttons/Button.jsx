import React from 'react';

const Button = ({ children, onClick, disabled = false, type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-saffron text-white px-6 py-3 rounded hover:bg-saffron/90 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
