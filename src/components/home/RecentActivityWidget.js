import React, { useState, useEffect } from 'react';
import { Activity, UserCheck, FileText, CheckSquare } from 'lucide-react';
import { getMyRecentActivity } from '../../services/api';

export default function RecentActivityWidget({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getMyRecentActivity(userId);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration': return UserCheck;
      case 'task': return CheckSquare;
      default: return Activity;
    }
  };

  const formatActivityTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + (dateString.endsWith('Z') ? '' : 'Z'));
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila',
      month: 'short',
      day: 'numeric'
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
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  activity.type === 'registration' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <Icon size={16} className={
                    activity.type === 'registration' ? 'text-green-600' : 'text-blue-600'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span> {activity.personName}
                  </p>
                  {activity.taskText && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{activity.taskText}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{formatActivityTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Activity size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Start registering people or creating tasks!</p>
          </div>
        )}
      </div>
    </div>
  );
}