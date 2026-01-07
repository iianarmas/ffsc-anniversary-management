import React, { useState, useEffect, useMemo } from 'react';
import { BookmarkCheck, Search, Plus } from 'lucide-react';
import SavedViewCard from './SavedViewCard';
import ConfirmDialog from '../ConfirmDialog';
import { getSavedViews, updateViewUsage, toggleFavorite, deleteSavedView } from '../../services/savedViews';
import { applyFilterGroups } from '../../services/filterEngine';

/**
 * SavedViewsPanel Component
 * Displays and manages saved filter views
 */
const SavedViewsPanel = React.forwardRef(function SavedViewsPanel({
  viewType = 'collections',
  people = [],
  peopleTaskInfo = {},
  userId,
  onViewSelect,
  onCreateNew,
  onEditView,
  activeViewId = null,
}, ref) {
  const [savedViews, setSavedViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [viewToDelete, setViewToDelete] = useState(null);

  // Load saved views
  useEffect(() => {
    loadSavedViews();
  }, [viewType, userId]);

  const loadSavedViews = async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await getSavedViews(viewType, userId);

    if (error) {
      console.error('Error loading saved views:', error);
    } else {
      setSavedViews(data || []);
    }

    setLoading(false);
  };

  // Expose refresh method to parent via ref
  React.useImperativeHandle(ref, () => ({
    refresh: loadSavedViews
  }));

  // Calculate counts for all saved views
  const viewCounts = useMemo(() => {
    const counts = {};

    savedViews.forEach(view => {
      try {
        const filtered = applyFilterGroups(people, view.filters, peopleTaskInfo);
        counts[view.id] = filtered.length;
      } catch (error) {
        console.error(`Error calculating count for view ${view.id}:`, error);
        counts[view.id] = 0;
      }
    });

    return counts;
  }, [savedViews, people, peopleTaskInfo]);

  // Filter views by search query
  const filteredViews = useMemo(() => {
    if (!searchQuery) return savedViews;

    const query = searchQuery.toLowerCase();
    return savedViews.filter(view =>
      view.name.toLowerCase().includes(query) ||
      (view.description && view.description.toLowerCase().includes(query))
    );
  }, [savedViews, searchQuery]);

  // Group views: Favorites → My Views → Team Views
  const groupedViews = useMemo(() => {
    const favorites = filteredViews.filter(v => v.is_favorite);
    const myViews = filteredViews.filter(v => !v.is_favorite && v.created_by === userId);
    const teamViews = filteredViews.filter(v => v.created_by !== userId);

    return {
      favorites,
      myViews,
      teamViews,
    };
  }, [filteredViews, userId]);

  const handleViewSelect = async (view) => {
    // Update usage statistics
    await updateViewUsage(view.id);

    // Reload views to reflect updated usage
    loadSavedViews();

    if (onViewSelect) {
      onViewSelect(view);
    }
  };

  const handleToggleFavorite = async (view) => {
    const { data, error } = await toggleFavorite(view.id);

    if (error) {
      console.error('Error toggling favorite:', error);
    } else {
      // Update local state
      setSavedViews(prev =>
        prev.map(v => (v.id === view.id ? { ...v, is_favorite: !v.is_favorite } : v))
      );
    }
  };

  const handleDeleteView = (view) => {
    setViewToDelete(view);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!viewToDelete) return;

    const { success, error } = await deleteSavedView(viewToDelete.id);

    if (error) {
      console.error('Error deleting view:', error);
      alert('Failed to delete view. Please try again.');
    } else {
      // Remove from local state
      setSavedViews(prev => prev.filter(v => v.id !== viewToDelete.id));
    }

    setViewToDelete(null);
  };

  if (loading) {
    return (
      <div className="saved-views-panel p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-views-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-[#0f2a71]" />
          <h2 className="text-lg font-semibold text-[#0f2a71]">Saved Views</h2>
        </div>

        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0f2a71] text-white rounded-md hover:bg-[#0f2a71]/90 transition-colors"
          title="Create new saved view"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Search */}
      {savedViews.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved views..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f2a71] text-sm"
          />
        </div>
      )}

      {/* Grouped Views */}
      <div className="space-y-6">
        {/* Favorites */}
        {groupedViews.favorites.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#0f2a71] mb-2 flex items-center gap-1">
              <BookmarkCheck className="w-4 h-4" />
              Favorites
            </h3>
            <div className="space-y-2">
              {groupedViews.favorites.map(view => (
                <SavedViewCard
                  key={view.id}
                  view={view}
                  count={viewCounts[view.id]}
                  isActive={activeViewId === view.id}
                  onApply={handleViewSelect}
                  onEdit={onEditView}
                  onDelete={handleDeleteView}
                  onToggleFavorite={handleToggleFavorite}
                  canEdit={view.created_by === userId}
                />
              ))}
            </div>
          </div>
        )}

        {/* My Views */}
        {groupedViews.myViews.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#0f2a71] mb-2">My Views</h3>
            <div className="space-y-2">
              {groupedViews.myViews.map(view => (
                <SavedViewCard
                  key={view.id}
                  view={view}
                  count={viewCounts[view.id]}
                  isActive={activeViewId === view.id}
                  onApply={handleViewSelect}
                  onEdit={onEditView}
                  onDelete={handleDeleteView}
                  onToggleFavorite={handleToggleFavorite}
                  canEdit={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Team Views */}
        {groupedViews.teamViews.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#0f2a71] mb-2">Team Views</h3>
            <div className="space-y-2">
              {groupedViews.teamViews.map(view => (
                <SavedViewCard
                  key={view.id}
                  view={view}
                  count={viewCounts[view.id]}
                  isActive={activeViewId === view.id}
                  onApply={handleViewSelect}
                  onEdit={onEditView}
                  onDelete={handleDeleteView}
                  onToggleFavorite={handleToggleFavorite}
                  canEdit={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {savedViews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BookmarkCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="mb-2">No saved views yet</p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-[#0f2a71] text-white rounded-md hover:bg-[#0f2a71]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First View
          </button>
        </div>
      )}

      {/* No Search Results */}
      {savedViews.length > 0 && filteredViews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No views match "{searchQuery}"</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setViewToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Saved View"
        message={`Are you sure you want to delete "${viewToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
});

export default SavedViewsPanel;
