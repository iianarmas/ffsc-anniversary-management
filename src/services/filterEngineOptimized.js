/**
 * Optimized Filter Engine
 * Performance-enhanced version with indexing and caching
 */

import { applyFilterGroups, evaluateFilterGroup } from './filterEngine';
import { createIndexMap, memoize, LRUCache, isLargeDataset } from '../utils/performanceOptimizations';

// Global cache for filter results
const filterCache = new LRUCache(20);

// Global cache for indexes
let cachedIndexes = null;
let cachedPeopleHash = null;

/**
 * Generate a hash for the people array to detect changes
 * Simple hash based on length and first/last person IDs
 */
function generatePeopleHash(people) {
  if (!people || people.length === 0) return 'empty';

  return `${people.length}_${people[0]?.id || 'none'}_${people[people.length - 1]?.id || 'none'}`;
}

/**
 * Get or create indexes for the people array
 * Indexes are cached and reused if the people array hasn't changed
 */
function getIndexes(people) {
  const currentHash = generatePeopleHash(people);

  if (cachedIndexes && cachedPeopleHash === currentHash) {
    return cachedIndexes;
  }

  // Create new indexes
  cachedIndexes = createIndexMap(people, [
    'location',
    'paid',
    'shirtGiven',
    'hasPrint',
    'shirtSize',
    'ageBracket',
  ]);
  cachedPeopleHash = currentHash;

  return cachedIndexes;
}

/**
 * Generate cache key for filter group
 */
function generateFilterCacheKey(filterGroup, peopleHash) {
  return `${peopleHash}_${JSON.stringify(filterGroup)}`;
}

/**
 * Optimized filter application with caching and indexing
 *
 * @param {Array} people - Array of person objects
 * @param {Object} filterGroup - Filter group configuration
 * @param {Object} peopleTaskInfo - Task information
 * @param {Object} options - Optimization options
 * @returns {Array} Filtered results
 */
export function applyFilterGroupsOptimized(
  people,
  filterGroup,
  peopleTaskInfo = {},
  options = {}
) {
  const {
    useCache = true,
    useIndexes = true,
    forceRefresh = false,
  } = options;

  // No filters - return all
  if (!filterGroup || !filterGroup.conditions || filterGroup.conditions.length === 0) {
    return people;
  }

  const peopleHash = generatePeopleHash(people);

  // Check cache first
  if (useCache && !forceRefresh) {
    const cacheKey = generateFilterCacheKey(filterGroup, peopleHash);
    const cached = filterCache.get(cacheKey);

    if (cached) {
      console.log('[Filter] Cache hit');
      return cached;
    }
  }

  // For large datasets, use optimized filtering
  if (isLargeDataset(people) && useIndexes) {
    console.log('[Filter] Using optimized filtering for large dataset');
    const indexes = getIndexes(people);
    const results = applyFilterGroupsWithIndexes(people, filterGroup, peopleTaskInfo, indexes);

    // Cache results
    if (useCache) {
      const cacheKey = generateFilterCacheKey(filterGroup, peopleHash);
      filterCache.set(cacheKey, results);
    }

    return results;
  }

  // For small datasets, use standard filtering
  const results = applyFilterGroups(people, filterGroup, peopleTaskInfo);

  // Cache results
  if (useCache) {
    const cacheKey = generateFilterCacheKey(filterGroup, peopleHash);
    filterCache.set(cacheKey, results);
  }

  return results;
}

/**
 * Apply filters using pre-computed indexes for faster lookups
 * This is beneficial for large datasets (1000+ people)
 */
function applyFilterGroupsWithIndexes(people, filterGroup, peopleTaskInfo, indexes) {
  // For simple single-field filters on indexed fields, use index-based filtering
  if (canUseIndexOptimization(filterGroup, indexes)) {
    return applyIndexedFilter(people, filterGroup, indexes);
  }

  // Fall back to standard filtering
  return people.filter(person => evaluateFilterGroup(person, filterGroup, peopleTaskInfo));
}

/**
 * Check if we can use index-based optimization
 * Only works for simple cases: single condition on indexed field with IN operator
 */
function canUseIndexOptimization(filterGroup, indexes) {
  // Only for single condition, no nested groups
  if (filterGroup.conditions.length !== 1 || filterGroup.nestedGroups?.length > 0) {
    return false;
  }

  const condition = filterGroup.conditions[0];

  // Check if field is indexed and operator is supported
  return (
    indexes[condition.field] &&
    (condition.operator === 'equals' || condition.operator === 'in')
  );
}

/**
 * Apply filter using index lookups (O(1) instead of O(n))
 */
function applyIndexedFilter(people, filterGroup, indexes) {
  const condition = filterGroup.conditions[0];
  const field = condition.field;
  const index = indexes[field];

  let matchingIndexes = [];

  if (condition.operator === 'equals') {
    const key = String(condition.value);
    matchingIndexes = index[key] || [];
  } else if (condition.operator === 'in') {
    const values = Array.isArray(condition.value) ? condition.value : [condition.value];
    values.forEach(value => {
      const key = String(value);
      if (index[key]) {
        matchingIndexes.push(...index[key]);
      }
    });
  }

  // Return matching people
  return matchingIndexes.map(i => people[i]);
}

/**
 * Clear all caches
 * Call this when people data is completely refreshed
 */
export function clearFilterCache() {
  filterCache.clear();
  cachedIndexes = null;
  cachedPeopleHash = null;
  console.log('[Filter] Cache cleared');
}

/**
 * Get cache statistics
 * Useful for debugging and monitoring
 */
export function getFilterCacheStats() {
  return {
    cacheSize: filterCache.size,
    hasIndexes: cachedIndexes !== null,
    peopleHash: cachedPeopleHash,
  };
}

/**
 * Pre-warm cache with common filters
 * Call this on app load to cache frequently used filters
 */
export function prewarmFilterCache(people, commonFilters = [], peopleTaskInfo = {}) {
  commonFilters.forEach(filterGroup => {
    applyFilterGroupsOptimized(people, filterGroup, peopleTaskInfo, {
      useCache: true,
      forceRefresh: true,
    });
  });

  console.log('[Filter] Cache prewarmed with', commonFilters.length, 'filters');
}

/**
 * Memoized version of statistics calculation
 */
export const calculateFilterStatsMemoized = memoize(
  (people, filterGroup, viewType, peopleTaskInfo) => {
    const { calculateFilterStats } = require('./filterStatistics');
    return calculateFilterStats(people, filterGroup, viewType, peopleTaskInfo);
  },
  (people, filterGroup, viewType) => {
    // Cache key based on people count and filter config
    return `${people.length}_${JSON.stringify(filterGroup)}_${viewType}`;
  }
);
