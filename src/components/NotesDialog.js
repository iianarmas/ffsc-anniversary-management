import React, { useState, useEffect } from 'react';
import { X, StickyNote, Trash2, Edit2, Plus, Square, CalendarDays, Hash, AlertCircle, RotateCw, Clock } from 'lucide-react';
import { fetchNotesForPerson, createNote, updateNote, deleteNote, toggleTaskComplete } from '../services/api';

export default function NotesDialog({ person, isOpen, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  // Task-related states
  const [isTask, setIsTask] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('General');
  const [taskAssignedTo, setTaskAssignedTo] = useState('Admin');
  const [taskRecurrence, setTaskRecurrence] = useState('none');
  const [taskRecurrenceEndDate, setTaskRecurrenceEndDate] = useState('');
  
  // Editing task states
  const [editingTaskData, setEditingTaskData] = useState(null);

  useEffect(() => {
    if (isOpen && person) {
      loadNotes();
    }
  }, [isOpen, person]);

  const loadNotes = async () => {
    if (!person) return;
    setLoading(true);
    const fetchedNotes = await fetchNotesForPerson(person.id);
    setNotes(fetchedNotes);
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setLoading(true);
    try {
      const taskData = isTask ? {
        dueDate: taskDueDate || new Date().toISOString(),
        priority: taskPriority,
        category: taskCategory,
        assignedTo: taskAssignedTo,
        recurrence: taskRecurrence,
        recurrenceEndDate: taskRecurrenceEndDate || null
      } : {};
      
      await createNote(person.id, newNoteText.trim(), 'Admin', isTask, taskData);
      
      // Reset form
      setNewNoteText('');
      setIsTask(false);
      setTaskDueDate('');
      setTaskPriority('Medium');
      setTaskCategory('General');
      setTaskAssignedTo('Admin');
      setTaskRecurrence('none');
      setTaskRecurrenceEndDate('');
      
      await loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
    setLoading(false);
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingText.trim()) return;
    setLoading(true);
    try {
      const taskData = editingTaskData || {};
      await updateNote(noteId, editingText.trim(), 'Admin', taskData);
      setEditingNoteId(null);
      setEditingText('');
      setEditingTaskData(null);
      await loadNotes();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
    setLoading(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setLoading(true);
    try {
      await deleteNote(noteId);
      await loadNotes();
      
      // Notify other components that a task was updated/deleted
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
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
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'complete') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-red-500 bg-red-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      case 'Low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Follow-up': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Shirt Payment': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Shirt Distribution': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Shirt Print Request': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'General': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleToggleTaskComplete = async (taskId, currentStatus) => {
    setLoading(true);
    try {
      await toggleTaskComplete(taskId, currentStatus);
      await loadNotes();
      
      // Notify other components that a task was updated
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
    setLoading(false);
  };

  const startEditingTask = (note) => {
    setEditingNoteId(note.id);
    setEditingText(note.note_text);
    if (note.is_task) {
      setEditingTaskData({
        dueDate: note.due_date || '',
        priority: note.priority || 'Medium',
        category: note.category || 'General',
        assignedTo: note.assigned_to || 'Admin',
        recurrence: note.recurrence || 'none',
        recurrenceEndDate: note.recurrence_end_date || ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <StickyNote size={20} className="text-[#0f2a71]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#001740]">
                {person?.firstName} {person?.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                {notes.filter(n => !n.is_task).length} {notes.filter(n => !n.is_task).length === 1 ? 'note' : 'notes'} • {notes.filter(n => n.is_task).length} {notes.filter(n => n.is_task).length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Notes List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && notes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <StickyNote size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No notes yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first note below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className={`rounded-lg p-4 border-l-4 transition group ${
                    note.is_task 
                      ? `${getPriorityColor(note.priority)} ${isOverdue(note.due_date, note.status) ? 'bg-red-50' : ''} ${note.status === 'complete' ? 'bg-gray-100' : ''}`
                      : 'bg-gray-50 border-l-gray-300 border-l-4'
                  } border border-gray-200 hover:border-gray-300`}
                >
                  {editingNoteId === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        autoFocus
                      />
                      
                      {/* Show task fields if editing a task */}
                      {note.is_task && editingTaskData && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={editingTaskData.dueDate ? new Date(editingTaskData.dueDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => setEditingTaskData({ ...editingTaskData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                            <select
                              value={editingTaskData.priority}
                              onChange={(e) => setEditingTaskData({ ...editingTaskData, priority: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                            <select
                              value={editingTaskData.category}
                              onChange={(e) => setEditingTaskData({ ...editingTaskData, category: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="General">General</option>
                              <option value="Follow-up">Follow-up</option>
                              <option value="Shirt Payment">Shirt Payment</option>
                              <option value="Shirt Distribution">Shirt Distribution</option>
                              <option value="Shirt Print Request">Shirt Print Request</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Recurrence</label>
                            <select
                              value={editingTaskData.recurrence}
                              onChange={(e) => setEditingTaskData({ ...editingTaskData, recurrence: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="none">None</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          {editingTaskData.recurrence !== 'none' && (
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Until (Optional)</label>
                              <input
                                type="date"
                                value={editingTaskData.recurrenceEndDate ? new Date(editingTaskData.recurrenceEndDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setEditingTaskData({ ...editingTaskData, recurrenceEndDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-[#0f2a71] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingText('');
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 mb-2">
                        {/* Task checkbox */}
                        {note.is_task && (
                          <button
                            onClick={() => handleToggleTaskComplete(note.id, note.status)}
                            className="mt-0.5 flex-shrink-0"
                            disabled={loading}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                              note.status === 'complete'
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400 hover:border-green-500'
                            }`}>
                              {note.status === 'complete' && (
                                <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                          </button>
                        )}
                        
                        <div className="flex-1">
                          <p className={`text-sm text-gray-800 ${note.status === 'complete' ? 'line-through text-gray-500' : ''}`}>
                            {note.note_text}
                          </p>
                          
                          {/* Task metadata badges */}
                          {note.is_task && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {/* Due date badge */}
                              {note.due_date && (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                                  isOverdue(note.due_date, note.status)
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}>
                                  <CalendarDays size={12} />
                                  {formatDueDate(note.due_date)}
                                </span>
                              )}
                              
                              {/* Priority badge */}
                              {note.priority && (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getPriorityBadgeColor(note.priority)}`}>
                                  <AlertCircle size={12} />
                                  {note.priority}
                                </span>
                              )}
                              
                              {/* Category badge */}
                              {note.category && (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getCategoryBadgeColor(note.category)}`}>
                                  <Hash size={12} />
                                  {note.category}
                                </span>
                              )}
                              
                              {/* Recurrence badge */}
                              {note.recurrence && note.recurrence !== 'none' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border bg-indigo-100 text-indigo-800 border-indigo-300">
                                  <RotateCw size={12} />
                                  Repeats {note.recurrence}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                          <button
                            onClick={() => startEditingTask(note)}
                            className="p-1.5 hover:bg-white rounded transition"
                            aria-label="Edit note"
                          >
                            <Edit2 size={14} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 hover:bg-white rounded transition"
                            aria-label="Delete note"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        {note.is_task && note.assigned_to && (
                          <>
                            <span className="font-medium">Assigned to: {note.assigned_to}</span>
                            <span>•</span>
                          </>
                        )}
                        <span className="font-medium">{note.created_by}</span>
                        <span>•</span>
                        <span>{formatDate(note.created_at)}</span>
                        {note.updated_at && note.updated_at !== note.created_at && (
                          <>
                            <span>•</span>
                            <span className="italic">edited</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Note/Task Section */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="space-y-3">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && !isTask) {
                  handleAddNote();
                }
              }}
              placeholder={isTask ? "Describe the task..." : "Add a note... (Ctrl+Enter to save)"}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
            
            {/* Mark as Task Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTask"
                checked={isTask}
                onChange={(e) => {
                  setIsTask(e.target.checked);
                  if (e.target.checked && !taskDueDate) {
                    setTaskDueDate(new Date().toISOString());
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isTask" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1">
                <Square size={16} />
                Mark as task
              </label>
            </div>
            
            {/* Task Fields - Show when isTask is checked */}
            {isTask && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={taskDueDate ? new Date(taskDueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setTaskDueDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Shirt Payment">Shirt Payment</option>
                    <option value="Shirt Distribution">Shirt Distribution</option>
                    <option value="Shirt Print Request">Shirt Print Request</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    placeholder="Admin"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Recurrence
                  </label>
                  <select
                    value={taskRecurrence}
                    onChange={(e) => setTaskRecurrence(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                {taskRecurrence !== 'none' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Until (Optional)
                    </label>
                    <input
                      type="date"
                      value={taskRecurrenceEndDate ? new Date(taskRecurrenceEndDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setTaskRecurrenceEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Add Button */}
            <div className="flex justify-end">
              <button
                onClick={handleAddNote}
                disabled={loading || !newNoteText.trim()}
                className="px-5 py-2.5 bg-[#0f2a71] text-white rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                {isTask ? 'Add Task' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}