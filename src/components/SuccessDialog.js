import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function SuccessDialog({ 
  isOpen, 
  onClose, 
  title, 
  message,
  buttonText = 'Got it'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          // Don't close on backdrop click for success dialog
        }}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[calc(100%-2rem)] max-w-md pointer-events-auto" style={{ animation: 'slideDown 0.3s ease-out' }}>
        <div className="p-6">
          {/* Success Icon with animation */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once">
            <CheckCircle2 size={32} className="text-green-600" strokeWidth={2.5} />
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
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            {buttonText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}