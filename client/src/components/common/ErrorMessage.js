import React from 'react';
// Removed CSS import - using Tailwind classes

const ErrorMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="p-4 my-4 border border-red-300 bg-red-50 text-red-800 rounded text-center">
      <p className="m-0">{message}</p>
    </div>
  );
};

export default ErrorMessage;
