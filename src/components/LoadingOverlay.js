import React from 'react';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        {/* Modern Spinner */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-gray-700 font-medium text-lg">Processing...</p>
        <p className="text-gray-500 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
}