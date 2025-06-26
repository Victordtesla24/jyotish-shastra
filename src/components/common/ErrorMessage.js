import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="alert-error mb-4">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
