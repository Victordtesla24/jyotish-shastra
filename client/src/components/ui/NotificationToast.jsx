import React, { useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

/**
 * NotificationToast Component
 * Toast notification component for displaying messages
 * Supports different types: info, success, warning, error
 */
const NotificationToast = ({ 
  type = 'info', 
  message = '', 
  onClose,
  duration = 5000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'error':
        return <FaExclamationCircle className="w-5 h-5" />;
      case 'info':
      default:
        return <FaInfoCircle className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 10000,
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '500px',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '14px',
      animation: 'slideIn 0.3s ease-out'
    };

    const typeStyles = {
      info: {
        backgroundColor: 'rgba(59, 130, 246, 0.95)',
        color: '#FFFFFF',
        borderLeft: '4px solid #3B82F6'
      },
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.95)',
        color: '#FFFFFF',
        borderLeft: '4px solid #22C55E'
      },
      warning: {
        backgroundColor: 'rgba(251, 191, 36, 0.95)',
        color: '#000000',
        borderLeft: '4px solid #FBBF24'
      },
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        color: '#FFFFFF',
        borderLeft: '4px solid #EF4444'
      }
    };

    const positionStyles = {
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
    };

    return {
      ...baseStyles,
      ...typeStyles[type] || typeStyles.info,
      ...positionStyles[position] || positionStyles['top-right']
    };
  };

  if (!message) {
    return null;
  }

  return (
    <div style={getStyles()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {getIcon()}
        <span style={{ flex: 1 }}>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
          aria-label="Close notification"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      )}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;

