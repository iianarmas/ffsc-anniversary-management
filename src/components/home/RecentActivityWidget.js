import React, { useState, useEffect } from 'react';
import { Activity, UserCheck, FileText } from 'lucide-react';

export default function RecentActivityWidget({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder - will implement in Phase 5
    setLoading(false);
    // Mock data for UI
    setActivities([
      {
        id: 1,
        type: 'registration',
        message: 'Registered Jane Smith',
        time: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        type: 'task',
        message: 'Created task for John Doe',
        time: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 3,
        type: 'registration',
        message: 'Registered Bob Lee',
        time: new Date(Date.now() - 10800000).toISOString()
      }
    ]);
  }, [userId]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration': return UserCheck;
      case 'task': return FileText;
      default: return Activity;
    }
  };

  const formatActivityTime = (dateString) => {
    const date = new Date(dateString + (dateString.endsWith('Z') ? '' : 'Z'));
    return date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-full">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <Activity size={18} className="text-blue-600" />
        Recent Activity
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map(activity => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
              >
                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                  <Icon size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{formatActivityTime(activity.time)}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Activity size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}