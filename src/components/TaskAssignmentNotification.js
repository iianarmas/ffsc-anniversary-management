import React, { useState, useEffect } from 'react';
import { CheckSquare, X, Bell } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from './auth/AuthProvider';

export default function TaskAssignmentNotification() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to new task assignments
    const channel = supabase
      .channel('task-assignments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `assigned_to_user=eq.${profile.id}`
        },
        (payload) => {
          const newTask = payload.new;
          
          // Only show notification if it's a task
          if (newTask.is_task) {
            // Fetch person details to show in notification
            fetchPersonDetails(newTask);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `assigned_to_user=eq.${profile.id}`
        },
        (payload) => {
          const updatedTask = payload.new;
          const oldTask = payload.old;
          
          // Only show notification if task was just assigned to this user
          if (updatedTask.is_task && oldTask.assigned_to_user !== profile.id) {
            fetchPersonDetails(updatedTask);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchPersonDetails = async (task) => {
    try {
      const { data: person } = await supabase
        .from('people')
        .select('first_name, last_name')
        .eq('id', task.person_id)
        .single();

      if (person) {
        const notification = {
          id: task.id,
          personName: `${person.first_name} ${person.last_name}`,
          taskText: task.note_text,
          priority: task.priority,
          dueDate: task.due_date,
          category: task.category,
          timestamp: Date.now()
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove after 10 seconds
        setTimeout(() => {
          removeNotification(notification.id);
        }, 10000);

        // Play notification sound
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error fetching person details:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      // Create a simple notification beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio API is not supported
      console.debug('Audio notification not available');
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500 bg-red-50';
      case 'Medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'Low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    
    return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`border-l-4 rounded-lg shadow-lg p-4 bg-white ${getPriorityColor(notification.priority)} animate-slide-in-right`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <Bell size={20} className="text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-gray-900">New Task Assigned</h4>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition"
                  aria-label="Dismiss"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <p className="text-xs text-gray-600 mb-1">
                <span className="font-semibold">{notification.personName}</span>
              </p>

              <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                {notification.taskText}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 text-xs">
                {notification.priority && (
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${
                    notification.priority === 'High' ? 'bg-red-100 text-red-800' :
                    notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {notification.priority}
                  </span>
                )}
                {notification.category && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    {notification.category}
                  </span>
                )}
                {notification.dueDate && (
                  <span className="text-gray-600">
                    {formatDueDate(notification.dueDate)}
                  </span>
                )}
              </div>

              {/* View Task Button */}
              <button
                onClick={() => {
                  window.dispatchEvent(new Event('navigate-to-tasks'));
                  removeNotification(notification.id);
                }}
                className="mt-3 w-full py-2 bg-[#0f2a71] text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-1"
              >
                <CheckSquare size={14} />
                View in Tasks
              </button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}