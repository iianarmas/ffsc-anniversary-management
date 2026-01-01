import React, { useState, useEffect } from 'react';
import { Search, User, Bell } from 'lucide-react';
import TaskNotificationDropdown from './TaskNotificationDropdown';
import { fetchOverdueTasks, fetchTasksDueToday } from '../services/api';

export default function Header({ 
  viewTitle, 
  searchTerm, 
  setSearchTerm, 
  searchPlaceholder = "Search by name...",
  showSearch = true,
  onOpenPersonNotes
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadNotificationCount();
    const interval = setInterval(loadNotificationCount, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    const [overdue, today] = await Promise.all([
      fetchOverdueTasks(),
      fetchTasksDueToday()
    ]);
    setNotificationCount(overdue.length + today.length);
  };

  const handleTaskClick = (personId) => {
    setShowNotifications(false);
    if (onOpenPersonNotes) {
      onOpenPersonNotes(personId);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-[#f9fafa] border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4 min-w-0">
            <img 
              src="/church-web-logo.svg" 
              alt="FFSC Logo" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0 flex items-center gap-4">
              <div>
                <h1 style={{ fontFamily: 'Moderniz, sans-serif' }} className="text-sm text-[#001740]">FFSC20</h1>
              </div>

              {/* Move search next to the title on larger screens */}
              {showSearch && searchTerm !== undefined && setSearchTerm && (
                <div className="hidden md:block ml-4 w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f4d642] focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Bell Icon + User Info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Bell Icon with Notification Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition relative"
                aria-label="Task notifications"
              >
                <Bell size={20} className="text-gray-700" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              
              <TaskNotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onTaskClick={handleTaskClick}
              />
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-[#001740]">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#001740] to-[#0f2a71] flex items-center justify-center">
              <User size={20} className="text-[#f4d642]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}