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
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const StatCard = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600'
    };

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
            <Icon size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-sm text-blue-100">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-[#0f2a71] to-[#001740] text-white p-8 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.full_name || 'User'}!
        </h1>
        <p className="text-blue-200">{phTime} (Philippine Time)</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={CheckSquare}
          value={stats.myTasks}
          label="My Tasks"
          color="yellow"
        />
        <StatCard 
          icon={Users}
          value={stats.registeredToday}
          label="Registered Today"
          color="green"
        />
        <StatCard 
          icon={Clock}
          value={stats.pendingTasks}
          label="Overdue Tasks"
          color="red"
        />
        <StatCard 
          icon={ShoppingBag}
          value={stats.shirtsGiven}
          label="Shirts Given"
          color="blue"
        />
      </div>
    </div>
  );
}