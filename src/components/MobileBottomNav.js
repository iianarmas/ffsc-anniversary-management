import React, { useState } from 'react';
import {
  Home,
  Users,
  ShoppingBag,
  CheckSquare,
  MoreHorizontal,
  DollarSign,
  Wallet,
  Shield,
  Settings,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

export default function MobileBottomNav({
  currentView,
  setCurrentView,
  taskCount = 0,
  roleRequestCount = 0,
}) {
  const { profile } = useAuth();
  const isViewer = profile?.role === 'viewer';
  const isAdmin = profile?.role === 'admin';
  const isCommitteeOrAdmin = profile?.role === 'committee' || profile?.role === 'admin';

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Main navigation items (always visible in bottom bar)
  const mainNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'registration', icon: Users, label: 'Registration' },
    { id: 'shirts', icon: ShoppingBag, label: 'Shirts' },
    // Tasks - visible to all but restricted for viewers
    { id: 'tasks', icon: CheckSquare, label: 'Tasks', badge: !isViewer ? taskCount : 0, restricted: isViewer },
  ];

  // Add Collections for committee and admin (visible but restricted for viewers)
  if (isCommitteeOrAdmin || isViewer) {
    mainNavItems.splice(3, 0, { id: 'collections', icon: DollarSign, label: 'Collections', restricted: isViewer });
  }

  // "More" menu items
  const moreMenuItems = [
    // Finance - visible to committee, admin, and viewer (restricted for viewer)
    ...(isCommitteeOrAdmin || isViewer ? [{ id: 'finance', icon: Wallet, label: 'Finance', restricted: isViewer }] : []),
    // Users - admin only
    ...(isAdmin ? [{ id: 'users', icon: Shield, label: 'Manage Users', badge: roleRequestCount }] : []),
    // Settings - admin only
    ...(isAdmin ? [{ id: 'system-settings', icon: Settings, label: 'Settings' }] : []),
  ];

  // Check if current view is in the "More" menu
  const isMoreActive = moreMenuItems.some(item => item.id === currentView);

  // Calculate total badge count for "More" button
  const moreBadgeCount = moreMenuItems.reduce((sum, item) => sum + (item.badge || 0), 0);

  const handleNavClick = (id) => {
    setCurrentView(id);
    localStorage.setItem('currentView', id);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998]"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}

      {/* More Menu Popup */}
      {isMoreMenuOpen && (
        <div className="fixed bottom-[72px] right-2 bg-white rounded-xl shadow-xl border border-gray-200 z-[999] min-w-[200px] overflow-hidden animate-slide-up">
          <div className="p-2">
            {moreMenuItems.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No additional options
              </div>
            ) : (
              moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#0f2a71] text-white'
                        : item.restricted
                          ? 'text-gray-400 hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {item.restricted && (
                      <Lock size={14} className={`ml-auto ${isActive ? 'text-white/70' : 'text-gray-400'}`} />
                    )}
                    {item.badge > 0 && !item.restricted && (
                      <span className={`ml-auto text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 ${
                        isActive ? 'bg-white text-[#0f2a71]' : 'bg-red-500 text-white'
                      }`}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom z-mobile-nav shadow-[0_-4px_16px_rgba(15,42,113,0.08)]">
        <div className="flex items-center justify-between px-1 py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all duration-300 flex-1 mx-0.5 relative group ${
                  isActive
                    ? 'bg-[#0f2a71] text-white shadow-soft'
                    : 'text-gray-500 hover:bg-gray-100 active:scale-95'
                }`}
                style={{ minHeight: '56px', maxWidth: '80px' }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icon */}
                <div
                  className={`transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium mt-1 transition-all ${
                    isActive ? 'font-semibold' : ''
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full animate-bounce-in" />
                )}

                {/* Notification Badge */}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-card animate-bounce-in">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {/* Lock indicator for restricted items */}
                {item.restricted && (
                  <Lock size={10} className="absolute bottom-1 right-1 text-gray-400" />
                )}
              </button>
            );
          })}

          {/* More Button - Only show if there are items in the more menu */}
          {moreMenuItems.length > 0 && (
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all duration-300 flex-1 mx-0.5 relative group ${
                isMoreMenuOpen || isMoreActive
                  ? 'bg-[#0f2a71] text-white shadow-soft'
                  : 'text-gray-500 hover:bg-gray-100 active:scale-95'
              }`}
              style={{ minHeight: '56px', maxWidth: '80px' }}
              aria-label="More options"
            >
              {/* Icon */}
              <div
                className={`transition-transform duration-300 ${
                  isMoreMenuOpen || isMoreActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                {isMoreMenuOpen ? (
                  <X size={22} strokeWidth={2.5} />
                ) : (
                  <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.5 : 2} />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium mt-1 transition-all ${
                  isMoreMenuOpen || isMoreActive ? 'font-semibold' : ''
                }`}
              >
                More
              </span>

              {/* Active indicator dot */}
              {isMoreActive && !isMoreMenuOpen && (
                <div className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full animate-bounce-in" />
              )}

              {/* Badge for more menu items */}
              {moreBadgeCount > 0 && !isMoreMenuOpen && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-card animate-bounce-in">
                  {moreBadgeCount > 99 ? '99+' : moreBadgeCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Safe area padding for notched phones */}
        <style>{`
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slide-up 0.2s ease-out;
          }
        `}</style>
      </div>
    </>
  );
}
