import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import ActionPresetCard from './ActionPresetCard';
import { ACTION_PRESETS, PRESET_CATEGORIES } from '../../constants/actionPresets';
import { applyFilterGroups } from '../../services/filterEngine';

/**
 * Action Presets Panel Component
 * Displays action-oriented filter presets organized by category
 */
export default function ActionPresetsPanel({
  people = [],
  peopleTaskInfo = {},
  onPresetSelect,
  activePresetId = null,
}) {
  // Calculate counts for all presets
  const presetCounts = useMemo(() => {
    const counts = {};

    Object.entries(ACTION_PRESETS).forEach(([presetId, preset]) => {
      const filtered = applyFilterGroups(people, preset.filterConfig, peopleTaskInfo);
      counts[presetId] = filtered.length;
    });

    return counts;
  }, [people, peopleTaskInfo]);

  // Group presets by category
  const categorizedPresets = useMemo(() => {
    const grouped = {};

    Object.values(ACTION_PRESETS).forEach(preset => {
      const category = preset.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(preset);
    });

    return grouped;
  }, []);

  // Get total actionable items (high urgency with count > 0)
  const actionableCount = useMemo(() => {
    return Object.entries(ACTION_PRESETS)
      .filter(([id, preset]) => preset.urgency === 'high' && presetCounts[id] > 0)
      .reduce((sum, [id]) => sum + presetCounts[id], 0);
  }, [presetCounts]);

  const handlePresetClick = (preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  return (
    <div className="action-presets-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>

        {/* Actionable Items Badge */}
        {actionableCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
            <span className="text-sm font-medium text-red-800">
              {actionableCount} urgent
            </span>
          </div>
        )}
      </div>

      {/* Presets by Category */}
      <div className="space-y-6">
        {/* Priority: Show high urgency items first */}
        {Object.entries(categorizedPresets).map(([category, presets]) => {
          // Filter to show only categories with items or high urgency
          const hasItems = presets.some(preset => presetCounts[preset.id] > 0);
          const hasUrgent = presets.some(preset => preset.urgency === 'high');

          if (!hasItems && !hasUrgent) return null;

          return (
            <div key={category}>
              {/* Category Header */}
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {category}
              </h3>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map(preset => (
                  <ActionPresetCard
                    key={preset.id}
                    preset={preset}
                    count={presetCounts[preset.id]}
                    onClick={handlePresetClick}
                    isActive={activePresetId === preset.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(categorizedPresets).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No action presets available</p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Click any preset to instantly apply that filter.
          These are pre-configured for common tasks.
        </p>
      </div>
    </div>
  );
}
