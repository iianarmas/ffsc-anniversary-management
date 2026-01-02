import React from 'react';
import { AlertCircle, Bell, Info } from 'lucide-react';

export default function NotificationsWidget({ taskStats, capacity }) {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      icon: AlertCircle,
      message: `${taskStats?.overdue || 0} overdue tasks`,
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      id: 2,
      type: 'info',
      icon: Bell,
      message: `${taskStats?.dueToday || 0} tasks due today`,
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      id: 3,
      type: 'info',
      icon: Info,
      message: `${capacity.max - capacity.current} slots remaining (${capacity.current}/${capacity.max})`,
      color: capacity.current >= 200 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-blue-600 bg-blue-50 border-blue-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-full">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <Bell size={18} className="text-blue-600" />
        Notifications
      </h3>
      
      <div className="space-y-3">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${notification.color} flex items-start gap-3`}
          >
            <notification.icon size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}