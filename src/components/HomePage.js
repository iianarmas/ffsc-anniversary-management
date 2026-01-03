import React, { useState, useEffect } from 'react';
import { CheckSquare, Users, Clock, ShoppingBag } from 'lucide-react';
import Header from './Header';
import HeroSection from './home/HeroSection';
import MyTasksWidget from './home/MyTasksWidget';
import QuickActionsWidget from './home/QuickActionsWidget';
import CalendarWidget from './home/CalendarWidget';
import RecentActivityWidget from './home/RecentActivityWidget';
import NotificationsWidget from './home/NotificationsWidget';
import { getMyStats } from '../services/api';

export default function HomePage({ 
  stats, 
  taskStats, 
  profile,
  setCurrentView 
}) {
  const [myStats, setMyStats] = useState({
    myTasks: 0,
    registeredToday: 0,
    overdueTasks: 0,
    dueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadMyStats();
  }, [profile?.id]);

  // Realtime updates - reload stats when tasks/registrations change
  useEffect(() => {
    const handleUpdate = () => {
      loadMyStats();
    };
    
    window.addEventListener('taskUpdated', handleUpdate);
    window.addEventListener('registrationUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('taskUpdated', handleUpdate);
      window.removeEventListener('registrationUpdated', handleUpdate);
    };
  }, [profile?.id]);

  const loadMyStats = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await getMyStats(profile.id);
      setMyStats(data);
    } catch (error) {
      console.error('Error loading my stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isMobile && (
        <Header 
          viewTitle="Home" 
          showSearch={false}
          onOpenPersonNotes={(personId) => {
            console.log('Open notes for person:', personId);
          }}
        />
      )}
      
      <div className={`bg-[#f9fafa] min-h-screen ${isMobile ? 'pb-20' : 'flex'}`}>
        {/* MAIN CONTENT AREA - LEFT SIDE */}
        <div className={`flex-1 ${isMobile ? 'p-0' : 'p-6 pr-0'}`}>
          {/* Mobile Header with Branding */}
          {isMobile && (
            <div className="sticky top-0 bg-white shadow-md z-20 mb-4">
              {/* Logo and Brand Section */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <img 
                  src="/church-logo.svg" 
                  alt="FFSC Logo" 
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <div>
                  <h1 style={{ fontFamily: 'Moderniz, sans-serif' }} className="text-lg font-bold text-[#001740]">
                    FFSC20
                  </h1>
                  <p className="text-xs text-gray-500">Home Dashboard</p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Header */}
          <div className={`mb-6 ${isMobile ? 'px-4' : 'pr-6'}`}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-[#001740]`}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mt-1`}>
              {new Date().toLocaleDateString('en-US', {
                timeZone: 'Asia/Manila',
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })} • {new Date().toLocaleTimeString('en-US', {
                timeZone: 'Asia/Manila',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-3 mb-6 ${isMobile ? 'px-4' : 'pr-6'}`}>
            <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${isMobile ? 'p-3' : 'p-5'} hover:shadow-md transition`}>
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'mb-2' : ''}>
                  <div className={`flex items-center ${isMobile ? 'justify-between mb-1' : 'mb-1'}`}>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>My Tasks</p>
                    {isMobile && (
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <CheckSquare size={20} className="text-blue-600" />
                      </div>
                    )}
                  </div>
                  <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-[#001740]`}>{myStats.myTasks}</p>
                </div>
                {!isMobile && (
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CheckSquare size={24} className="text-blue-600" />
                  </div>
                )}
              </div>
            </div>

            <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${isMobile ? 'p-3' : 'p-5'} hover:shadow-md transition`}>
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'mb-2' : ''}>
                  <div className={`flex items-center ${isMobile ? 'justify-between mb-1' : 'mb-1'}`}>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Registered</p>
                    {isMobile && (
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Users size={20} className="text-green-600" />
                      </div>
                    )}
                  </div>
                  <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-[#001740]`}>{myStats.registeredToday}</p>
                </div>
                {!isMobile && (
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-green-600" />
                  </div>
                )}
              </div>
            </div>

            <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${isMobile ? 'p-3' : 'p-5'} hover:shadow-md transition`}>
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'mb-2' : ''}>
                  <div className={`flex items-center ${isMobile ? 'justify-between mb-1' : 'mb-1'}`}>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Overdue</p>
                    {isMobile && (
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <Clock size={20} className="text-red-600" />
                      </div>
                    )}
                  </div>
                  <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-[#001740]`}>{myStats.overdueTasks}</p>
                </div>
                {!isMobile && (
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <Clock size={24} className="text-red-600" />
                  </div>
                )}
              </div>
            </div>

            <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${isMobile ? 'p-3' : 'p-5'} hover:shadow-md transition`}>
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'mb-2' : ''}>
                  <div className={`flex items-center ${isMobile ? 'justify-between mb-1' : 'mb-1'}`}>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Shirts Given</p>
                    {isMobile && (
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={20} className="text-purple-600" />
                      </div>
                    )}
                  </div>
                  <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-[#001740]`}>{stats?.shirtsGiven || 0}</p>
                </div>
                {!isMobile && (
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <ShoppingBag size={24} className="text-purple-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions - Desktop Only */}
          {!isMobile && (
            <div className="mb-6 pr-6">
              <QuickActionsWidget 
                userRole={profile?.role}
                setCurrentView={setCurrentView}
              />
            </div>
          )}

          {/* Calendar and Alerts - Mobile Only (before My Tasks) */}
          {isMobile && (
            <div className="px-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                {/* Calendar Widget */}
                <CalendarWidget userId={profile?.id} />
                
                {/* Alerts Widget */}
                <NotificationsWidget 
                  taskStats={{
                    overdue: myStats.overdueTasks,
                    dueToday: myStats.dueToday
                  }}
                  capacity={{ current: stats?.registered || 0, max: 230 }}
                />
              </div>
            </div>
          )}

          {/* My Tasks */}
          <div className={`mb-6 ${isMobile ? 'px-4' : 'pr-6'}`}>
            <MyTasksWidget 
              userId={profile?.id}
              onTaskUpdate={loadMyStats}
            />
          </div>

          {/* Recent Activity - Desktop Only */}
          {!isMobile && (
            <div className="pr-6">
              <RecentActivityWidget userId={profile?.id} />
            </div>
          )}
        </div>

        {/* VERTICAL DIVIDER - Desktop Only */}
        {!isMobile && <div className="w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>}

        {/* RIGHT SIDEBAR - FIXED WIDTH - Desktop Only */}
        {!isMobile && (
          <div className="w-80 flex-shrink-0 p-6 space-y-6 overflow-y-auto">
          {/* Calendar Widget */}
          <CalendarWidget userId={profile?.id} />
          
          {/* Alerts Widget */}
          <NotificationsWidget 
            taskStats={{
              overdue: myStats.overdueTasks,
              dueToday: myStats.dueToday
            }}
            capacity={{ current: stats?.registered || 0, max: 230 }}
          />
          </div>
        )}

        {/* Mobile Bottom Widgets */}
        {isMobile && (
          <div className="px-4 mt-6">
            {/* Recent Activity - Full Width */}
            <RecentActivityWidget userId={profile?.id} />
          </div>
        )}
      </div>
    </>
  );
}