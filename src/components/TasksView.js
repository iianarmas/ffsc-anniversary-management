import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, Filter, Square, Circle, CalendarDays, Hash, Users, CheckCircle2, Clock, AlertTriangle, RotateCw, ClipboardList, Lock } from 'lucide-react';
import Header from './Header';
import Pagination from './Pagination';
import AccountSidebar from './AccountSidebar';
import NotesDialog from './NotesDialog';
import { fetchAllTasks, toggleTaskComplete, getAgeBracket, getUsersForTaskAssignment } from '../services/api';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '../services/supabase';

export default function TasksView({ onTaskUpdate }) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDueDate, setFilterDueDate] = useState('All');
  const [filterAssignedTo, setFilterAssignedTo] = useState('me'); // Default to 'me'
  
  // Check for overdue filter from navigation
  useEffect(() => {
    const overdueFlag = sessionStorage.getItem('tasks-filter-overdue');
    if (overdueFlag === 'true') {
      setFilterDueDate('Overdue');
      setFilterAssignedTo('me');
      sessionStorage.removeItem('tasks-filter-overdue');
    }
  }, []);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filterCreatedBy, setFilterCreatedBy] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Sidebar/Dialog states
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesDialogPerson, setNotesDialogPerson] = useState(null);
  
  // UI states
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const filterRefs = useRef({});
  const dropdownRefs = useRef({});

  // Refs for layout measurements
  const tableContainerRef = useRef(null);
  const paginationRefEl = useRef(null);
  const actionBarRef = useRef(null);

  // Heights and fixed pagination state
  const [paginationHeight, setPaginationHeight] = useState(0);
  const [actionBarHeight, setActionBarHeight] = useState(0);
  const [useFixedPagination, setUseFixedPagination] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    const allTasks = await fetchAllTasks();
    setTasks(allTasks);
    setLoading(false);
  };

  // Load available users for assignment filter
  useEffect(() => {
    const loadUsers = async () => {
      const users = await getUsersForTaskAssignment();
      setAvailableUsers(users);
    };
    loadUsers();
  }, []);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Listen for task updates from other components
  useEffect(() => {
    const handleTaskUpdate = async () => {
      setLoading(true);
      const allTasks = await fetchAllTasks();
      setTasks(allTasks);
      setLoading(false);
    };
    
    window.addEventListener('taskUpdated', handleTaskUpdate);
    window.addEventListener('tasksLoaded', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      window.removeEventListener('tasksLoaded', handleTaskUpdate);
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter) {
        const filterButton = filterRefs.current[openFilter];
        const dropdown = dropdownRefs.current[openFilter];
        
        // Check if click is inside the filter button OR the dropdown
        const clickedInsideButton = filterButton && filterButton.contains(event.target);
        const clickedInsideDropdown = dropdown && dropdown.contains(event.target);
        
        if (!clickedInsideButton && !clickedInsideDropdown) {
          setOpenFilter(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        `${task.person_first_name} ${task.person_last_name} ${task.note_text}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || 
        (filterStatus === 'Incomplete' && task.status === 'incomplete') ||
        (filterStatus === 'Complete' && task.status === 'complete') ||
        (filterStatus === 'Overdue' && task.status === 'incomplete' && new Date(task.due_date) < new Date());
      
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchesAssignedTo = filterAssignedTo === 'All' || 
        (filterAssignedTo === 'me' && task.assigned_to_user === profile?.id) ||
        task.assigned_to_user === filterAssignedTo;
      
      const matchesCreatedBy = filterCreatedBy === 'All' || 
        (filterCreatedBy === 'me' && task.created_by_user === profile?.id) ||
        task.created_by_user === filterCreatedBy;
      
      let matchesDueDate = true;
      if (filterDueDate !== 'All') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const taskDateObj = new Date(task.due_date);
        const taskDate = new Date(taskDateObj.getUTCFullYear(), taskDateObj.getUTCMonth(), taskDateObj.getUTCDate());
        
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
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDueDate && matchesAssignedTo && matchesCreatedBy;
    });

    // Sort: Overdue first, then by due date
    filtered.sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const aDateObj = new Date(a.due_date);
      const aDate = new Date(aDateObj.getUTCFullYear(), aDateObj.getUTCMonth(), aDateObj.getUTCDate());
      const aOverdue = aDate < today && a.status === 'incomplete';
      
      const bDateObj = new Date(b.due_date);
      const bDate = new Date(bDateObj.getUTCFullYear(), bDateObj.getUTCMonth(), bDateObj.getUTCDate());
      const bOverdue = bDate < today && b.status === 'incomplete';
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return filtered;
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, filterDueDate, filterAssignedTo, filterCreatedBy, profile?.id]);

  // Calculate stats based on FILTERED tasks (not all tasks)
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const total = filteredAndSortedTasks.length;
    const incomplete = filteredAndSortedTasks.filter(t => t.status === 'incomplete').length;
    const complete = filteredAndSortedTasks.filter(t => t.status === 'complete').length;
    const overdue = filteredAndSortedTasks.filter(t => {
      if (t.status !== 'incomplete') return false;
      const taskDateObj = new Date(t.due_date);
      const taskDate = new Date(taskDateObj.getUTCFullYear(), taskDateObj.getUTCMonth(), taskDateObj.getUTCDate());
      return taskDate < today;
    }).length;
    
    return { total, incomplete, complete, overdue };
  }, [filteredAndSortedTasks]);

  // Measure heights and determine overflow
  useEffect(() => {
    const measureHeights = () => {
      const tableEl = tableContainerRef.current;
      const paginationEl = paginationRefEl.current;
      const actionEl = actionBarRef.current;

      const tableHeight = tableEl ? tableEl.scrollHeight : 0;
      const containerHeight = tableEl ? tableEl.clientHeight : 0;
      setUseFixedPagination(tableHeight > containerHeight);

      setPaginationHeight(paginationEl ? paginationEl.offsetHeight : 0);
      setActionBarHeight(actionEl ? actionEl.offsetHeight : 0);
    };

    measureHeights();

    const resizeObserver = new ResizeObserver(() => {
      measureHeights();
    });

    if (tableContainerRef.current) resizeObserver.observe(tableContainerRef.current);
    if (paginationRefEl.current) resizeObserver.observe(paginationRefEl.current);
    if (actionBarRef.current) resizeObserver.observe(actionBarRef.current);

    window.addEventListener('resize', measureHeights);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureHeights);
    };
  }, [filteredAndSortedTasks.length, itemsPerPage, currentPage]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedTasks.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actions
  const handleSelectTask = (id) => {
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedTasks(currentItems.map(t => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTasks([]);
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: currentStatus === 'complete' ? 'incomplete' : 'complete' } : t
    ));
    await toggleTaskComplete(taskId, currentStatus);
    await loadTasks();
    
    // Notify header to update badge count
    window.dispatchEvent(new Event('taskUpdated'));
  };

  const handleBulkComplete = async () => {
    setLoading(true);
    for (const taskId of selectedTasks) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status === 'incomplete') {
        await toggleTaskComplete(taskId, 'incomplete');
      }
    }
    await loadTasks();
    setSelectedTasks([]);
    setLoading(false);
    
    // Notify header to update badge count
    window.dispatchEvent(new Event('taskUpdated'));
  };

  const handleBulkIncomplete = async () => {
    setLoading(true);
    for (const taskId of selectedTasks) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status === 'complete') {
        await toggleTaskComplete(taskId, 'complete');
      }
    }
    await loadTasks();
    setSelectedTasks([]);
    setLoading(false);
    
    // Notify header to update badge count
    window.dispatchEvent(new Event('taskUpdated'));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setFilterPriority('All');
    setFilterCategory('All');
    setFilterDueDate('All');
    setFilterAssignedTo('me');
    setFilterCreatedBy('All');
  };

  const handleOpenPerson = async (task) => {
    // Fetch full person data
    const { data, error } = await supabase
      .from('people')
      .select(`
        *,
        shirts(*),
        registrations(*)
      `)
      .eq('id', task.person_id)
      .single();
    
    if (error) {
      console.error('Error fetching person:', error);
      return;
    }
    
    // Transform to match expected format
    const person = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      age: data.age,
      gender: data.gender,
      ageBracket: getAgeBracket(data.age),
      location: data.location === 'GUEST' ? 'Guest' : data.location,
      contactNumber: data.contact_number,
      registered: data.registrations?.[0]?.registered || false,
      registeredAt: data.registrations?.[0]?.registered_at || null,
      shirtSize: data.shirts?.[0]?.shirt_size || '',
      paid: data.shirts?.[0]?.paid || false,
      shirtGiven: data.shirts?.[0]?.shirt_given || false,
    };
    
    setSelectedPerson(person);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedPerson(null), 300);
  };

  const handleOpenNotesDialog = (task) => {
    setNotesDialogPerson({
      id: task.person_id,
      firstName: task.person_first_name,
      lastName: task.person_last_name
    });
    setNotesDialogOpen(true);
  };

  const handleCloseNotesDialog = () => {
    setNotesDialogOpen(false);
    setTimeout(() => setNotesDialogPerson(null), 300);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    // Parse the date string as UTC to avoid timezone shifts
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    // Create date objects in local timezone for comparison
    const taskDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) return 'Today';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-600 text-white';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-gray-white';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return <span className={'h-2 w-2 bg-white rounded-full inline-block'}/>;
      case 'Medium': return <span className={'h-2 w-2 bg-white rounded-full inline-block'}/>;
      case 'Low': return <span className={'h-2 w-2 bg-white rounded-full inline-block'}/>;
      default: return <span className={'h-2 w-2 bg-white rounded-full inline-block'}/>;
    }
  };

  const getRowBackgroundColor = (task) => {
    if (task.status === 'complete') return 'bg-gray-50';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDateObj = new Date(task.due_date);
    const taskDate = new Date(taskDateObj.getUTCFullYear(), taskDateObj.getUTCMonth(), taskDateObj.getUTCDate());
    
    const isOverdue = taskDate < today;
    if (isOverdue) return 'bg-red-50';
    const isToday = taskDate.getTime() === today.getTime();
    if (isToday) return '';
    return '';
  };

  // Check if user is viewer - show restricted message (after all hooks)
  if (profile?.role === 'viewer') {
    return (
      <>
        <Header
          viewTitle="Task Management"
          searchTerm=""
          setSearchTerm={() => {}}
          searchPlaceholder="Search tasks or people..."
        />
        
        <div className="p-6 bg-white min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <Lock size={64} className="mx-auto text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to view or manage tasks. This feature is only available to Committee members and Administrators.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-900 font-medium mb-2">Need access?</p>
              <p className="text-sm text-blue-800">
                Contact your administrator to request Committee or Admin permissions.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const FilterDropdown = ({ column, options, value, onChange }) => {
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (openFilter === column && filterRefs.current[column]) {
        const updatePosition = () => {
          const rect = filterRefs.current[column].getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.right - 192 // 192px = w-48
          });
        };
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
          window.removeEventListener('scroll', updatePosition, true);
          window.removeEventListener('resize', updatePosition);
        };
      }
    }, [openFilter, column]);

    return (
      <div className="relative" ref={el => filterRefs.current[column] = el}>
        <div className="relative">
          <Filter 
            size={14} 
            className="cursor-pointer transition text-gray-400 hover:text-gray-600"
            onClick={() => setOpenFilter(openFilter === column ? null : column)}
          />
          {value !== 'All' && value !== 'me' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </div>
        {openFilter === column && createPortal(
          <div 
            ref={el => dropdownRefs.current[column] = el}
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            <div className="py-1">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpenFilter(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition ${
                    value === option.value ? 'bg-blue-100 text-[#001740] font-semibold' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  const hasActiveFilters = filterStatus !== 'All' || filterPriority !== 'All' || filterCategory !== 'All' || filterDueDate !== 'All' || filterAssignedTo !== 'me' || filterCreatedBy !== 'All';

  return (
    <>
      <Header
        viewTitle="Task Management"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search tasks or people..."
      />

      <div className="p-4 bg-white">
        <div className="sticky top-16 z-20 py-2 border-b border-gray-100 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
              <p className="text-sm text-gray-600 mt-1">Track and manage tasks across all attendees</p>
            </div>
            <div className="text-sm text-gray-500 flex items-baseline gap-2">
              <ClipboardList size={18} className="text-gray-400" />
              <span className="font-semibold text-gray-900 text-lg">{filteredAndSortedTasks.length}</span>
              <span className="text-gray-500">{filteredAndSortedTasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div 
            className="relative overflow-y-auto overflow-x-hidden"
            ref={tableContainerRef}
            style={{ maxHeight: 'calc(100vh - 12.7rem)' }}
          >
            
            {/* Action Bar */}
            <div ref={actionBarRef} className="sticky top-0 z-20 bg-white border-b-2 border-gray-200" style={{ paddingBottom: '1px' }}>
              <div className="bg-white px-4 py-3 flex items-center justify-between min-h-[60px] border-b border-gray-200">
                <div className="flex items-center gap-4">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mr-2">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <ClipboardList size={14} className="text-gray-400" />
                      <span className="font-semibold text-gray-900">{stats.total}</span>
                      <span className="text-gray-500">Total</span>
                      <span className="text-gray-300">|</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Clock size={14} className="text-yellow-500" />
                      <span className="font-semibold text-gray-900">{stats.incomplete}</span>
                      <span className="text-gray-500">Incomplete</span>
                      <span className="text-gray-300">|</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <CheckCircle2 size={14} className="text-green-600" />
                      <span className="font-semibold text-gray-900">{stats.complete}</span>
                      <span className="text-gray-500">Complete</span>
                      <span className="text-gray-300">|</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <AlertTriangle size={14} className="text-red-600" />
                      <span className="font-semibold text-gray-900">{stats.overdue}</span>
                      <span className="text-gray-500">Overdue</span>
                    </div>
                  </div>

                  {selectedTasks.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <button onClick={handleSelectAll} className="text-gray-700 hover:text-gray-900">Select All</button>
                        <span className="text-gray-400">|</span>
                        <button onClick={handleDeselectAll} className="text-gray-700 hover:text-gray-900">Deselect</button>
                      </div>
                      <div className="text-sm text-gray-700">
                        Selected: <span className="font-medium">{selectedTasks.length}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Right side buttons */}
                <div className="flex items-center gap-2">
                  {selectedTasks.length > 0 && (
                    <>
                      <button
                        onClick={handleBulkComplete}
                        className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-slate-600 hover:text-[#1c3b8d] rounded-lg font-medium transition text-sm"
                      >
                        <CheckCircle2 size={16} />
                        Mark Complete
                      </button>
                      <button
                        onClick={handleBulkIncomplete}
                        className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-slate-600 hover:text-[#1c3b8d] rounded-lg font-medium transition text-sm"
                      >
                        <RotateCw size={16} />
                        Mark Incomplete
                      </button>
                    </>
                  )}
                  
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0f204e] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
                    >
                      <RotateCw size={16} />
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead className="sticky bg-white z-30 border-b border-gray-200" style={{ top: `${actionBarHeight}px`, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  <tr>
                    <th className="px-4 py-2 border border-gray-200 text-center text-sm font-semibold text-gray-700 bg-white w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAll();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                        checked={selectedTasks.length === currentItems.length && currentItems.length > 0}
                        className="w-4 h-4 rounded accent-[#0f2a71] cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Task</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Person</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Due Date</span>
                        <FilterDropdown 
                          column="dueDate"
                          options={[
                            { value: 'All', label: 'All Dates' },
                            { value: 'Today', label: 'Today' },
                            { value: 'This Week', label: 'This Week' },
                            { value: 'This Month', label: 'This Month' },
                            { value: 'Overdue', label: 'Overdue' }
                          ]}
                          value={filterDueDate}
                          onChange={setFilterDueDate}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Priority</span>
                        <FilterDropdown 
                          column="priority"
                          options={[
                            { value: 'All', label: 'All Priorities' },
                            { value: 'High', label: 'High' },
                            { value: 'Medium', label: 'Medium' },
                            { value: 'Low', label: 'Low' }
                          ]}
                          value={filterPriority}
                          onChange={setFilterPriority}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Category</span>
                        <FilterDropdown 
                          column="category"
                          options={[
                            { value: 'All', label: 'All Categories' },
                            { value: 'Follow-up', label: 'Follow-up' },
                            { value: 'Shirt Payment', label: 'Shirt Payment' },
                            { value: 'Shirt Distribution', label: 'Shirt Distribution' },
                            { value: 'Shirt Print Request', label: 'Shirt Print Request' },
                            { value: 'General', label: 'General' }
                          ]}
                          value={filterCategory}
                          onChange={setFilterCategory}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Assigned To</span>
                        <FilterDropdown 
                          column="assignedTo"
                          options={[
                            { value: 'All', label: 'All Users' },
                            { value: 'me', label: 'Assigned to Me' },
                            ...availableUsers
                              .filter(user => user.id !== profile?.id)
                              .map(user => ({
                                value: user.id,
                                label: user.full_name
                              }))
                          ]}
                          value={filterAssignedTo}
                          onChange={setFilterAssignedTo}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Created By</span>
                        <FilterDropdown 
                          column="createdBy"
                          options={[
                            { value: 'All', label: 'All Users' },
                            { value: 'me', label: 'Created by Me' },
                            ...availableUsers
                              .filter(user => user.id !== profile?.id)
                              .map(user => ({
                                value: user.id,
                                label: user.full_name
                              }))
                          ]}
                          value={filterCreatedBy}
                          onChange={setFilterCreatedBy}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <FilterDropdown 
                          column="status"
                          options={[
                            { value: 'All', label: 'All Status' },
                            { value: 'Incomplete', label: 'Incomplete' },
                            { value: 'Complete', label: 'Complete' },
                            { value: 'Overdue', label: 'Overdue' }
                          ]}
                          value={filterStatus}
                          onChange={setFilterStatus}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((task, index) => (
                      <tr 
                        key={task.id} 
                        className={`hover:bg-blue-50 transition border-t-0 ${getRowBackgroundColor(task)} ${index % 2 === 1 && task.status !== 'complete' && new Date(task.due_date) >= new Date() ? 'bg-slate-50' : ''}`}
                      >
                        <td className="px-3 py-3 border-l border-r border-gray-200 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => handleSelectTask(task.id)}
                            className="w-4 h-4 rounded accent-[#0f2a71] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-left border-r">
                          <button
                            onClick={() => handleOpenNotesDialog(task)}
                            className="text-left w-full text-sm hover:text-blue-700 transition focus:outline-none"
                          >
                            <span className={task.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-900'}>
                              {task.note_text}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-left border-r">
                          <button
                            onClick={() => handleOpenPerson(task)}
                            className="text-sm text-[#001740] hover:text-blue-700 transition font-medium focus:outline-none"
                          >
                            {task.person_first_name} {task.person_last_name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-left border-r">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{formatDate(task.due_date)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center border-r">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                            <span>{getPriorityIcon(task.priority)}</span>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left border-r">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <Hash size={14} className="text-gray-400" />
                            {task.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left border-r">
                          <span className="text-sm text-gray-700">
                            {task.assigned_to || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left border-r">
                          <span className="text-sm text-gray-700">
                            {task.created_by_user ? task.created_by : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border-r">
                          <button
                            onClick={() => handleToggleComplete(task.id, task.status)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                              task.status === 'complete'
                                ? 'bg-green-600 text-white hover:bg-green-500'
                                : 'bg-yellow-500 text-white hover:bg-yellow-400'
                            }`}
                          >
                            {task.status === 'complete' ? '✓ Complete' : 'Incomplete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500">
                        No tasks found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
        </div>

        {/* Inline pagination when table doesn't overflow */}
        {!useFixedPagination && (
          <div className="mt-4">
            <Pagination
              totalItems={filteredAndSortedTasks.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}

        {/* Fixed pagination when table overflows */}
        {useFixedPagination && (
          <div ref={paginationRefEl} className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200">
            <Pagination
              totalItems={filteredAndSortedTasks.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
            aria-label="Back to top"
          >
            <ChevronUp size={24} />
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