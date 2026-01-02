import React, { useState, useEffect } from 'react';
import { CheckSquare, Circle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function MyTasksWidget({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder - will implement in Phase 5
    setLoading(false);
    // Mock data for UI
    setTasks([
      {
        id: 1,
        note_text: 'Follow up with John Doe about shirt size',
        priority: 'High',
        due_date: new Date().toISOString(),
        status: 'incomplete',
        people: { first_name: 'John', last_name: 'Doe' }
      },
      {
        id: 2,
        note_text: 'Confirm payment for Jane Smith',
        priority: 'Medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'incomplete',
        people: { first_name: 'Jane', last_name: 'Smith' }
      }
    ]);
  }, [userId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString + (dateString.endsWith('Z') ? '' : 'Z'));
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return <span className="text-red-600 font-semibold">Overdue</span>;
    } else if (diffHours < 24) {
      return <span className="text-orange-600 font-semibold">Today</span>;
    } else {
      return date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-full">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <CheckSquare size={18} className="text-blue-600" />
        My Tasks Today
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div 
              key={task.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <button className="mt-1">
                  {task.status === 'complete' ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <Circle size={20} className="text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {task.note_text}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {task.people?.first_name} {task.people?.last_name}
                    </span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDueDate(task.due_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No tasks assigned to you</p>
            <p className="text-sm">You're all caught up! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}