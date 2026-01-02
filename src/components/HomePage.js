import React, { useState, useEffect } from 'react';
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
      
      <div className="p-6 bg-[#f9fafa] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with Stats */}
          <HeroSection 
            user={profile} 
            stats={{
              myTasks: myStats.myTasks,
              registeredToday: myStats.registeredToday,
              pendingTasks: myStats.overdueTasks,
              shirtsGiven: stats?.shirtsGiven || 0
            }}
          />

          {/* Main Content Grid - 4 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            {/* My Tasks Widget - 2 columns */}
            <div className="lg:col-span-2">
              <MyTasksWidget 
                userId={profile?.id}
                onTaskUpdate={loadMyStats}
              />
            </div>

            {/* Quick Actions Widget - 1 column */}
            <div className="lg:col-span-1">
              <QuickActionsWidget 
                userRole={profile?.role}
                setCurrentView={setCurrentView}
              />
            </div>

            {/* Calendar Widget - 1 column */}
            <div className="lg:col-span-1">
              <CalendarWidget userId={profile?.id} />
            </div>
          </div>

          {/* Bottom Row - Notifications and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Notifications Widget */}
            <div className="lg:col-span-1">
              <NotificationsWidget 
                taskStats={{
                  overdue: myStats.overdueTasks,
                  dueToday: myStats.dueToday
                }}
                capacity={{ current: stats?.registered || 0, max: 230 }}
              />
            </div>

            {/* Recent Activity Widget */}
            <div className="lg:col-span-2">
              <RecentActivityWidget userId={profile?.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}