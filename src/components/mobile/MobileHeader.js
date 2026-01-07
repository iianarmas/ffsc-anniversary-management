import React from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import Avatar from '../Avatar';

export default function MobileHeader({
  title = 'FFSC20',
  subtitle,
  showAddButton = false,
  onAddClick,
}) {
  const { profile } = useAuth();

  const handleNavigateHome = () => {
    const event = new CustomEvent('navigate-to-home');
    window.dispatchEvent(event);
  };

  const handleNavigateProfile = () => {
    const event = new CustomEvent('navigate-to-profile');
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-soft z-mobile-header">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <img
            src="/church-logo.svg"
            alt="FFSC Logo"
            className="w-8 h-8 object-contain flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
            onClick={handleNavigateHome}
          />
          <div>
            <h1
              style={{ fontFamily: 'Moderniz, sans-serif' }}
              className="text-sm font-semibold text-[#001740] cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateHome}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Actions and Avatar */}
        <div className="flex items-center gap-2">
          {showAddButton && profile?.role !== 'viewer' && onAddClick && (
            <button
              onClick={onAddClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95"
              aria-label="Add person"
            >
              <Plus size={20} className="text-gray-500 hover:text-gray-700 transition-colors" />
            </button>
          )}
          <button
            onClick={handleNavigateProfile}
            className="cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
            aria-label="View profile"
          >
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name}
              size="md"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
