import React, { useState } from 'react';
import { Users, Shirt, Menu, X, BarChart3, ChevronRight, Plus, CheckSquare, Shield } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, onAddPersonClick, taskStats, userProfile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'registration', label: 'Registration', icon: Users },
    { id: 'shirts', label: 'Shirt Management', icon: Shirt },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: taskStats?.incomplete || 0 },
    ...(userProfile?.role === 'admin' ? [{ id: 'users', label: 'Manage Users', icon: Shield }] : []),
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#001740] text-white p-3 rounded-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Always Collapsed on Desktop */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#edf1fa] text-white transform transition-all duration-300 ease-in-out z-20 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-16`}
      >
        {/* Navigation */}
        <nav className="p-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  title={item.label}
                  className={`w-full flex items-center justify-center rounded-lg mb-2 transition-all duration-200 px-1 py-3 relative ${
                    isActive
                      ? 'bg-[#e2e8f8] text-[#0f204e]'
                      : 'text-gray-500 hover:bg-[#e2e8f8]'
                  }`}
                >
                  <Icon size={18} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
                {idx === 0 && (
                  <div className="border-b border-dashed border-gray-300 mx-2 my-2" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Add Person Button */}
        <div className="absolute bottom-4 w-full px-2">
          <button
            onClick={onAddPersonClick}
            title="Add Person"
            className="w-full flex items-center justify-center rounded-lg mb-2 transition-all duration-200 px-1 py-3 text-gray-500 hover:bg-[#e2e8f8]"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
}