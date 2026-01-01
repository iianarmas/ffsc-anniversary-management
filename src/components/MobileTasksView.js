import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronUp, Calendar, Tag, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import AccountSidebar from './AccountSidebar';
import NotesDialog from './NotesDialog';
import { fetchAllTasks, toggleTaskComplete } from '../services/api';

export default function MobileTasksView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDueDate, setFilterDueDate] = useState('All');
  
  // Sidebar/Dialog states
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesDialogPerson, setNotesDialogPerson] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const allTasks = await fetchAllTasks();
    setTasks(allTasks);
    setLoading(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        `${task.people.first_name} ${task.people.last_name} ${task.note_text}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || 
        (filterStatus === 'Incomplete' && task.status === 'incomplete') ||
        (filterStatus === 'Complete' && task.status === 'complete') ||
        (filterStatus === 'Overdue' && task.status === 'incomplete' && new Date(task.due_date) < new Date());
      
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
      
      let matchesDueDate = true;
      if (filterDueDate !== 'All') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        
        if (filterDueDate === 'Today') {
          matchesDueDate = taskDate.getTime() === today.getTime();
        } else if (filterDueDate === 'This Week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          matchesDueDate = taskDate >= today && taskDate <= weekFromNow;
        } else if (filterDueDate === 'This Month') {
          matchesDueDate = taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
        } else if (filterDueDate === 'Overdue') {
          matchesDueDate = taskDate < today && task.status === 'incomplete';
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDueDate;
    });

    // Sort: Overdue first, then by due date
    filtered.sort((a, b) => {
      const aOverdue = new Date(a.due_date) < new Date() && a.status === 'incomplete';
      const bOverdue = new Date(b.due_date) < new Date() && b.status === 'incomplete';
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return filtered;
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, filterDueDate]);

  const stats = React.useMemo(() => {
    const total = tasks.length;
    const incomplete = tasks.filter(t => t.status === 'incomplete').length;
    const complete = tasks.filter(t => t.status === 'complete').length;
    const overdue = tasks.filter(t => t.status === 'incomplete' && new Date(t.due_date) < new Date()).length;
    return { total, incomplete, complete, overdue };
  }, [tasks]);

  const activeFiltersCount = [filterStatus, filterPriority, filterCategory, filterDueDate].filter(f => f !== 'All').length;

  const handleToggleComplete = async (taskId, currentStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: currentStatus === 'complete' ? 'incomplete' : 'complete' } : t
    ));
    await toggleTaskComplete(taskId, currentStatus);
    await loadTasks();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterPriority('All');
    setFilterCategory('All');
    setFilterDueDate('All');
  };

  const handleOpenPerson = (task) => {
    setSelectedPerson({
      id: task.person_id,
      firstName: task.people.first_name,
      lastName: task.people.last_name
    });
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedPerson(null), 300);
  };

  const handleOpenNotesDialog = (task) => {
    setNotesDialogPerson({
      id: task.person_id,
      firstName: task.people.first_name,
      lastName: task.people.last_name
    });
    setNotesDialogOpen(true);
  };

  const handleCloseNotesDialog = () => {
    setNotesDialogOpen(false);
    setTimeout(() => setNotesDialogPerson(null), 300);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) return 'Today';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const getCardBackgroundColor = (task) => {
    if (task.status === 'complete') return 'bg-gray-50';
    const isOverdue = new Date(task.due_date) < new Date();
    if (isOverdue) return 'bg-red-50';
    const isToday = formatDate(task.due_date) === 'Today';
    if (isToday) return 'bg-yellow-50';
    return 'bg-white';
  };

  return (
    <>
      <div className="pb-20">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white shadow-md z-20 p-4">
          {/* Title & Stats */}
          <div className="mb-3">
            <h2 className="text-xl font-bold text-gray-900">Task Management</h2>
            <p className="text-sm text-gray-600 mt-1">Track and manage all tasks</p>
            
            {/* Stats Row */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle size={14} className="text-gray-400" />
                <span className="font-semibold text-gray-900">{stats.total}</span>
                <span className="text-gray-500">Total</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-yellow-500" />
                <span className="font-semibold text-gray-900">{stats.incomplete}</span>
                <span className="text-gray-500">Todo</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <CheckCircle size={14} className="text-green-600" />
                <span className="font-semibold text-gray-900">{stats.complete}</span>
                <span className="text-gray-500">Done</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <AlertCircle size={14} className="text-red-600" />
                <span className="font-semibold text-gray-900">{stats.overdue}</span>
                <span className="text-gray-500">Overdue</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks or people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Button & Counter */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <Filter size={18} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <div className="text-sm font-semibold text-gray-700">
              {filteredAndSortedTasks.length} / {tasks.length}
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setShowFilters(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="All">All Status</option>
                    <option value="Incomplete">Incomplete</option>
                    <option value="Complete">Complete</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="All">All Categories</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Shirt Payment">Shirt Payment</option>
                    <option value="Shirt Distribution">Shirt Distribution</option>
                    <option value="Shirt Print Request">Shirt Print Request</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <select
                    value={filterDueDate}
                    onChange={(e) => setFilterDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setShowFilters(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Cards */}
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No tasks found matching your criteria
            </div>
          ) : (
            filteredAndSortedTasks.map((task) => (
              <div
                key={task.id}
                className={`${getCardBackgroundColor(task)} rounded-lg shadow-md p-4 border-l-4 ${
                  task.priority === 'High' ? 'border-red-500' :
                  task.priority === 'Medium' ? 'border-yellow-500' :
                  'border-green-500'
                }`}
              >
                {/* Task Text */}
                <div 
                  onClick={() => handleOpenNotesDialog(task)}
                  className="mb-3"
                >
                  <p className={`font-semibold text-gray-900 ${task.status === 'complete' ? 'line-through text-gray-500' : ''}`}>
                    {task.note_text}
                  </p>
                </div>

                {/* Person Name */}
                <button
                  onClick={() => handleOpenPerson(task)}
                  className="text-sm text-blue-600 font-medium mb-3 hover:underline"
                >
                  {task.people.first_name} {task.people.last_name}
                </button>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Due Date */}
                  <div className="flex items-center gap-1 text-xs text-gray-700">
                    <Calendar size={12} className="text-gray-400" />
                    <span>{formatDate(task.due_date)}</span>
                  </div>

                  {/* Priority */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                    <span>{getPriorityIcon(task.priority)}</span>
                    {task.priority}
                  </span>

                  {/* Category */}
                  <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Tag size={12} className="text-gray-400" />
                    {task.category}
                  </span>
                </div>

                {/* Status Toggle Button */}
                <button
                  onClick={() => handleToggleComplete(task.id, task.status)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    task.status === 'complete'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`}
                >
                  {task.status === 'complete' ? '✓ Complete' : 'Mark as Complete'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg z-50"
          >
            <ChevronUp />
          </button>
        )}
      </div>

      {/* Account Sidebar */}
      <AccountSidebar person={selectedPerson} open={sidebarOpen} onClose={handleCloseSidebar} />
      
      {/* Notes Dialog */}
      <NotesDialog 
        person={notesDialogPerson} 
        isOpen={notesDialogOpen} 
        onClose={handleCloseNotesDialog} 
      />
    </>
  );
}