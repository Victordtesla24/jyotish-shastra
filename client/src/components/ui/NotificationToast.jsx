import React, { useEffect } from 'react';

/**
 * NotificationToast - Shows temporary notification messages
 * @param {Object} props - Component props
 * @param {string} props.type - Type of notification (success, error, warning, info)
 * @param {string} props.message - Notification message
 * @param {Function} props.onClose - Callback when notification closes
 * @param {number} props.duration - Duration in ms before auto-close (default: 5000)
 * @returns {JSX.Element|null} Notification toast
 */
export const NotificationToast = ({ type = 'info', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '✅'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in-right`}>
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 flex items-start space-x-3 max-w-md`}>
        <span className="text-xl flex-shrink-0">{styles.icon}</span>
        <div className="flex-1">
          <p className={`${styles.text} text-sm font-medium`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotification = () => {
  const [notification, setNotification] = React.useState(null);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ type, message, duration });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess: (message, duration) => showNotification('success', message, duration),
    showError: (message, duration) => showNotification('error', message, duration),
    showWarning: (message, duration) => showNotification('warning', message, duration),
    showInfo: (message, duration) => showNotification('info', message, duration)
  };
};

export default NotificationToast;
