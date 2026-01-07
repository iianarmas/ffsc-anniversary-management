import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';

export default function Dropdown({
  trigger,
  children,
  align = 'left',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current?.offsetHeight || 0;
      const dropdownWidth = dropdownRef.current?.offsetWidth || 0;

      let top = rect.bottom + 8;
      let left = align === 'right' ? rect.right - dropdownWidth : rect.left;

      // Check if dropdown goes below viewport
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 8;
      }

      // Check if dropdown goes outside right edge
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16;
      }

      // Check if dropdown goes outside left edge
      if (left < 16) {
        left = 16;
      }

      setPosition({ top, left });
    }
  }, [isOpen, align]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`fixed bg-white rounded-lg shadow-dropdown border border-gray-200 py-1 z-dropdown min-w-[12rem] animate-fade-in-up ${className}`}
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  selected = false,
  destructive = false,
  disabled = false,
  className = '',
}) {
  return (
    <button
      onClick={(e) => {
        if (!disabled && onClick) {
          onClick(e);
        }
      }}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
        destructive
          ? 'text-red-600 hover:bg-red-50'
          : disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-50'
      } ${className}`}
    >
      {Icon && <Icon size={16} className="flex-shrink-0" />}
      <span className="flex-1">{children}</span>
      {selected && <Check size={16} className="text-primary-main flex-shrink-0" />}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-gray-100" />;
}

export function DropdownLabel({ children, className = '' }) {
  return (
    <div className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </div>
  );
}
