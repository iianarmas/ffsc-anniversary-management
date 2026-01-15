import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, XCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../../services/financeService';

export default function CategoryManager({ categories, onClose, onRefresh }) {
  const { profile } = useAuth();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await addExpenseCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim()
      }, profile.id);

      setNewCategoryName('');
      setNewCategoryDesc('');
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDesc(category.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  };

  const handleUpdateCategory = async (id) => {
    if (!editName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await updateExpenseCategory(id, {
        name: editName.trim(),
        description: editDesc.trim()
      });

      cancelEditing();
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    setError('');

    try {
      await deleteExpenseCategory(id);
      setDeleteConfirm(null);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Manage Expense Categories</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="p-4 bg-gray-50 rounded-lg space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Add New Category</h3>
            <div>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name (e.g., Venue, Food, Prizes)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
              />
            </div>
            <div>
              <input
                type="text"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newCategoryName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] text-white rounded-lg hover:bg-[#0a1d4a] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add Category
            </button>
          </form>

          {/* Categories List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Existing Categories ({categories.length})</h3>

            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No categories created yet</p>
            ) : (
              <div className="space-y-2">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    {editingId === category.id ? (
                      // Edit Mode
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateCategory(category.id)}
                            disabled={loading || !editName.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition disabled:opacity-50"
                          >
                            <Check size={14} />
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition"
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500">{category.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(category)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(category.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Done
          </button>
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this category? Expenses in this category will become uncategorized.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCategory(deleteConfirm)}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
