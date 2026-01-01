import React, { useState, useEffect } from 'react';
import { X, StickyNote, Trash2, Edit2, Plus } from 'lucide-react';
import { fetchNotesForPerson, createNote, updateNote, deleteNote } from '../services/api';

export default function NotesDialog({ person, isOpen, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

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
      await createNote(person.id, newNoteText.trim());
      setNewNoteText('');
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
      await updateNote(noteId, editingText.trim());
      setEditingNoteId(null);
      setEditingText('');
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
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
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
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition group"
                >
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        autoFocus
                      />
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
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-gray-800 flex-1">{note.note_text}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingText(note.note_text);
                            }}
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
                      <div className="flex items-center gap-2 text-xs text-gray-500">
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

        {/* Add Note Section */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex gap-2">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddNote();
                }
              }}
              placeholder="Add a note... (Ctrl+Enter to save)"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
            <button
              onClick={handleAddNote}
              disabled={loading || !newNoteText.trim()}
              className="px-4 py-2 bg-[#0f2a71] text-white rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} />
              Add
            </button>
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