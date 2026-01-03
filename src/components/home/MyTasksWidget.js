import React, { useState, useEffect } from 'react';
import { CheckSquare, Circle, CheckCircle2, Clock, Users } from 'lucide-react';
import { getMyTasks, toggleTaskComplete } from '../../services/api';

export default function MyTasksWidget({ userId, onTaskUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getMyTasks(userId);
      // Filter only incomplete tasks
      const incompleteTasks = data.filter(t => t.status === 'incomplete');
      setTasks(incompleteTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      await toggleTaskComplete(taskId, currentStatus);
      await loadTasks();
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-600 text-white';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString + (dateString.endsWith('Z') ? '' : 'Z'));
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">Overdue</span>;
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#001740]">My Tasks</h3>
        <span className="text-sm text-gray-500">{tasks.length}</span>
      </div>
      
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '450px' }}>
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div 
              key={task.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => handleToggleComplete(task.id, task.status)}
                  className="mt-1 hover:scale-110 transition flex-shrink-0"
                >
                  {task.status === 'complete' ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <Circle size={20} className="text-gray-400 hover:text-[#001740]" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#001740] mb-2">
                    {task.noteText}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {task.personFirstName} {task.personLastName}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No active tasks</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}