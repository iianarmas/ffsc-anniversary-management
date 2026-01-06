import React, { useMemo } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import FilterGroup from './FilterGroup';
import { applyFilterGroups } from '../../services/filterEngine';

/**
 * QueryBuilderMain Component
 * Main container for the visual query builder
 */
export default function QueryBuilderMain({
  filterGroup,
  onChange,
  viewType = 'collections',
  people = [],
  peopleTaskInfo = {},
  showPreview = true,
}) {
  // Calculate matched count in real-time
  const matchedCount = useMemo(() => {
    if (!filterGroup || !filterGroup.conditions || filterGroup.conditions.length === 0) {
      return people.length;
    }

    try {
      const filtered = applyFilterGroups(people, filterGroup, peopleTaskInfo);
      return filtered.length;
    } catch (error) {
      console.error('Error applying filters:', error);
      return 0;
    }
  }, [filterGroup, people, peopleTaskInfo]);

  const handleReset = () => {
    onChange({
      id: `group_${Date.now()}`,
      operator: 'AND',
      conditions: [
        {
          id: `condition_${Date.now()}`,
          field: '',
          operator: 'equals',
          value: '',
          label: 'New condition',
        },
      ],
      nestedGroups: [],
    });
  };

  const hasActiveFilters = filterGroup?.conditions?.some(c => c.field !== '') ||
                          filterGroup?.nestedGroups?.length > 0;

  return (
    <div className="query-builder-main">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#0f2a71]" />
          <h3 className="text-lg font-semibold text-[#0f2a71]">Query Builder</h3>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#0f2a71] hover:bg-gray-100 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Filter Group */}
      {filterGroup && (
        <FilterGroup
          group={filterGroup}
          viewType={viewType}
          onChange={onChange}
          canRemove={false}
          isNested={false}
          people={people}
          peopleTaskInfo={peopleTaskInfo}
        />
      )}

      {/* Preview */}
      {showPreview && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0f2a71]">Preview</p>
              <p className="text-2xl font-bold text-[#0f2a71]">
                {matchedCount.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-2">
                  / {people.length.toLocaleString()} people
                </span>
              </p>
            </div>

            {/* Percentage Indicator */}
            <div className="text-right">
              <p className="text-sm text-[#0f2a71]">Match Rate</p>
              <p className="text-xl font-semibold text-[#0f2a71]">
                {people.length > 0
                  ? Math.round((matchedCount / people.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0f2a71] transition-all duration-300"
              style={{
                width: people.length > 0
                  ? `${(matchedCount / people.length) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-[#0f2a71]">
          💡 <strong>Tip:</strong> Use <strong>AND</strong> when all conditions must be true.
          Use <strong>OR</strong> when any condition can be true.
          You can nest groups for complex queries like: (A AND B) OR (C AND D)
        </p>
      </div>
    </div>
  );
}
