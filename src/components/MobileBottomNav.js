import React from 'react';
import {
  Home,
  Users,
  ShoppingBag,
  CheckSquare,
  UserCircle,
  Shield,
  DollarSign,
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

  // Base navigation items - Tasks is hidden for viewers
  const baseNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'registration', icon: Users, label: 'Registration' },
    { id: 'shirts', icon: ShoppingBag, label: 'Shirts' },
    ...(!isViewer ? [{ id: 'tasks', icon: CheckSquare, label: 'Tasks', badge: taskCount }] : []),
    { id: 'profile', icon: UserCircle, label: 'Profile' }
  ];

  // Build navigation items based on role
  let navItems = [...baseNavItems];

  // Add Collections for committee and admin (after shirts, before tasks)
  if (profile?.role === 'committee' || profile?.role === 'admin') {
    navItems = [
      ...navItems.slice(0, 3), // home, registration, shirts
      { id: 'collections', icon: DollarSign, label: 'Collections' },
      ...navItems.slice(3), // tasks, profile
    ];
  }

  // Add Users tab for admin (before profile)
  if (profile?.role === 'admin') {
    navItems = [
      ...navItems.slice(0, -1), // all except profile
      { id: 'users', icon: Shield, label: 'Users', badge: roleRequestCount },
      navItems[navItems.length - 1], // profile at the end
    ];
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom z-mobile-nav shadow-[0_-4px_16px_rgba(15,42,113,0.08)]">
      <div className="flex items-center justify-between px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                localStorage.setItem('currentView', item.id);
              }}
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
            </button>
          );
        })}
      </div>

      {/* Safe area padding for notched phones */}
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}