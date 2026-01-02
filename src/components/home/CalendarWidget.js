import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMyTasks } from '../../services/api';

export default function CalendarWidget({ userId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
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
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      daysArray.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      daysArray.push(new Date(year, month, day));
    }
    
    return daysArray;
  }, [currentMonth]);
  
  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate + (task.dueDate.endsWith('Z') ? '' : 'Z'));
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm h-full">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <Calendar size={18} className="text-blue-600" />
        Calendar
      </h3>
      
      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-semibold py-1">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          
          const tasksOnDate = getTasksForDate(date);
          const today = isToday(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`
                aspect-square p-1 text-sm rounded relative
                hover:bg-gray-100 transition
                ${today ? 'bg-blue-100 font-bold text-blue-900' : 'text-gray-700'}
                ${selectedDate && selectedDate.toDateString() === date.toDateString() ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              {date.getDate()}
              
              {/* Task indicators */}
              {tasksOnDate.length > 0 && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  {tasksOnDate.slice(0, 3).map((task, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`}
                    />
                  ))}
                  {tasksOnDate.length > 3 && (
                    <span className="text-[8px] text-gray-600">+{tasksOnDate.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Selected date tasks */}
      {selectedDate && (
        <div className="border-t pt-3">
          <p className="text-sm font-semibold mb-2 text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {getTasksForDate(selectedDate).length > 0 ? (
              getTasksForDate(selectedDate).map(task => (
                <div key={task.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900 line-clamp-2">{task.noteText}</div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    {task.personFirstName} {task.personLastName}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No tasks for this date</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}