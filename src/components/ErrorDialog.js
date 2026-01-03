import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorDialog({ 
  isOpen, 
  onClose, 
  title = 'Error', 
  message,
  buttonText = 'Try Again'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in mx-4">
        <div className="p-6">
          {/* Error Icon with animation */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once">
            <AlertCircle size={32} className="text-red-600" strokeWidth={2.5} />
          </div>
          
          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#001740] mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
          
          {/* Action */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            {buttonText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce-once {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}