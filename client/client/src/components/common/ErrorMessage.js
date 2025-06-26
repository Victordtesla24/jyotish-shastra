import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="error-message-container">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
