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

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High': 
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          border: 'border-red-200',
          accent: 'bg-red-50'
        };
      case 'Medium': 
        return {
          bg: 'bg-orange-500',
          text: 'text-white',
          border: 'border-orange-200',
          accent: 'bg-orange-50'
        };
      case 'Low': 
        return {
          bg: 'bg-green-600',
          text: 'text-white',
          border: 'border-green-200',
          accent: 'bg-green-50'
        };
      default: 
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          border: 'border-gray-200',
          accent: 'bg-gray-50'
        };
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
      {notifications.map((notification, index) => {
        const priorityStyles = getPriorityStyles(notification.priority);
        
        return (
          <div
            key={notification.id}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-in-right"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Color accent top bar */}
            <div className={`h-1 ${priorityStyles.bg}`} />
            
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon with accent color */}
                <div className={`flex-shrink-0 p-2.5 rounded-lg ${priorityStyles.accent}`}>
                  <Bell size={22} className={notification.priority === 'High' ? 'text-red-600' : notification.priority === 'Medium' ? 'text-orange-600' : 'text-green-600'} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-gray-900">New Task Assigned</h4>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Dismiss"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    {notification.personName}
                  </p>

                  <p className="text-sm text-gray-800 mb-3 line-clamp-2 leading-snug">
                    {notification.taskText}
                  </p>

                  {/* Metadata badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {/* Priority badge - using task management styling */}
                    {notification.priority && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${priorityStyles.bg} ${priorityStyles.text}`}>
                        <span className="h-2 w-2 bg-white rounded-full inline-block"></span>
                        {notification.priority}
                      </span>
                    )}
                    
                    {/* Category badge - dark gray with white text */}
                    {notification.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-700 text-white">
                        {notification.category}
                      </span>
                    )}
                    
                    {/* Due date */}
                    {notification.dueDate && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-600">
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
                    className="w-full py-2.5 bg-[#0f2a71] text-white text-xs font-semibold rounded-lg hover:bg-[#1c3b8d] transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckSquare size={14} />
                    View in Tasks
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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