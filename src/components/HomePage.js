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
      <Header 
        viewTitle="Home" 
        showSearch={false}
        onOpenPersonNotes={(personId) => {
          console.log('Open notes for person:', personId);
        }}
      />
      
      <div className="flex bg-[#f9fafa] min-h-screen">
        {/* MAIN CONTENT AREA - LEFT SIDE */}
        <div className="flex-1 p-6 pr-0">
          {/* Welcome Header */}
          <div className="mb-6 pr-6">
            <h1 className="text-3xl font-bold text-[#001740]">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-sm text-gray-600 mt-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pr-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Tasks</p>
                  <p className="text-3xl font-bold text-[#001740]">{myStats.myTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CheckSquare size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Registered Today</p>
                  <p className="text-3xl font-bold text-[#001740]">{myStats.registeredToday}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-[#001740]">{myStats.overdueTasks}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Shirts Given</p>
                  <p className="text-3xl font-bold text-[#001740]">{stats?.shirtsGiven || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 pr-6">
            <QuickActionsWidget 
              userRole={profile?.role}
              setCurrentView={setCurrentView}
            />
          </div>

          {/* My Tasks */}
          <div className="mb-6 pr-6">
            <MyTasksWidget 
              userId={profile?.id}
              onTaskUpdate={loadMyStats}
            />
          </div>

          {/* Recent Activity */}
          <div className="pr-6">
            <RecentActivityWidget userId={profile?.id} />
          </div>
        </div>

        {/* VERTICAL DIVIDER */}
        <div className="w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

        {/* RIGHT SIDEBAR - FIXED WIDTH */}
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
      </div>
    </>
  );
}