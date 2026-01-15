import React from 'react';
import { Lock, ShieldX } from 'lucide-react';

export default function RestrictedAccessMessage({
  title = "Access Restricted",
  message = "You don't have permission to access this section. Please contact an administrator if you need access."
}) {
  return (
    <div className="min-h-screen bg-[#f9fafa] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Lock size={14} />
          <span>Viewer Role</span>
        </div>
      </div>
    </div>
  );
}
