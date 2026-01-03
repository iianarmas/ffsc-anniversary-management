import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckSquare, AlertTriangle, Shield } from 'lucide-react';
import { fetchOverdueTasks, fetchTasksDueToday, toggleTaskComplete, getPendingRoleRequests } from '../services/api';
import { useAuth } from './auth/AuthProvider';

export default function TaskNotificationDropdown({ isOpen, onClose, onTaskClick, buttonRef }) {
  const { profile } = useAuth();
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && profile?.id) {
      loadTasks();
      const interval = setInterval(loadTasks, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, profile?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const updatePosition = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8, // 8px gap below button
          right: window.innerWidth - rect.right // Align right edge with button
        });
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, buttonRef]);

  const loadTasks = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    
    // Load role requests if user is admin
    const promises = [
      fetchOverdueTasks(),
      fetchTasksDueToday()
    ];
    
    if (profile.role === 'admin') {
      promises.push(getPendingRoleRequests());
    }
    
    const results = await Promise.all(promises);
    const [overdue, today, requests] = results;
    
    // Filter to only show tasks assigned to current user
    const myOverdue = overdue.filter(task => task.assigned_to_user === profile.id);
    const myToday = today.filter(task => task.assigned_to_user === profile.id);
    
    console.log('My overdue tasks:', myOverdue);
    console.log('My today tasks:', myToday);
    setOverdueTasks(myOverdue);
    setTodayTasks(myToday);
    
    // Set role requests if admin
    if (profile.role === 'admin' && requests) {
      setRoleRequests(requests);
    }
    setLoading(false);
    
    // Notify parent that tasks were loaded
    const roleRequestCount = (profile.role === 'admin' && requests) ? requests.length : 0;
    window.dispatchEvent(new CustomEvent('tasksLoaded', { 
      detail: { 
        overdueCount: myOverdue.length, 
        todayCount: myToday.length,
        roleRequestCount 
      }
    }));
  };

  const handleToggleComplete = async (taskId, currentStatus, e) => {
    e.stopPropagation();
    await toggleTaskComplete(taskId, currentStatus);
    await loadTasks();
    
    // Trigger parent to reload notification count
    window.dispatchEvent(new Event('taskUpdated'));
  };

  const getDaysOverdue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = now - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':return 'text-red-600';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <span className={`h-2 w-2 bg-red-500 rounded-full inline-block`} />;
      case 'medium':
        return <span className={`h-2 w-2 bg-orange-500 rounded-full inline-block`} />;
      case 'low':
        return <span className={`h-2 w-2 bg-green-500 rounded-full inline-block`} />;
      default: return <span className={`h-2 w-2 bg-gray-200 rounded-full inline-block`} />;
    }
  };

  if (!isOpen) return null;

  const totalCount = overdueTasks.length + todayTasks.length + (profile.role === 'admin' ? roleRequests.length : 0);

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] flex flex-col"
      style={{ 
        maxHeight: 'min(32rem, calc(100vh - 80px))',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-[#0f2a71]" />
          <h3 className="font-semibold text-[#0f2a71]">Task Reminders</h3>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition"
          aria-label="Close"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
          </div>
       ) : totalCount === 0 ? (
          <div className="text-center py-8 px-4">
            <CheckSquare size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No tasks due today or overdue</p>
          </div>
        ) : (
          <>
            {/* Role Change Requests (Admin Only) - FIRST */}
            {profile.role === 'admin' && roleRequests.length > 0 && (
              <div className="bg-blue-50 border-b border-blue-100">
                <div className="px-4 py-2 flex items-center gap-2 bg-blue-100">
                  <Shield size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-blue-900 text-sm">
                    Role Change Requests ({roleRequests.length})
                  </h4>
                </div>
                <div className="divide-y divide-blue-100">
                  {roleRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => {
                        onClose();
                        window.dispatchEvent(new CustomEvent('navigate-to-users'));
                      }}
                      className="px-4 py-3 hover:bg-blue-100 cursor-pointer transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {request.profiles?.full_name || 'Unknown User'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span>Viewer → Committee</span>
                            <span>•</span>
                            <span className="text-blue-700 font-medium">
                              Requested {new Date(request.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Overdue Tasks - SECOND */}
            {overdueTasks.length > 0 && (
              <div className="bg-red-50 border-b border-red-100">
                <div className="px-4 py-2 flex items-center gap-2 bg-red-100">
                  <AlertTriangle size={16} className="text-red-600" />
                  <h4 className="font-semibold text-red-900 text-sm">
                    Overdue ({overdueTasks.length})
                  </h4>
                </div>
                <div className="divide-y divide-red-100">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task.personId, task.person_id)}
                      className="px-4 py-3 hover:bg-red-100 cursor-pointer transition"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={(e) => handleToggleComplete(task.id, task.status, e)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0f2a71] focus:ring-[#0f2a71] cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.note_text}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span className="font-medium">{task.person_first_name} {task.person_last_name}</span>
                            <span>•</span>
                            <span className={getPriorityColor(task.priority)}>
                              {getPriorityDot(task.priority)} {task.priority}
                            </span>
                            <span>•</span>
                            <span className="text-red-600 font-medium">
                              Overdue by {getDaysOverdue(task.due_date)} {getDaysOverdue(task.due_date) === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                          {task.category && (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-0.5 bg-white text-xs font-medium text-gray-700 rounded border border-red-200">
                                {task.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Today Tasks - THIRD */}
            {todayTasks.length > 0 && (
              <div className="bg-white border-b border-gray-100">
                <div className="px-4 py-2 flex items-center gap-2 bg-white">
                  <h4 className="font-semibold text-gray-700 text-sm">
                    Due Today ({todayTasks.length})
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task.personId, task.person_id)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={(e) => handleToggleComplete(task.id, task.status, e)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0f2a71] focus:ring-[#0f2a71] cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.note_text}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span className="font-medium">{task.person_first_name} {task.person_last_name}</span>
                            <span>•</span>
                            <span className={getPriorityColor(task.priority)}>
                              {getPriorityDot(task.priority)} {task.priority}
                            </span>
                            <span>•</span>
                            <span className="text-sky-700 font-medium">Due today</span>
                          </div>
                          {task.category && (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-0.5 bg-gray-700 text-xs font-medium text-white rounded bg-[#36759c]">
                                {task.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {totalCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => {
              onClose();
              // This will be handled by parent to navigate to tasks view
              window.dispatchEvent(new CustomEvent('navigate-to-tasks'));
            }}
            className="w-full px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm flex items-center justify-center gap-2"
          >
            View All Tasks →
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}