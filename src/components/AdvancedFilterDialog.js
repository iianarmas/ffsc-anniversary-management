import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Filter } from 'lucide-react';
import SavedViewsPanel from './SavedViews/SavedViewsPanel';
import SaveViewDialog from './SavedViews/SaveViewDialog';
import QueryBuilderMain from './FilterQueryBuilder/QueryBuilderMain';
import { createSavedView, updateSavedView } from '../services/savedViews';
import { migrateFiltersIfNeeded } from '../utils/filterMigration';
import { supabase } from '../services/supabase';

/**
 * Enhanced Advanced Filter Dialog
 * Query builder and saved views for filtering
 */
export default function AdvancedFilterDialog({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  people = [],
  viewType = 'collections',
  peopleTaskInfo = {},
  initialFilters = null
}) {
  // Filter state - using new filter group format
  // Initialize with initialFilters if provided, otherwise use empty filter
  const [filterGroup, setFilterGroup] = useState(() => {
    if (initialFilters && (initialFilters.conditions || initialFilters.operator)) {
      return initialFilters;
    }
    return {
      id: `group_${Date.now()}`,
      operator: 'AND',
      conditions: [],
      nestedGroups: [],
    };
  });

  // UI states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingView, setEditingView] = useState(null);
  const [activeViewId, setActiveViewId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Ref for SavedViewsPanel to refresh after save
  const savedViewsPanelRef = useRef(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    if (isOpen) {
      getCurrentUser();
    }
  }, [isOpen]);

  // Sync with initialFilters when dialog opens
  useEffect(() => {
    if (isOpen && initialFilters && (initialFilters.conditions !== undefined || initialFilters.operator !== undefined)) {
      setFilterGroup(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleViewSelect = (view) => {
    setActiveViewId(view.id);

    // Migrate old filter format if needed
    const migratedFilters = migrateFiltersIfNeeded(view.filters);
    setFilterGroup(migratedFilters);
  };

  const handleSaveView = async (viewData) => {
    try {
      if (editingView) {
        // Update existing view
        await updateSavedView(editingView.id, {
          ...viewData,
          filters: filterGroup,
        });
      } else {
        // Create new view
        await createSavedView(
          {
            ...viewData,
            filters: filterGroup,
            viewType,
          },
          userId
        );
      }

      setShowSaveDialog(false);
      setEditingView(null);

      // Refresh saved views list to show the newly saved/updated view
      if (savedViewsPanelRef.current) {
        savedViewsPanelRef.current.refresh();
      }
    } catch (error) {
      console.error('Error saving view:', error);
      throw error;
    }
  };

  const handleEditView = (view) => {
    setEditingView(view);
    setShowSaveDialog(true);
  };

  const handleApply = () => {
    // Always apply advanced filter group
    onApplyFilters(filterGroup);
    onClose();
  };

  const handleClear = () => {
    const emptyFilter = {
      id: `group_${Date.now()}`,
      operator: 'AND',
      conditions: [],
      nestedGroups: [],
    };
    setFilterGroup(emptyFilter);
    setActiveViewId(null);

    // Notify parent to clear filters
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = useMemo(() => {
    return filterGroup.conditions.length > 0 || filterGroup.nestedGroups?.length > 0;
  }, [filterGroup]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#0f2a71]" />
              <h1 className="text-xl font-semibold text-[#0f2a71]">Advanced Filters</h1>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {/* Query Builder */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <QueryBuilderMain
                  filterGroup={filterGroup}
                  onChange={setFilterGroup}
                  viewType={viewType}
                  people={people}
                  peopleTaskInfo={peopleTaskInfo}
                  showPreview={true}
                />
              </div>
            </div>

            {/* Sidebar - Saved Views */}
            <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto p-4">
              <SavedViewsPanel
                ref={savedViewsPanelRef}
                viewType={viewType}
                people={people}
                peopleTaskInfo={peopleTaskInfo}
                userId={userId}
                onViewSelect={handleViewSelect}
                onCreateNew={() => {
                  setEditingView(null);
                  setShowSaveDialog(true);
                }}
                onEditView={handleEditView}
                activeViewId={activeViewId}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Clear All
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={!hasActiveFilters}
                className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save View
              </button>

              <button
                onClick={handleApply}
                className="px-6 py-2 text-sm bg-[#0f2a71] text-white rounded-md hover:bg-[#0f2a71]/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save View Dialog */}
      <SaveViewDialog
        isOpen={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false);
          setEditingView(null);
        }}
        onSave={handleSaveView}
        existingView={editingView}
        filterConfig={filterGroup}
      />
    </>
  );
}
