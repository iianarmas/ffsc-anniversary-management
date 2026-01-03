import React from 'react';
import { UserPlus, CheckSquare, BarChart3, ShoppingBag, ListTodo } from 'lucide-react';

export default function QuickActionsWidget({ userRole, setCurrentView }) {
  const canRegister = userRole === 'admin' || userRole === 'volunteer';
  const canManageShirts = userRole === 'admin' || userRole === 'volunteer';
  const canViewTasks = userRole === 'admin' || userRole === 'volunteer';

  const actions = [
    {
      icon: UserPlus,
      label: 'Register',
      view: 'registration',
      color: 'bg-blue-500 hover:bg-blue-600',
      enabled: canRegister
    },
    {
      icon: ShoppingBag,
      label: 'Shirts',
      view: 'shirts',
      color: 'bg-purple-500 hover:bg-purple-600',
      enabled: canManageShirts
    },
    {
      icon: ListTodo,
      label: 'Tasks',
      view: 'tasks',
      color: 'bg-green-500 hover:bg-green-600',
      enabled: canViewTasks
    },
    {
      icon: BarChart3,
      label: 'Dashboard',
      view: 'dashboard',
      color: 'bg-orange-500 hover:bg-orange-600',
      enabled: true // Everyone can view dashboard
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-full">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <CheckSquare size={18} className="text-blue-600" />
        Quick Actions
      </h3>
      
      <div className="space-y-3">
        {actions.filter(action => action.enabled).map((action) => (
          <button
            key={action.view}
            onClick={() => {
              setCurrentView(action.view);
              sessionStorage.setItem('currentView', action.view);
              localStorage.setItem('currentView', action.view);
            }}
                        className={`w-full ${action.color} text-white p-4 rounded-lg transition flex items-center gap-3 shadow-sm`}
          >
            <action.icon size={24} />
            <span className="font-medium text-lg">{action.label}</span>
          </button>
        ))}
      </div>

      {!canViewTasks && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            💡 Contact admin for additional permissions
          </p>
        </div>
      )}
    </div>
  );
}