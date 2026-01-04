import React, { useEffect, useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, AlertTriangle, CalendarDays, Hash, Circle, RotateCw, User, Lock } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackButton';
import { fetchNotesForPerson, createNote, updateNote, deleteNote, deletePerson, getUsersForTaskAssignment, supabase, updateAttendanceStatus } from '../services/api';
import { useAuth } from './auth/AuthProvider';
import shirtMale from '../assets/images/shirt-male.png';
import shirtFemale from '../assets/images/shirt-female.png';
import SuccessDialog from './SuccessDialog';
import ErrorDialog from './ErrorDialog';

export default function AccountSidebar({ person, open, onClose, onNotesUpdate }) {
  const [localAttendanceStatus, setLocalAttendanceStatus] = useState(person?.attendanceStatus || 'attending');

  // Handle back button
  useBackHandler(open, onClose);
  
  // Update local state when person prop changes
  useEffect(() => {
    if (person?.attendanceStatus) {
      setLocalAttendanceStatus(person.attendanceStatus);
    }
  }, [person?.attendanceStatus]);
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [createdByName, setCreatedByName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '' });
  
  // Task-related states
  const [isTask, setIsTask] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const { profile } = useAuth();
  const [assignedToUser, setAssignedToUser] = useState(profile?.id || '');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [recurrence, setRecurrence] = useState('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Load available users for task assignment
  useEffect(() => {
    const loadUsers = async () => {
      const users = await getUsersForTaskAssignment();
      setAvailableUsers(users);
    };
    if (open) {
      loadUsers();
    }
  }, [open]);

  // Reset assigned user to current user when opening
  useEffect(() => {
    if (open && profile?.id) {
      setAssignedToUser(profile.id);
    }
  }, [open, profile?.id]);

  // Load notes when sidebar opens or person changes
  useEffect(() => {
    if (open && person?.id) {
      loadNotes();
    }
  }, [open, person?.id]);

  // Load creator information when sidebar opens
  useEffect(() => {
    const loadCreatorInfo = async () => {
      if (!person?.id) return;
      
      try {
        // Fetch person with creator info
        const { data, error } = await supabase
          .from('people')
          .select(`
            created_at,
            created_by,
            profiles!people_created_by_fkey (
              full_name
            )
          `)
          .eq('id', person.id)
          .single();
        
        if (error) {
          console.error('Error fetching creator info:', error);
          // Try fallback without the profiles join
          const { data: personData, error: personError } = await supabase
            .from('people')
            .select('created_at, created_by')
            .eq('id', person.id)
            .single();
            
          if (!personError && personData) {
            setCreatedAt(personData.created_at);
            // If we have created_by ID, try to fetch the profile separately
            if (personData.created_by) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', personData.created_by)
                .single();
              
              const creatorName = profileData?.full_name || 'Unknown';
              const isAdmin = profileData?.role === 'admin';
              
              // Admin shows name + date, Committee shows only name
              setCreatedByName(isAdmin ? 'Admin' : creatorName);
            } else {
              setCreatedByName('System');
            }
          }
          return;
        }
        
        if (data) {
          const creatorRole = data.profiles?.role;
          const creatorName = data.profiles?.full_name || 'Unknown';
          const isAdmin = creatorRole === 'admin';
          
          // Admin shows name + date, Committee/others show only name (no date)
          setCreatedByName(isAdmin ? 'Admin' : creatorName);
          
          // Only show created_at date if created by admin
          setCreatedAt(isAdmin ? data.created_at : null);
        }
      } catch (error) {
        console.error('Error loading creator info:', error);
        // Set defaults
        setCreatedAt(person.createdAt || person.timestamp || '');
        setCreatedByName('Unknown');
      }
    };
    
    if (open && person?.id) {
      loadCreatorInfo();
    }
  }, [open, person?.id]);

  const loadNotes = async () => {
    if (!person?.id) return;
    setIsLoadingNotes(true);
    const notesData = await fetchNotesForPerson(person.id);
    setNotes(notesData);
    setIsLoadingNotes(false);
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !person?.id) return;
    try {
      const taskData = isTask ? {
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        priority,
        category,
        assignedTo: availableUsers.find(u => u.id === assignedToUser)?.full_name || profile?.full_name || 'Admin',
        assignedToUser: assignedToUser,
        createdByUser: profile?.id,
        recurrence,
        recurrenceEndDate: recurrence !== 'none' ? recurrenceEndDate : null
      } : {};
      
      await createNote(person.id, newNoteText.trim(), profile?.full_name || 'Admin', isTask, taskData);
      
      // Reset form
      setNewNoteText('');
      setIsTask(false);
      setDueDate('');
      setPriority('Medium');
      setCategory('General');
      setRecurrence('none');
      setRecurrenceEndDate('');
      setAssignedToUser(profile?.id || '');
      
      await loadNotes();
      
      // Notify parent component to refresh
      if (onNotesUpdate) {
        onNotesUpdate();
      }
      
      // Show success dialog
      setSuccessDialog({
        isOpen: true,
        title: isTask ? 'Task Created!' : 'Note Added!',
        message: isTask 
          ? `Task has been successfully created and assigned to ${availableUsers.find(u => u.id === assignedToUser)?.full_name || 'the team member'}.`
          : 'Your note has been successfully saved.'
      });
    } catch (error) {
      console.error('Failed to add note:', error);
      // Show error dialog
      setErrorDialog({
        isOpen: true,
        title: isTask ? 'Failed to Create Task' : 'Failed to Add Note',
        message: 'There was an error saving your note. Please try again.'
      });
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note_text);
  };

  const handleSaveEdit = async () => {
    if (!editingNoteText.trim()) return;
    try {
      await updateNote(editingNoteId, editingNoteText.trim());
      setEditingNoteId(null);
      setEditingNoteText('');
      await loadNotes();
      
      if (onNotesUpdate) {
        onNotesUpdate();
      }
    } catch (error) {
      alert('Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const handleDeleteNote = (noteId) => {
    setDeletingNoteId(noteId);
    setShowDeleteNoteDialog(true);
  };

  const confirmDeleteNote = async () => {
    if (!deletingNoteId) return;
    try {
      await deleteNote(deletingNoteId);
      await loadNotes();
      setShowDeleteNoteDialog(false);
      setDeletingNoteId(null);
      
      if (onNotesUpdate) {
        onNotesUpdate();
      }
    } catch (error) {
      alert('Failed to delete note');
    }
  };

  const formatNoteDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleDeletePerson = async () => {
    if (!person?.id) return;
    try {
      await deletePerson(person.id);
      setShowDeleteDialog(false);
      onClose();
      // You might want to refresh the people list here
      // by calling a refresh function passed as prop
    } catch (error) {
      alert('Failed to delete person. Please try again.');
    }
  };


  // For animation: always render, but visually hide when not open

  const getBadge = (text, color = 'bg-gray-100 text-gray-800') => (
    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${color}`}>{text}</span>
  );

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(d);
    }
  };

  const formatContactNumber = (number) => {
    if (!number) return '—';
    // Remove any non-digit characters
    const cleaned = String(number).replace(/\D/g, '');
    
    // If it starts with 9 and is 10 digits, add 0 in front
    let formatted = cleaned;
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      formatted = '0' + cleaned;
    }
    
    // Format as (09xx) xxx-xxxx
    if (formatted.length === 11) {
      return `(${formatted.substring(0, 4)}) ${formatted.substring(4, 7)}-${formatted.substring(7)}`;
    }
    
    // Return original if format doesn't match
    return number;
  };

  return (
    <>
      {/* Backdrop overlay - only render when open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-100"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel, slide in/out from right */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-3/5 md:w-2/5 lg:w-2/5 bg-white border-l border-gray-200 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        style={{ willChange: 'transform' }}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{person ? `${person.firstName} ${person.lastName}` : 'Person'}</h3>
              <div className="mt-1 text-sm text-gray-500">Account details</div>
            </div>
            <div className="flex items-center gap-3">
              {person && person.registered ? getBadge('Checked In', 'bg-green-700 text-white') : getBadge('Pending', 'bg-yellow-500 text-white')}
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-gray-100 focus:outline-none"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Delete Person Button */}
          {profile?.role === 'admin' ? (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-sm"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          ) : (
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium text-sm cursor-not-allowed"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10">
                Only administrators can delete accounts. Please contact an admin if you need to delete this account.
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="p-6 pb-24">
          <div className="flex flex-col gap-6">
            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Side - Person Details */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">First name</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.firstName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last name</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.lastName || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Age</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.age ?? '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Age bracket</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.ageBracket || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.gender || '—'}</div>
                  </div>

                  {profile?.role !== 'viewer' && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Number</div>
                      <div className="text-sm text-gray-900 font-medium">{formatContactNumber(person?.contactNumber)}</div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.location || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Shirt Image with Details Box */}
              <div className="w-full lg:w-auto lg:max-w-[240px] xl:max-w-[280px] flex-shrink-0">
                {/* Shirt Image */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden p-2 mb-3">
                  {person?.gender ? (
                    <img 
                      src={person.gender === 'Male' ? shirtMale : shirtFemale}
                      alt={`${person.gender} shirt design`}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="text-center px-2 py-8">
                      <div className="text-xs text-gray-500">Shirt image</div>
                      <div className="text-xs text-gray-400 mt-2">No gender specified</div>
                    </div>
                  )}
                </div>
                
                {/* Shirt Details Box */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Shirt Information</div>
                  
                  {person?.registered && person?.registeredAt && (
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-blue-200">
                      <span className="text-blue-700">Registered:</span>
                      <span className="text-blue-900 font-medium">
                        {new Date(person?.registeredAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">Size:</span>
                    <span className="text-blue-900 font-semibold">
                      {person?.shirtSize || 'Not set'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">Print:</span>
                    {person?.hasPrint ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">With Print</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-400 text-white">Plain</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">Payment:</span>
                    {person?.paid ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">Paid</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">Unpaid</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">Status:</span>
                    {person?.shirtGiven ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">Given</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Status Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Attendance Status</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg transition ${
                  localAttendanceStatus === 'attending'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${(profile?.role === 'viewer' || profile?.role === 'encoder') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="attendanceStatus"
                    value="attending"
                    checked={localAttendanceStatus === 'attending'}
                    onChange={async (e) => {
                      if (profile?.role === 'viewer' || profile?.role === 'encoder') return;
                      setLocalAttendanceStatus('attending');
                      const result = await updateAttendanceStatus(person.id, 'attending');
                      if (result.success) {
                        window.dispatchEvent(new Event('registrationUpdated'));
                      }
                    }}
                    disabled={profile?.role === 'viewer' || profile?.role === 'encoder'}
                    className="w-4 h-4 accent-green-600 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">Attending Event</div>
                    <div className="text-xs text-gray-500">Will be present at the event</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg transition ${
                  localAttendanceStatus === 'shirt_only'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${(profile?.role === 'viewer' || profile?.role === 'encoder') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="attendanceStatus"
                    value="shirt_only"
                    checked={localAttendanceStatus === 'shirt_only'}
                    onChange={async (e) => {
                      if (profile?.role === 'viewer' || profile?.role === 'encoder') return;
                      setLocalAttendanceStatus('shirt_only');
                      const result = await updateAttendanceStatus(person.id, 'shirt_only');
                      if (result.success) {
                        window.dispatchEvent(new Event('registrationUpdated'));
                      }
                    }}
                    disabled={profile?.role === 'viewer' || profile?.role === 'encoder'}
                    className="w-4 h-4 accent-purple-600 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">Shirt Order Only</div>
                    <div className="text-xs text-gray-500">Not attending the event</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Account Creation Info */}
            <div className="pt-4 border-t border-gray-100">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-900 font-semibold mb-2">Account Information</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-blue-700">Created by</div>
                    <div className="text-sm text-blue-900 font-medium">{createdByName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-700">Created on</div>
                    <div className="text-sm text-blue-900 font-medium">
                      {createdAt ? formatDate(createdAt) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Actions */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes & Actions</h4>
              
              {/* Check if viewer - show restricted message */}
              {profile?.role === 'viewer' ? (
                <div className="text-center py-12 px-4">
                  <div className="mb-4">
                    <Lock size={48} className="mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You don't have permission to view or manage notes and tasks. This feature is only available to Committee members and Administrators.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                    <p className="text-xs text-blue-900 font-medium mb-1">Need access?</p>
                    <p className="text-xs text-blue-800">
                      Contact your administrator to request Committee or Admin permissions.
                    </p>
                  </div>
                </div>
              ) : (
                <>
              {/* Add Note/Task Input */}
              <div className="mb-4">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add a note or task..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] text-sm resize-none"
                  rows={2}
                />
                
                {/* Mark as Task Checkbox */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="markAsTask"
                    checked={isTask}
                    onChange={(e) => setIsTask(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0f2a71] cursor-pointer"
                  />
                  <label htmlFor="markAsTask" className="text-sm text-gray-700 cursor-pointer">
                    Mark as task
                  </label>
                </div>
                
                {/* Task Fields (show only if isTask is true) */}
                {isTask && (
                  <div className="mt-3 space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Due Date</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a71]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a71]"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a71]"
                      >
                        <option value="General">General</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Shirt Payment">Shirt Payment</option>
                        <option value="Shirt Distribution">Shirt Distribution</option>
                        <option value="Shirt Print Request">Shirt Print Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                        <User size={12} />
                        Assign To
                      </label>
                      <select
                        value={assignedToUser}
                        onChange={(e) => setAssignedToUser(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a71]"
                      >
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} {user.id === profile?.id ? '(You)' : ''} - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Recurrence</label>
                        <select
                          value={recurrence}
                          onChange={(e) => setRecurrence(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a71]"
                        >
                          <option value="none">None</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      {recurrence !== 'none' && (
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Until</label>
                          <input
                            type="date"
                            value={recurrenceEndDate}
                            onChange={(e) => setRecurrenceEndDate(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a71]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="mt-2 w-full px-4 py-2 bg-[#001740] text-white text-sm rounded-lg hover:bg-[#0f2a71] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <Plus size={16} />
                  {isTask ? 'Add Task' : 'Add Note'}
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {isLoadingNotes ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet. Add one above!</p>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className={`rounded-lg p-3 bg-white ${
                      note.is_task 
                        ? note.priority === 'High' 
                          ? 'border-l-4 border-l-red-600' 
                          : note.priority === 'Medium'
                            ? 'border-l-4 border-l-orange-500'
                            : 'border-l-4 border-l-green-600'
                        : 'border-l-4 border-l-gray-400'
                    } shadow-sm`}>
                      {editingNoteId === note.id ? (
                        // Edit Mode
                        <div className="space-y-2">
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] text-sm"
                            rows="3"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded flex items-center gap-1"
                            >
                              <XCircle size={14} />
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 text-sm bg-[#001740] text-white rounded hover:bg-[#0f2a71] flex items-center gap-1"
                            >
                              <Save size={14} />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">{note.created_by}</span>
                              {note.updated_at && note.updated_by && (
                                <span className="ml-2">(edited by {note.updated_by})</span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="p-1 text-gray-500 hover:text-[#0f2a71] hover:bg-gray-200 rounded"
                                title="Edit note"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete note"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm whitespace-pre-wrap ${note.is_task && note.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {note.note_text}
                          </p>
                          {note.is_task && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white border">
                                <CalendarDays size={12} className="text-gray-500" />
                                {note.due_date ? new Date(note.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                note.priority === 'High' ? 'bg-red-100 text-red-800' :
                                note.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                <Circle size={10} className={note.priority === 'High' ? 'fill-red-500 stroke-none' : note.priority === 'Medium' ? 'fill-yellow-500 stroke-none' : 'fill-green-500 stroke-none'} />
                                {note.priority}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white border">
                                <Hash size={12} className="text-gray-500" />
                                {note.category}
                              </span>
                              {note.status === 'complete' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  ✓ Complete
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            {formatNoteDate(note.updated_at || note.created_at)}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              </>
            )}
            </div>

          </div>
          </div>
        </div>
      </aside>

      {/* Modern Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            </div>
            
            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Person?
              </h3>
              <p className="text-gray-600 mb-1">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{person?.firstName} {person?.lastName}</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This will permanently delete all their data including registration, shirt info, and notes. This action cannot be undone.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePerson}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Modern Delete Note Confirmation Dialog */}
      {showDeleteNoteDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteNoteDialog(false);
              setDeletingNoteId(null);
            }}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={28} className="text-orange-600" />
              </div>
            </div>
            
            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Note?
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteNoteDialog(false);
                  setDeletingNoteId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNote}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ isOpen: false, title: '', message: '' })}
        title={successDialog.title}
        message={successDialog.message}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, title: '', message: '' })}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </>
  );
}
