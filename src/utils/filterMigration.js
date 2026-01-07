/**
 * Filter Migration Utility
 * Handles backward compatibility between old flat filter format and new filter group format
 */

import { migrateOldFilters } from '../services/filterEngine';

/**
 * Detect if filters are in old format (flat object) or new format (filter groups)
 *
 * @param {Object} filters - Filter configuration
 * @returns {boolean} True if old format, false if new format
 */
export function isOldFilterFormat(filters) {
  if (!filters) return false;

  // New format has these properties
  if (filters.id && filters.operator && filters.conditions) {
    return false;
  }

  // Old format has direct filter properties
  if (
    filters.paymentStatus !== undefined ||
    filters.printStatus !== undefined ||
    filters.categories !== undefined ||
    filters.locations !== undefined ||
    filters.nameSearch !== undefined
  ) {
    return true;
  }

  return false;
}

/**
 * Migrate filters to new format if needed
 * Returns filters unchanged if already in new format
 *
 * @param {Object} filters - Filter configuration
 * @returns {Object} Filters in new format
 */
export function migrateFiltersIfNeeded(filters) {
  if (!filters) return null;

  if (isOldFilterFormat(filters)) {
    const migrated = migrateOldFilters(filters);
    // Add migration metadata
    migrated.migrated = true;
    migrated.migratedAt = new Date().toISOString();
    migrated.version = '2.0';
    return migrated;
  }

  return filters;
}

/**
 * Load saved filters from storage and migrate if necessary
 *
 * @param {string} viewType - View type ('shirts', 'registration', 'collections')
 * @returns {Promise<Array>} Array of saved filter views
 */
export async function loadAndMigrateSavedFilters(viewType) {
  try {
    const storageKey = `advanced-filters-${viewType}`;
    const result = await window.storage.get(storageKey);

    if (!result || !result.value) {
      return [];
    }

    const savedFilters = JSON.parse(result.value);

    // Migrate each filter if needed
    const migratedFilters = savedFilters.map(filter => {
      if (isOldFilterFormat(filter.filters)) {
        return {
          ...filter,
          filters: migrateFiltersIfNeeded(filter.filters),
          migrated: true,
        };
      }
      return filter;
    });

    // Save migrated filters back to storage
    if (migratedFilters.some(f => f.migrated)) {
      await window.storage.set(storageKey, JSON.stringify(migratedFilters));
    }

    return migratedFilters;
  } catch (error) {
    console.error('Error loading and migrating saved filters:', error);
    return [];
  }
}

/**
 * Convert new filter format back to old format (for compatibility)
 * Used when interfacing with components that still expect old format
 *
 * @param {Object} filterGroup - Filter group in new format
 * @returns {Object} Filters in old flat format
 */
export function convertToOldFormat(filterGroup) {
  if (!filterGroup || !filterGroup.conditions) {
    return {};
  }

  const oldFilters = {};

  filterGroup.conditions.forEach(condition => {
    switch (condition.field) {
      case 'paymentStatus':
        oldFilters.paymentStatus = condition.value === 'paid' ? 'Paid' : 'Unpaid';
        break;

      case 'printStatus':
        oldFilters.printStatus = condition.value === 'withPrint' ? 'With Print' : 'Plain';
        break;

      case 'categories':
        oldFilters.categories = Array.isArray(condition.value) ? condition.value : [condition.value];
        break;

      case 'location':
        oldFilters.locations = Array.isArray(condition.value) ? condition.value : [condition.value];
        break;

      case 'amount':
        if (condition.operator === 'between' && Array.isArray(condition.value)) {
          oldFilters.amountMin = String(condition.value[0]);
          oldFilters.amountMax = String(condition.value[1]);
        }
        break;

      case 'name':
        oldFilters.nameSearch = condition.value;
        break;

      case 'hasNotes':
        oldFilters.hasNotes = condition.operator === 'isTrue';
        break;

      case 'hasTasks':
        oldFilters.hasTasks = condition.operator === 'isTrue';
        break;

      case 'hasOverdueTasks':
        oldFilters.hasOverdueTasks = condition.operator === 'isTrue';
        break;

      case 'missingContact':
        oldFilters.missingContact = condition.operator === 'isTrue';
        break;

      case 'shirtSize':
        oldFilters.shirtSize = condition.value;
        break;

      case 'distributionStatus':
        oldFilters.distributionStatus = condition.value === 'given' ? 'Given' : 'Pending';
        break;

      case 'missingSize':
        oldFilters.missingSize = condition.operator === 'isTrue';
        break;

      case 'ageBracket':
        oldFilters.ageBracket = condition.value;
        break;

      case 'registrationStatus':
        oldFilters.registrationStatus = condition.value === 'registered' ? 'Registered' : 'Not Registered';
        break;

      case 'checkInStatus':
        oldFilters.checkInStatus = condition.value === 'checkedIn' ? 'Checked In' : 'Not Checked In';
        break;

      case 'attendanceStatus':
        oldFilters.attendanceStatus = condition.value;
        break;

      default:
        // Unknown field, skip
        break;
    }
  });

  return oldFilters;
}

/**
 * Validate filter group structure
 * Ensures the filter group has valid structure and properties
 *
 * @param {Object} filterGroup - Filter group to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateFilterGroup(filterGroup) {
  const errors = [];

  if (!filterGroup) {
    errors.push('Filter group is null or undefined');
    return { valid: false, errors };
  }

  if (!filterGroup.id) {
    errors.push('Filter group missing id');
  }

  if (!filterGroup.operator || !['AND', 'OR'].includes(filterGroup.operator)) {
    errors.push('Filter group has invalid operator (must be AND or OR)');
  }

  if (!Array.isArray(filterGroup.conditions)) {
    errors.push('Filter group conditions must be an array');
  }

  if (!Array.isArray(filterGroup.nestedGroups)) {
    errors.push('Filter group nestedGroups must be an array');
  }

  // Validate each condition
  if (Array.isArray(filterGroup.conditions)) {
    filterGroup.conditions.forEach((condition, index) => {
      if (!condition.id) {
        errors.push(`Condition ${index} missing id`);
      }
      if (!condition.field) {
        errors.push(`Condition ${index} missing field`);
      }
      if (!condition.operator) {
        errors.push(`Condition ${index} missing operator`);
      }
      if (condition.value === undefined) {
        errors.push(`Condition ${index} missing value`);
      }
    });
  }

  // Validate nested groups (only one level deep)
  if (Array.isArray(filterGroup.nestedGroups)) {
    filterGroup.nestedGroups.forEach((nestedGroup, index) => {
      if (nestedGroup.nestedGroups && nestedGroup.nestedGroups.length > 0) {
        errors.push(`Nested group ${index} has further nesting (only one level allowed)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
