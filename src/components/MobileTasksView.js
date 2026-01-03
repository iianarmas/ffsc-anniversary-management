import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronUp, Calendar, Tag, AlertCircle, CheckCircle, Clock, CheckSquare, ChevronRight, Users } from 'lucide-react';
import AccountSidebar from './AccountSidebar';
import NotesDialog from './NotesDialog';
import { fetchAllTasks, toggleTaskComplete, getUsersForTaskAssignment } from '../services/api';
import { useAuth } from './auth/AuthProvider';

export default function MobileTasksView({ onTaskUpdate }) {
  const { profile } = useAuth();
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
  const [filterAssignedTo, setFilterAssignedTo] = useState('me'); // Default to 'me'
  const [availableUsers, setAvailableUsers] = useState([]);
  
  // Sidebar/Dialog states
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesDialogPerson, setNotesDialogPerson] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  // Load available users for assignment filter
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getUsersForTaskAssignment();
        console.log('Loaded users:', users); // Debug log
        setAvailableUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
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
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      // Filter by assigned user
      const matchesAssignedTo = filterAssignedTo === 'All' || 
        (filterAssignedTo === 'me' && task.assigned_to_user === profile?.id) ||
        task.assigned_to_user === filterAssignedTo;
      
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
      
      return matchesAssignedTo && matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDueDate;
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
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, filterDueDate, filterAssignedTo, profile?.id]);

  const stats = React.useMemo(() => {
    // Calculate stats based on FILTERED tasks (user-specific)
    const total = filteredAndSortedTasks.length;
    const incomplete = filteredAndSortedTasks.filter(t => t.status === 'incomplete').length;
    const complete = filteredAndSortedTasks.filter(t => t.status === 'complete').length;
    const overdue = filteredAndSortedTasks.filter(t => t.status === 'incomplete' && new Date(t.due_date) < new Date()).length;
    return { total, incomplete, complete, overdue };
  }, [filteredAndSortedTasks]);

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
    setFilterAssignedTo('me'); // Reset to default 'me'
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
      <div className="pb-24 bg-[#f9fafa]">
        {/* Fixed Header with Branding */}
        <div className="sticky top-0 bg-white shadow-md z-20">
          {/* Logo and Brand Section */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <img 
              src="/church-logo.svg" 
              alt="FFSC Logo" 
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <div>
              <h1 style={{ fontFamily: 'Moderniz, sans-serif' }} className="text-lg font-bold text-[#001740]">
                FFSC20
              </h1>
              <p className="text-xs text-gray-500">Task Management</p>
            </div>
          </div>

          {/* Stats and Search Section */}
          <div className="px-4 py-3">
            {/* Compact Stats Row */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-4 text-xs">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeFiltersCount > 0 
                    ? 'bg-[#001740] text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Filter size={18} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-[#f4d642] text-[#001740] px-2 py-0.5 rounded-full text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="flex-1 text-right">
              <div className="text-sm font-semibold text-gray-900">
                {filteredAndSortedTasks.length}
                <span className="text-gray-400 font-normal"> / {tasks.length}</span>
              </div>
              <div className="text-xs text-gray-500">tasks</div>
            </div>
          </div>

          {/* Active Filters Indicator & Reset */}
          {(filterStatus !== 'All' || filterPriority !== 'All' || filterCategory !== 'All' || filterDueDate !== 'All' || filterAssignedTo !== 'me') && (
            <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-900">
                  Filters active
                </span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-fade-in" onClick={() => setShowFilters(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[#001740]">Filters</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Refine your tasks</p>
                  </div>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Filter Content */}
              <div className="p-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <select
                    value={filterAssignedTo}
                    onChange={(e) => setFilterAssignedTo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="All">All Users</option>
                    <option value="me">Assigned to Me</option>
                    {availableUsers
                      .filter(user => user.id !== profile?.id)
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                  </select>
                </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setShowFilters(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-3 bg-[#001740] text-white rounded-xl font-medium hover:bg-[#002255] transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Animation Styles */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>

        {/* Task Cards */}
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#001740] border-t-transparent mx-auto"></div>
              <p className="text-sm text-gray-500 mt-3">Loading tasks...</p>
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckSquare size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No tasks found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredAndSortedTasks.map((task) => {
              const isOverdue = new Date(task.due_date) < new Date() && task.status === 'incomplete';
              const isDueToday = formatDate(task.due_date) === 'Today';
              
              return (
                <div
                  key={task.id}
                  className={`rounded-xl shadow-sm p-4 border-l-4 transition-all ${
                    task.status === 'complete' 
                      ? 'bg-gray-50 border-gray-400' 
                      : isOverdue 
                        ? 'bg-red-50 border-red-500' 
                        : isDueToday 
                          ? 'bg-yellow-50 border-yellow-500' 
                          : 'bg-white border-blue-400'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                {/* Task Text */}
                  <div 
                    onClick={() => handleOpenNotesDialog(task)}
                    className="mb-3"
                  >
                    <p className={`text-base font-bold leading-tight ${
                      task.status === 'complete' 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}>
                      {task.note_text}
                    </p>
                  </div>

                  {/* Person Name */}
                  <button
                    onClick={() => handleOpenPerson(task)}
                    className="inline-flex items-center gap-1 text-sm text-[#001740] font-semibold mb-3 hover:underline"
                  >
                    <span>{task.people.first_name} {task.people.last_name}</span>
                    <ChevronRight size={14} />
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
                    className={`w-full px-4 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      task.status === 'complete'
                        ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200'
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    {task.status === 'complete' ? (
                      <>
                        <CheckCircle size={18} />
                        <span>✓ Complete</span>
                      </>
                    ) : (
                      <>
                        <Clock size={18} />
                        <span>Mark as Complete</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 p-3 bg-[#001740] text-white rounded-full shadow-lg z-50 hover:bg-[#002255] transition-colors"
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