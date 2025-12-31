import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function SuccessToast({ message, subMessage, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[60] transform transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-green-600 text-white rounded-lg shadow-2xl p-4 flex items-start gap-3 min-w-[320px]">
        <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <Check size={16} className="text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {subMessage && <p className="text-sm text-green-100 mt-1">{subMessage}</p>}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-green-100 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}