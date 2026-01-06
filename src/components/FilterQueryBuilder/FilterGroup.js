import React from 'react';
import { Plus, X } from 'lucide-react';
import FilterCondition from './FilterCondition';

/**
 * FilterGroup Component
 * Represents a group of filter conditions with AND/OR logic
 */
export default function FilterGroup({
  group,
  viewType,
  onChange,
  onRemove,
  canRemove = false,
  isNested = false,
  people = [],
  peopleTaskInfo = {},
}) {
  const handleOperatorChange = (operator) => {
    onChange({
      ...group,
      operator,
    });
  };

  const handleConditionChange = (index, updatedCondition) => {
    const newConditions = [...group.conditions];
    newConditions[index] = updatedCondition;

    onChange({
      ...group,
      conditions: newConditions,
    });
  };

  const handleConditionRemove = (index) => {
    const newConditions = group.conditions.filter((_, i) => i !== index);

    onChange({
      ...group,
      conditions: newConditions,
    });
  };

  const handleAddCondition = () => {
    const newCondition = {
      id: `condition_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      label: 'New condition',
    };

    onChange({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  const handleNestedGroupChange = (index, updatedGroup) => {
    const newNestedGroups = [...(group.nestedGroups || [])];
    newNestedGroups[index] = updatedGroup;

    onChange({
      ...group,
      nestedGroups: newNestedGroups,
    });
  };

  const handleNestedGroupRemove = (index) => {
    const newNestedGroups = (group.nestedGroups || []).filter((_, i) => i !== index);

    onChange({
      ...group,
      nestedGroups: newNestedGroups,
    });
  };

  const handleAddNestedGroup = () => {
    if (isNested) {
      // Don't allow nesting more than one level deep
      return;
    }

    const newGroup = {
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
    };

    onChange({
      ...group,
      nestedGroups: [...(group.nestedGroups || []), newGroup],
    });
  };

  const operatorColor = group.operator === 'OR' ? 'purple' : 'blue';
  const borderColor = group.operator === 'OR' ? 'border-purple-300' : 'border-blue-300';
  const bgColor = group.operator === 'OR' ? 'bg-purple-50' : 'bg-blue-50';

  return (
    <div
      className={`
        p-4 rounded-lg border-2 ${borderColor} ${bgColor}
        ${isNested ? 'ml-4' : ''}
      `}
    >
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* AND/OR Toggle */}
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handleOperatorChange('AND')}
              className={`
                px-4 py-2 text-sm font-medium rounded-l-md border transition-colors
                ${group.operator === 'AND'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              AND
            </button>
            <button
              onClick={() => handleOperatorChange('OR')}
              className={`
                px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b transition-colors
                ${group.operator === 'OR'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              OR
            </button>
          </div>

          <span className="text-sm text-gray-600">
            {group.operator === 'AND'
              ? 'All conditions must match'
              : 'Any condition can match'}
          </span>
        </div>

        {/* Remove Group Button */}
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Remove group"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Conditions */}
      <div className="space-y-2 mb-3">
        {group.conditions.map((condition, index) => (
          <FilterCondition
            key={condition.id}
            condition={condition}
            viewType={viewType}
            onChange={(updated) => handleConditionChange(index, updated)}
            onRemove={() => handleConditionRemove(index)}
            canRemove={group.conditions.length > 1 || (group.nestedGroups?.length > 0)}
          />
        ))}
      </div>

      {/* Nested Groups */}
      {group.nestedGroups && group.nestedGroups.length > 0 && (
        <div className="space-y-3 mb-3">
          {group.nestedGroups.map((nestedGroup, index) => (
            <FilterGroup
              key={nestedGroup.id}
              group={nestedGroup}
              viewType={viewType}
              onChange={(updated) => handleNestedGroupChange(index, updated)}
              onRemove={() => handleNestedGroupRemove(index)}
              canRemove={true}
              isNested={true}
              people={people}
              peopleTaskInfo={peopleTaskInfo}
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAddCondition}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Condition
        </button>

        {!isNested && (
          <button
            onClick={handleAddNestedGroup}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        )}
      </div>
    </div>
  );
}
