import React, { useState, useEffect, useRef } from 'react';
import { X, CheckSquare, AlertTriangle } from 'lucide-react';
import { fetchOverdueTasks, fetchTasksDueToday, toggleTaskComplete } from '../services/api';

export default function TaskNotificationDropdown({ isOpen, onClose, onTaskClick }) {
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
      const interval = setInterval(loadTasks, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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

  const loadTasks = async () => {
    setLoading(true);
    const [overdue, today] = await Promise.all([
      fetchOverdueTasks(),
      fetchTasksDueToday()
    ]);
    setOverdueTasks(overdue);
    setTodayTasks(today);
    setLoading(false);
  };

  const handleToggleComplete = async (taskId, currentStatus, e) => {
    e.stopPropagation();
    await toggleTaskComplete(taskId, currentStatus);
    await loadTasks();
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
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (!isOpen) return null;

  const totalCount = overdueTasks.length + todayTasks.length;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50"
      style={{ maxHeight: '32rem' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-[#0f2a71]" />
          <h3 className="font-semibold text-gray-900">Task Reminders</h3>
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
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(32rem - 3.5rem)' }}>
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
            {/* Overdue Tasks */}
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
                            <span className="font-medium">{task.personName}</span>
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

            {/* Due Today Tasks */}
            {todayTasks.length > 0 && (
              <div className="bg-yellow-50 border-b border-yellow-100">
                <div className="px-4 py-2 flex items-center gap-2 bg-yellow-100">
                  <span className="text-base">📅</span>
                  <h4 className="font-semibold text-yellow-900 text-sm">
                    Due Today ({todayTasks.length})
                  </h4>
                </div>
                <div className="divide-y divide-yellow-100">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task.personId, task.person_id)}
                      className="px-4 py-3 hover:bg-yellow-100 cursor-pointer transition"
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
                            <span className="font-medium">{task.personName}</span>
                            <span>•</span>
                            <span className={getPriorityColor(task.priority)}>
                              {getPriorityDot(task.priority)} {task.priority}
                            </span>
                            <span>•</span>
                            <span className="text-yellow-700 font-medium">Due today</span>
                          </div>
                          {task.category && (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-0.5 bg-white text-xs font-medium text-gray-700 rounded border border-yellow-200">
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
    </div>
  );
}