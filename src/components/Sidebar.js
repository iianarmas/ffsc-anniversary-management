import React, { useState } from 'react';
import { Users, Shirt, Menu, X, BarChart3, ChevronRight, Plus, CheckSquare, Shield, Home } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, onAddPersonClick, taskStats, userProfile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, showDividerAfter: true },
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
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#edf1fa] text-white transform transition-all duration-300 ease-in-out z-40 ${
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
                <div className="relative">
                  <button
                    onClick={() => {
                      setCurrentView(item.id);
                      sessionStorage.setItem('currentView', item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center justify-center rounded-lg mb-2 transition-all duration-200 px-1 py-3 relative ${
                      isActive
                        ? 'bg-[#e2e8f8] text-[#0f204e]'
                        : 'text-gray-500 hover:bg-[#e2e8f8]'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                  
                  {/* Modern Tooltip */}
                  {hoveredItem === item.id && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                      <div className="bg-[#001740] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg animate-slide-in">
                        {item.label}
                        {/* Tooltip arrow */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2">
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-[#001740] border-b-4 border-b-transparent"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {item.showDividerAfter && (
                  <div className="border-b border-dashed border-gray-300 mx-2 my-2" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Add Person Button */}
        <div className="absolute bottom-4 w-full px-2">
          <div className="relative">
            <button
              onClick={() => {
                onAddPersonClick();
              }}
              onMouseEnter={() => setHoveredItem('add-person')}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center justify-center rounded-lg mb-2 transition-all duration-200 px-1 py-3 text-gray-500 hover:bg-[#e2e8f8]"
            >
              <Plus size={18} />
            </button>
            
            {/* Modern Tooltip */}
            {hoveredItem === 'add-person' && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-[#001740] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg animate-slide-in">
                  Add Person
                  {/* Tooltip arrow */}
                  <div className="absolute right-full top-1/2 -translate-y-1/2">
                    <div className="w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-[#001740] border-b-4 border-b-transparent"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-35"
        />
      )}
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.15s ease-out;
        }
      `}</style>
    </>
  );
}