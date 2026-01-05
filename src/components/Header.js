import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, LogOut, UserCircle } from 'lucide-react';
import Avatar from './Avatar';
import TaskNotificationDropdown from './TaskNotificationDropdown';
import { fetchOverdueTasks, fetchTasksDueToday, getPendingRoleRequests } from '../services/api';
import { useAuth } from './auth/AuthProvider';

export default function Header({ 
  viewTitle, 
  searchTerm, 
  setSearchTerm, 
  searchPlaceholder = "Search by name...",
  showSearch = true,
  showBell = true,
  onOpenPersonNotes
}) {
  const { profile, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const bellButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    // Only load if profile is available
    if (profile?.id) {
      loadNotificationCount();
    }
    
    const interval = setInterval(() => {
      if (profile?.id) {
        loadNotificationCount();
      }
    }, 60000); // Refresh every 60 seconds
    
    // Listen for task updates
    const handleTaskUpdate = () => {
      if (profile?.id) {
        loadNotificationCount();
      }
    };
    window.addEventListener('taskUpdated', handleTaskUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
    };
  }, [profile?.id]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && profileButtonRef.current && !profileButtonRef.current.contains(e.target) && !e.target.closest('.profile-dropdown-portal')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Update profile menu position
  useEffect(() => {
    if (showProfileMenu && profileButtonRef.current) {
      const updatePosition = () => {
        const rect = profileButtonRef.current.getBoundingClientRect();
        setProfileMenuPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        });
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showProfileMenu]);

  const loadNotificationCount = async () => {
    if (!profile?.id) return;
    
    const promises = [
      fetchOverdueTasks(),
      fetchTasksDueToday()
    ];
    
    // Add role requests for admin
    if (profile.role === 'admin') {
      promises.push(getPendingRoleRequests());
    }
    
    const results = await Promise.all(promises);
    const [overdue, today, roleRequests] = results;
    
    // Filter to only show tasks assigned to current user
    const myOverdue = overdue.filter(task => task.assigned_to_user === profile.id);
    const myToday = today.filter(task => task.assigned_to_user === profile.id);
    
    const roleRequestCount = (profile.role === 'admin' && roleRequests) ? roleRequests.length : 0;
    setNotificationCount(myOverdue.length + myToday.length + roleRequestCount);
  };

  const handleTaskClick = (personId) => {
    setShowNotifications(false);
    if (onOpenPersonNotes) {
      onOpenPersonNotes(personId);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'committee': return 'text-blue-600';
      case 'viewer': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'committee': return 'Committee';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-[#f9fafa] border-b border-gray-200 shadow-sm">
      <div className="px-6 py-1">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4 min-w-0">
            <img 
              src="/church-logo.svg" 
              alt="FFSC Logo" 
              className="w-10 h-10 object-contain flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const event = new CustomEvent('navigate-to-home');
                window.dispatchEvent(event);
              }}
            />
            <div className="min-w-0 flex items-center gap-4">
              <div>
                <h1 
                  style={{ fontFamily: 'Moderniz, sans-serif' }} 
                  className="text-sm text-[#001740] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-home');
                    window.dispatchEvent(event);
                  }}
                >
                  FFSC20
                </h1>
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
            {showBell && (
            <div className="relative">
              <button
                ref={bellButtonRef}
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
                buttonRef={bellButtonRef}
              />
            </div>
            )}

            {/* User Profile Section */}
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-[#001740]">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className={`text-xs ${getRoleColor(profile?.role)}`}>
                    {getRoleDisplayName(profile?.role)}
                  </p>
                </div>
                <Avatar 
                  src={profile?.avatar_url} 
                  name={profile?.full_name}
                  size="md"
                />
              </button>

              {/* Profile Dropdown Menu - Using Portal */}
              {showProfileMenu && createPortal(
                <div 
                  className="profile-dropdown-portal fixed w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]"
                  style={{
                    top: `${profileMenuPosition.top}px`,
                    right: `${profileMenuPosition.right}px`
                  }}
                >
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        profile?.role === 'admin' ? 'bg-red-100 text-red-800' :
                        profile?.role === 'committee' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getRoleDisplayName(profile?.role)}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate-to-profile'));
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                    >
                      <UserCircle size={16} />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}