import React, { useEffect, useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, AlertTriangle } from 'lucide-react';
import { fetchNotesForPerson, createNote, updateNote, deleteNote, deletePerson } from '../services/api';
import shirtMale from '../assets/images/shirt-male.png';
import shirtFemale from '../assets/images/shirt-female.png';

export default function AccountSidebar({ person, open, onClose }) {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  // Load notes when person changes
  useEffect(() => {
    if (person?.id && open) {
      loadNotes();
    }
  }, [person?.id, open]);

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
      await createNote(person.id, newNoteText.trim());
      setNewNoteText('');
      await loadNotes();
    } catch (error) {
      alert('Failed to add note');
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

  return (
    <>
      {/* backdrop overlay */}
      {/* Backdrop overlay, fade in/out */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Sidebar panel, slide in/out from right */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-3/5 md:w-2/5 lg:w-2/5 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
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
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="p-6 pb-24">
          <div className="flex flex-col gap-6">
            <div className="flex gap-6 items-start">
              <div className="flex-1">
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

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contact Number</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.contactNumber || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.location || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Timestamp</div>
                    <div className="text-sm text-gray-900 font-medium">{formatDate(person?.registeredAt || person?.createdAt || person?.timestamp)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Shirt size</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.shirtSize || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment status</div>
                    <div className="text-sm text-gray-900 font-medium">
                      {person?.paid ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Unpaid</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distribution status</div>
                    <div className="text-sm text-gray-900 font-medium">
                      {person?.shirtGiven ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Given</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shirt Image - Right Side */}
              <div className="w-full max-w-[280px] flex-shrink-0">
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden p-2">
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
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {person?.gender ? `${person.gender} shirt design` : 'Shirt preview'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes & Actions</h4>
              
              {/* Add Note Input */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] text-sm"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 bg-[#001740] text-white text-sm rounded-lg hover:bg-[#0f2a71] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {isLoadingNotes ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet. Add one above!</p>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
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
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.note_text}</p>
                          <div className="text-xs text-gray-400 mt-2">
                            {formatNoteDate(note.updated_at || note.created_at)}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
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
    </>
  );
}
