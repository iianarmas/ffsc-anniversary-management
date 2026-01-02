import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget({ userId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks] = useState([]); // Will populate in Phase 5

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

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date + (task.due_date.endsWith('Z') ? '' : 'Z'));
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

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
        <span className="font-semibold text-gray-900 text-sm">
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
      <div className="grid grid-cols-7 gap-1">
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
                aspect-square p-1 text-xs rounded relative
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
                      className={`w-1 h-1 rounded-full ${
                        task.priority === 'High' ? 'bg-red-500' :
                        task.priority === 'Medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          {getTasksForDate(selectedDate).length > 0 ? (
            <div className="space-y-1">
              {getTasksForDate(selectedDate).map(task => (
                <div key={task.id} className="text-xs p-2 bg-gray-50 rounded">
                  {task.note_text}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No tasks scheduled</p>
          )}
        </div>
      )}
    </div>
  );
}