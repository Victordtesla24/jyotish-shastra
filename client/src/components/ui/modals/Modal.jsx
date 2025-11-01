import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils.js';
import { Button } from '../buttons/Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  variant = 'default',
  className,
  ariaLabelledBy,
  ariaDescribedBy,
}) => {
  const modalRef = useRef(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`).current;
  const descId = useRef(`modal-desc-${Math.random().toString(36).substr(2, 9)}`).current;

  // Handle escape key press
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    modalElement.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => modalElement.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  const variantClasses = {
    default: 'bg-vedic-surface',
    cosmic: 'bg-gradient-to-br from-cosmic-purple/95 to-stellar-blue/95 text-white',
    vedic: 'bg-gradient-to-br from-vedic-primary/95 to-vedic-secondary/95 text-white',
    glass: 'bg-white/90 backdrop-blur-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-celestial',
              sizeClasses[size],
              variantClasses[variant],
              className
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
            aria-describedby={ariaDescribedBy || (description ? descId : undefined)}
          >
            {/* Decorative elements for cosmic/vedic variants */}
            {(variant === 'cosmic' || variant === 'vedic') && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              </div>
            )}

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="space-y-1">
                  {title && (
                    <h2
                      id={titleId}
                      className={cn(
                      'text-2xl font-cinzel font-bold',
                      variant === 'cosmic' || variant === 'vedic' ? 'text-white' : 'text-vedic-text'
                      )}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id={descId}
                      className={cn(
                      'text-sm',
                      variant === 'cosmic' || variant === 'vedic' ? 'text-white/80' : 'text-vedic-text-muted'
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'rounded-full p-2 transition-colors',
                      variant === 'cosmic' || variant === 'vedic'
                        ? 'hover:bg-white/20 text-white'
                        : 'hover:bg-vedic-background text-vedic-text-muted hover:text-vedic-text'
                    )}
                    aria-label="Close modal"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto scrollbar-vedic" role="document">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 border-t border-vedic-border/20 px-6 py-4">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Preset modal components
export const AlertModal = ({ isOpen, onClose, title, message, onConfirm }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </>
    }
  >
    <p className="text-vedic-text">{message}</p>
  </Modal>
);

export const SuccessModal = ({ isOpen, onClose, title, message }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <div className="flex items-center gap-2">
        <span className="text-2xl">✨</span>
        {title}
      </div>
    }
    size="sm"
    variant="vedic"
  >
    <p className="text-white">{message}</p>
  </Modal>
);

export default Modal;
