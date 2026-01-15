import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Users, Shirt, Menu, X, BarChart3, Plus, CheckSquare, Shield, Home, DollarSign, Settings, Lock, Wallet } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, onAddPersonClick, taskStats, userProfile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [showRestrictedMessage, setShowRestrictedMessage] = useState(false);
  const buttonRefs = useRef({});

  const isAdmin = userProfile?.role === 'admin';
  const isCommitteeOrAdmin = userProfile?.role === 'committee' || userProfile?.role === 'admin';
  const isViewer = userProfile?.role === 'viewer';

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    // Show collections to admin, committee, and viewer (viewer gets restricted access)
    { id: 'collections', label: 'Payment Collections', icon: DollarSign, restricted: isViewer },
    // Finance - only visible to admin and committee (hidden from viewer)
    ...(isCommitteeOrAdmin ? [{ id: 'finance', label: 'Finance', icon: Wallet, showDividerAfter: true }] : []),
    { id: 'registration', label: 'Registration', icon: Users },
    { id: 'shirts', label: 'Shirt Management', icon: Shirt },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: taskStats?.incomplete || 0, restricted: isViewer },
    // Manage Users - admin only
    ...(isAdmin ? [{ id: 'users', label: 'Manage Users', icon: Shield }] : []),
    // Add Person - not for viewers
    ...(!isViewer ? [{ id: 'add-person', label: 'Add Person', icon: Plus, isAction: true }] : []),
  ].filter(item => item.id || item.showDividerAfter); // Filter out empty objects

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-sidebar bg-[#001740] text-white p-3 rounded-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Always Collapsed on Desktop */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#edf1fa] text-white transform transition-all duration-300 ease-in-out z-sidebar ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-16`}
      >
        {/* Navigation */}
        <nav className="p-2">
          {menuItems.map((item, idx) => {
            // If this is just a divider item, render only the divider
            if (!item.id) {
              return (
                <React.Fragment key={`divider-${idx}`}>
                  {item.showDividerAfter && (
                    <div className="border-b border-dashed border-gray-300 mx-2 my-2" />
                  )}
                </React.Fragment>
              );
            }

            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <React.Fragment key={item.id}>
                <div className="relative">
                  <button
                    ref={el => buttonRefs.current[item.id] = el}
                    onClick={() => {
                      if (item.restricted) {
                        setShowRestrictedMessage(true);
                        setTimeout(() => setShowRestrictedMessage(false), 3000);
                        return;
                      }
                      if (item.isAction && item.id === 'add-person') {
                        onAddPersonClick();
                        setIsMobileMenuOpen(false);
                      } else {
                        setCurrentView(item.id);
                        sessionStorage.setItem('currentView', item.id);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    onMouseEnter={() => {
                      setHoveredItem(item.id);
                      if (buttonRefs.current[item.id]) {
                        const rect = buttonRefs.current[item.id].getBoundingClientRect();
                        setTooltipPosition({
                          top: rect.top + rect.height / 2,
                          left: rect.right + 8
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredItem(null);
                      setTooltipPosition(null);
                    }}
                    className={`w-full flex items-center justify-center rounded-lg mb-2 transition-all duration-200 px-1 py-3 relative ${
                      isActive
                        ? 'bg-[#e2e8f8] text-[#0f204e]'
                        : item.restricted
                          ? 'text-gray-400 hover:bg-[#e2e8f8]'
                          : 'text-gray-500 hover:bg-[#e2e8f8]'
                    }`}
                  >
                    <Icon size={18} />
                    {/* Badge for task count */}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {/* Lock icon for restricted items */}
                    {item.restricted && (
                      <Lock size={10} className="absolute bottom-1 right-1 text-gray-400" />
                    )}
                  </button>

                  {/* Modern Tooltip - Using Portal */}
                  {hoveredItem === item.id && tooltipPosition && createPortal(
                    <div
                      className="fixed pointer-events-none"
                      style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        transform: 'translateY(-50%)',
                        zIndex: 99999
                      }}
                    >
                      <div className="bg-[#001740] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                        {item.label}
                        {item.restricted && <span className="block text-xs text-gray-300 mt-0.5">Access Restricted</span>}
                        {/* Tooltip arrow */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2">
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-[#001740] border-b-4 border-b-transparent"></div>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
                {item.showDividerAfter && (
                  <div className="border-b border-dashed border-gray-300 mx-2 my-2" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* System Settings Button - Admin Only */}
        {userProfile?.role === 'admin' && (
          <div className="absolute bottom-4 w-full px-2">
            <div className="relative">
              <button
                onClick={() => {
                  setCurrentView('system-settings');
                  sessionStorage.setItem('currentView', 'system-settings');
                  setIsMobileMenuOpen(false);
                }}
                onMouseEnter={() => setHoveredItem('system-settings-bottom')}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center justify-center rounded-lg mb-2 transition-all duration-200 px-1 py-3 ${
                  currentView === 'system-settings'
                    ? 'bg-[#e2e8f8] text-[#0f204e]'
                    : 'text-gray-500 hover:bg-[#e2e8f8]'
                }`}
              >
                <Settings size={18} />
              </button>

              {/* Modern Tooltip */}
              {hoveredItem === 'system-settings-bottom' && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                  <div className="bg-[#001740] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg animate-slide-in">
                    System Settings
                    {/* Tooltip arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-[#001740] border-b-4 border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-35"
        />
      )}

      {/* Restricted Access Toast */}
      {showRestrictedMessage && createPortal(
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] animate-fade-in">
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Lock size={16} />
            <span className="font-medium">Access Restricted</span>
            <span className="text-red-200">—</span>
            <span className="text-sm text-red-100">Contact admin for access</span>
          </div>
        </div>,
        document.body
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
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}