import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Dialog({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnBackdrop = true,
  showClose = true,
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  return createPortal(
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Dialog */}
      <div
        className={`relative bg-white rounded-dialog shadow-dialog w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-scale-in ${className}`}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

// Dialog subcomponents
export function DialogHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = '', icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2 bg-primary-light rounded-lg">
          <Icon size={20} className="text-primary-main" />
        </div>
      )}
      <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>
        {children}
      </h2>
    </div>
  );
}

export function DialogDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function DialogContent({ children, className = '', scrollable = true }) {
  return (
    <div
      className={`flex-1 px-6 py-4 ${scrollable ? 'overflow-y-auto' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-dialog flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
