import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function RoleRequestDialog({ 
  isOpen, 
  status, // 'approved' or 'rejected'
  onClose 
}) {
  const [countdown, setCountdown] = useState(status === 'approved' ? 5 : 3);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(status === 'approved' ? 5 : 3);
      setCanDismiss(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanDismiss(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  const handleDismiss = () => {
    if (canDismiss) {
      onClose();
      if (status === 'approved') {
        // Refresh page to show new role
        window.location.reload();
      }
    }
  };

  const handleRequestAgain = () => {
    onClose();
    // Trigger request again - this will be handled by parent component
    window.dispatchEvent(new CustomEvent('request-role-again'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
        {status === 'approved' ? (
          <>
            {/* Approval Content */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                🎉 Request Approved!
              </h3>
              <p className="text-gray-600 mb-2">
                You are now a <span className="font-semibold text-blue-600">Committee member</span>!
              </p>
              <p className="text-sm text-gray-500">
                Please refresh to see your new access.
              </p>
            </div>
            
            <button
              onClick={handleDismiss}
              disabled={!canDismiss}
              className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                canDismiss
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canDismiss ? 'Okay' : `Okay (${countdown})`}
            </button>
          </>
        ) : (
          <>
            {/* Rejection Content */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={32} className="text-red-600" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Request Declined
              </h3>
              <p className="text-gray-600 mb-2">
                Your role change request was not approved at this time.
              </p>
              <p className="text-sm text-gray-500">
                You can request again in 3 days.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                disabled={!canDismiss}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                  canDismiss
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canDismiss ? 'Dismiss' : `Dismiss (${countdown})`}
              </button>
              <button
                onClick={handleRequestAgain}
                disabled={!canDismiss}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${
                  canDismiss
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Request Again
              </button>
            </div>
          </>
        )}
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
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}