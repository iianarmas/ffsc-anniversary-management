import React from 'react';
import { X, PartyPopper } from 'lucide-react';

export default function WelcomeModal({ isOpen, onClose, userName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="bg-gradient-to-r from-[#0f2a71] to-[#001740] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="text-white" size={40} />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome to FFSC Management App!
          </h2>
          
          <p className="text-xl text-gray-700 mb-4">
            Hi, {userName}!
          </p>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Your email has been confirmed and your account is now active. 
            You can now access the anniversary management system and all its features.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-900 font-semibold mb-2">Quick Tips:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use the sidebar to navigate between different views</li>
              <li>• Check your tasks and notifications regularly</li>
              <li>• Contact an admin if you need additional permissions</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#0f2a71] to-[#001740] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Get Started
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}