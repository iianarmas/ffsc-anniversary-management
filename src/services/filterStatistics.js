/**
 * Filter Statistics Calculator
 * Calculates real-time counts for filter options to help users understand data distribution
 */

import { getFieldValue } from './filterEngine';
import { getFilterFieldsForView } from '../constants/filterFields';

/**
 * Calculate statistics for all filter options
 * Returns counts for each field's available options
 *
 * @param {Array} people - Array of person objects
 * @param {Object} currentFilters - Currently applied filters (to show refined counts)
 * @param {string} viewType - View type ('shirts', 'registration', 'collections')
 * @param {Object} peopleTaskInfo - Task information for people
 * @returns {Object} Statistics object with counts for each field option
 */
export function calculateFilterStats(people, currentFilters = null, viewType = 'collections', peopleTaskInfo = {}) {
  const filterFields = getFilterFieldsForView(viewType);
  const stats = {};

  Object.entries(filterFields).forEach(([fieldKey, fieldDef]) => {
    if (fieldDef.type === 'select' || fieldDef.type === 'multiSelect') {
      stats[fieldKey] = {};

      // Calculate count for each option
      fieldDef.options.forEach(option => {
        const count = people.filter(person => {
          const value = getFieldValue(person, fieldKey, peopleTaskInfo);
          return value === option.value;
        }).length;

        stats[fieldKey][option.value] = count;
      });
    } else if (fieldDef.type === 'boolean') {
      // Count true/false for boolean fields
      const trueCount = people.filter(person => {
        const value = getFieldValue(person, fieldKey, peopleTaskInfo);
        return value === true;
      }).length;

      stats[fieldKey] = {
        true: trueCount,
        false: people.length - trueCount,
      };
    } else if (fieldDef.type === 'range') {
      // Calculate min, max, and average for range fields
      const values = people.map(person => {
        const value = getFieldValue(person, fieldKey, peopleTaskInfo);
        return Number(value) || 0;
      }).filter(v => v > 0);

      if (values.length > 0) {
        stats[fieldKey] = {
          min: Math.min(...values),
          max: Math.max(...values),
          average: values.reduce((a, b) => a + b, 0) / values.length,
          count: values.length,
        };
      } else {
        stats[fieldKey] = {
          min: 0,
          max: 0,
          average: 0,
          count: 0,
        };
      }
    }
  });

  return stats;
}

/**
 * Get count for a specific filter option
 * Useful for real-time updates when building filters
 *
 * @param {Array} people - Array of person objects
 * @param {string} field - Field name
 * @param {*} option - Option value to count
 * @param {Object} existingFilters - Existing filters to apply before counting
 * @param {Object} peopleTaskInfo - Task information
 * @returns {number} Count of people matching the option
 */
export function getOptionCount(people, field, option, existingFilters = null, peopleTaskInfo = {}) {
  // TODO: Apply existing filters first if provided
  // For now, just count without considering existing filters

  return people.filter(person => {
    const value = getFieldValue(person, field, peopleTaskInfo);
    return value === option;
  }).length;
}

/**
 * Debounced version of calculateFilterStats
 * Prevents excessive recalculation during rapid filter changes
 */
let statsCalculationTimeout = null;

export function calculateFilterStatsDebounced(people, currentFilters, viewType, peopleTaskInfo, callback, delay = 300) {
  if (statsCalculationTimeout) {
    clearTimeout(statsCalculationTimeout);
  }

  statsCalculationTimeout = setTimeout(() => {
    const stats = calculateFilterStats(people, currentFilters, viewType, peopleTaskInfo);
    callback(stats);
  }, delay);
}

/**
 * Get distribution breakdown for a field
 * Returns array of { label, value, count, percentage }
 *
 * @param {Array} people - Array of person objects
 * @param {string} field - Field name
 * @param {Object} fieldDef - Field definition from filterFields
 * @param {Object} peopleTaskInfo - Task information
 * @returns {Array} Distribution array
 */
export function getFieldDistribution(people, field, fieldDef, peopleTaskInfo = {}) {
  const total = people.length;

  if (fieldDef.type === 'select' || fieldDef.type === 'multiSelect') {
    return fieldDef.options.map(option => {
      const count = people.filter(person => {
        const value = getFieldValue(person, field, peopleTaskInfo);
        return value === option.value;
      }).length;

      return {
        label: option.label,
        value: option.value,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      };
    });
  }

  return [];
}

/**
 * Calculate summary statistics for current filter results
 * Shows total count, percentage of dataset, and key breakdowns
 *
 * @param {Array} filteredPeople - Filtered results
 * @param {Array} allPeople - Complete dataset
 * @param {Object} peopleTaskInfo - Task information
 * @returns {Object} Summary statistics
 */
export function calculateFilterSummary(filteredPeople, allPeople, peopleTaskInfo = {}) {
  const total = allPeople.length;
  const filtered = filteredPeople.length;

  // Calculate key metrics
  const paidCount = filteredPeople.filter(p => p.paid).length;
  const unpaidCount = filtered - paidCount;

  const withSizeCount = filteredPeople.filter(p =>
    p.shirtSize && p.shirtSize !== '' && p.shirtSize !== 'No shirt' && p.shirtSize !== 'Select Size'
  ).length;

  const givenCount = filteredPeople.filter(p => p.shirtGiven).length;

  const hasTasksCount = filteredPeople.filter(p => {
    const taskInfo = peopleTaskInfo[p.id] || {};
    return taskInfo.hasTasks;
  }).length;

  return {
    total,
    filtered,
    percentage: total > 0 ? (filtered / total) * 100 : 0,
    breakdown: {
      paid: paidCount,
      unpaid: unpaidCount,
      withSize: withSizeCount,
      missingSize: filtered - withSizeCount,
      given: givenCount,
      pending: filtered - givenCount,
      hasTasks: hasTasksCount,
    },
  };
}

/**
 * Calculate preset action counts
 * Used to show real-time counts on action preset cards
 *
 * @param {Array} people - Array of person objects
 * @param {Object} preset - Preset configuration
 * @param {Object} peopleTaskInfo - Task information
 * @returns {number} Count of people matching the preset
 */
export function calculatePresetCount(people, preset, peopleTaskInfo = {}) {
  if (!preset || !preset.filterConfig) return 0;

  // Use the filter engine to apply preset filters
  const { applyFilterGroups } = require('./filterEngine');
  const filtered = applyFilterGroups(people, preset.filterConfig, peopleTaskInfo);

  return filtered.length;
}
