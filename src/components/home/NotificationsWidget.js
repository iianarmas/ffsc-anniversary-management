import React from 'react';
import { AlertCircle, Bell, Info, CheckCircle2 } from 'lucide-react';

export default function NotificationsWidget({ taskStats, capacity }) {
  const notifications = [
    {
      id: 1,
      icon: AlertCircle,
      count: taskStats?.overdue || 0,
      label: 'Overdue Tasks',
      show: (taskStats?.overdue || 0) > 0,
      bgColor: 'bg-red-600',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    {
      id: 2,
      icon: Bell,
      count: taskStats?.dueToday || 0,
      label: 'Due Today',
      show: (taskStats?.dueToday || 0) > 0,
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    {
      id: 3,
      icon: Info,
      count: capacity.max - capacity.current,
      label: 'Slots Remaining',
      show: true,
      bgColor: 'bg-sky-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    }
  ];

  const activeNotifications = notifications.filter(n => n.show);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#001740]">Alerts</h3>
        {activeNotifications.length > 0 && (
          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
            {activeNotifications.length}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {activeNotifications.length > 0 ? (
          activeNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg ${notification.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <notification.icon size={16} className={notification.iconColor} />
                <span className={`text-xs font-semibold ${notification.textColor}`}>
                  {notification.label}
                </span>
              </div>
              <div className={`text-2xl font-bold ${notification.textColor}`}>
                {notification.count}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500">All clear!</p>
          </div>
        )}
      </div>
    </div>
  );
}