import React from 'react';
import { CheckSquare, Users, Clock, ShoppingBag } from 'lucide-react';

export default function HeroSection({ user, stats }) {
  // Get current Philippine time
  const now = new Date();
  const phTime = now.toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const time = now.toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Get greeting based on time
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const StatCard = ({ icon: Icon, value, label, color, bgColor }) => {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-xl ${bgColor}`}>
            <Icon size={24} className={color} strokeWidth={2} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 font-medium">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">{phTime}</p>
            <h1 className="text-3xl font-bold text-white mb-1">
              {greeting}, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-blue-100 text-sm">
              {time} • {user?.role === 'admin' ? 'Administrator' : user?.role === 'moderator' ? 'Moderator' : 'User'}
            </p>
          </div>
          
          {/* Optional: User avatar section */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white text-xl font-bold backdrop-blur-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={CheckSquare}
            value={stats.myTasks}
            label="My Tasks"
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <StatCard 
            icon={Users}
            value={stats.registeredToday}
            label="Registered Today"
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard 
            icon={Clock}
            value={stats.pendingTasks}
            label="Overdue Tasks"
            color="text-rose-600"
            bgColor="bg-rose-50"
          />
          <StatCard 
            icon={ShoppingBag}
            value={stats.shirtsGiven}
            label="Shirts Distributed"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
        </div>
      </div>
    </div>
  );
}