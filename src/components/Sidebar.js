import React, { useState } from 'react';
import { Users, Shirt, Menu, X, BarChart3, ChevronRight } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, isCollapsed, setIsCollapsed }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
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
        className={`fixed left-0 top-0 h-full bg-[#001740] text-white transform transition-all duration-300 ease-in-out z-40 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-[#0f2a71] relative">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <img 
                src="/ffsc_logo.png" 
                alt="FFSC Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-[#f4d642]">FFSC Anniversary</h1>
                <p className="text-gray-400 text-sm mt-1">Management System</p>
              </div>
            </div>
          ) : (
            <img 
              src="/ffsc_logo.png" 
              alt="FFSC Logo" 
              className="w-10 h-10 object-contain mx-auto"
            />
          )}
          
          {/* Collapse Button - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block absolute -right-3 top-8 bg-[#f4d642] text-[#001740] rounded-full p-1 shadow-lg hover:bg-[#f4c400] transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronRight size={16} className="rotate-180" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#f4d642] text-[#001740] font-semibold shadow-lg'
                    : 'text-gray-300 hover:bg-[#0f2a71] hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#0f2a71]">
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