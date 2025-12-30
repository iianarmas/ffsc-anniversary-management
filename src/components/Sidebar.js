import React, { useState } from 'react';
import { Users, Shirt, Menu, X, BarChart3, ChevronRight } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, isCollapsed, setIsCollapsed }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'registration', label: 'Registration', icon: Users },
    { id: 'shirts', label: 'Shirt Management', icon: Shirt },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#001740] text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#edf1fa] text-white transform transition-all duration-300 ease-in-out z-20 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-64'}`}
      >

          
          {/* Collapse Button - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block absolute -right-3 top-8 bg-[#f4d642] text-[#001740] rounded-full p-1 shadow-lg hover:bg-[#f4c400] transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronRight size={16} className="rotate-180" />}
          </button>
        

        {/* Navigation */}
        <nav className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 rounded-lg mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#e2e8f8] text-[#0f204e]'
                    : 'text-gray-500 hover:bg-[#e2e8f8]'
                } ${isCollapsed ? 'justify-center px-1 py-3' : 'px-4 py-3'}`}
              >
                <Icon size={18} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-xs text-gray-400 text-center">
              © 2026 FFSC
            </div>
          </div>
        )}
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