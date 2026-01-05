import React from 'react';
import { UserPlus, BarChart3, ShoppingBag, ListTodo } from 'lucide-react';

export default function QuickActionsWidget({ userRole, setCurrentView }) {
  // Show restricted message for viewers
  if (userRole === 'viewer') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-[#001740] mb-4">Quick Actions</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Access Restricted</h4>
          <p className="text-xs text-gray-600 mb-4">
            Quick actions are only available to Committee members and Administrators.
          </p>
          <p className="text-xs text-blue-700 font-medium">
            Contact your administrator to request elevated permissions.
          </p>
        </div>
      </div>
    );
  }

  const canRegister = userRole === 'admin' || userRole === 'committee' || userRole === 'volunteer';
  const canManageShirts = userRole === 'admin' || userRole === 'committee' || userRole === 'volunteer';
  const canViewTasks = userRole === 'admin' || userRole === 'committee' || userRole === 'volunteer';

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