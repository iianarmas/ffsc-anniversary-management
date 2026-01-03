import React from 'react';
import { Home, Users, ShoppingBag, CheckSquare, UserCircle, Shield } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';


export default function MobileBottomNav({ currentView, setCurrentView, taskCount = 0, roleRequestCount = 0 }) {
  const { profile } = useAuth();
  const baseNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'registration', icon: Users, label: 'Registration' },
    { id: 'shirts', icon: ShoppingBag, label: 'Shirts' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks', badge: taskCount },
    { id: 'profile', icon: UserCircle, label: 'Profile' }
  ];

  // Add Users tab for admin with badge
  const navItems = profile?.role === 'admin' 
    ? [
        ...baseNavItems.slice(0, 4),
        { id: 'users', icon: Shield, label: 'Users', badge: roleRequestCount },
        baseNavItems[4]
      ]
    : baseNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-30">
      <div className="flex items-center justify-around px-2 py-2">
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
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 min-w-[60px] relative ${
                isActive
                  ? 'bg-[#001740] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              style={{ minHeight: '56px' }}
            >
              <Icon size={22} strokeWidth={2} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
              
              {/* Badge for Tasks */}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
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