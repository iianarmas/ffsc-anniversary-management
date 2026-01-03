import React from 'react';
import { UserPlus, BarChart3, ShoppingBag, ListTodo } from 'lucide-react';

export default function QuickActionsWidget({ userRole, setCurrentView }) {
  const canRegister = userRole === 'admin' || userRole === 'volunteer';
  const canManageShirts = userRole === 'admin' || userRole === 'volunteer';
  const canViewTasks = userRole === 'admin' || userRole === 'volunteer';

  const actions = [
    {
      icon: UserPlus,
      label: 'Registration',
      view: 'registration',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      enabled: canRegister
    },
    {
      icon: ShoppingBag,
      label: 'Shirts',
      view: 'shirts',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      enabled: canManageShirts
    },
    {
      icon: ListTodo,
      label: 'Tasks',
      view: 'tasks',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      enabled: canViewTasks
    },
    {
      icon: BarChart3,
      label: 'Dashboard',
      view: 'dashboard',
      bgColor: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700',
      enabled: true
    }
  ];

  const enabledActions = actions.filter(action => action.enabled);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <h3 className="text-base font-semibold text-[#001740] mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {enabledActions.map((action) => (
          <button
            key={action.view}
            onClick={() => {
              setCurrentView(action.view);
              sessionStorage.setItem('currentView', action.view);
              localStorage.setItem('currentView', action.view);
            }}
            className={`${action.bgColor} ${action.hoverColor} text-white p-4 rounded-lg transition flex flex-col items-center justify-center gap-2 shadow-sm h-24`}
          >
            <action.icon size={24} />
            <span className="font-medium text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}