import { useMemo, useCallback, useRef, useEffect } from 'react';
import { applyFilterGroupsOptimized, clearFilterCache } from '../services/filterEngineOptimized';
import { debounce } from '../utils/performanceOptimizations';

/**
 * Custom hook for optimized filter application
 * Provides caching, debouncing, and performance monitoring
 *
 * @param {Array} people - Array of person objects
 * @param {Object} filterGroup - Filter group configuration
 * @param {Object} peopleTaskInfo - Task information
 * @param {Object} options - Hook options
 * @returns {Object} Filter results and utilities
 */
export function useOptimizedFilters(
  people,
  filterGroup,
  peopleTaskInfo = {},
  options = {}
) {
  const {
    debounceMs = 300,
    enableCache = true,
    enableIndexes = true,
    logPerformance = false,
  } = options;

  const filterTimeRef = useRef(0);
  const filterCountRef = useRef(0);

  // Apply filters with optimization
  const filteredPeople = useMemo(() => {
    if (!filterGroup) return people;

    const startTime = performance.now();

    const results = applyFilterGroupsOptimized(
      people,
      filterGroup,
      peopleTaskInfo,
      {
        useCache: enableCache,
        useIndexes: enableIndexes,
      }
    );

    const endTime = performance.now();
    const duration = endTime - startTime;

    filterTimeRef.current = duration;
    filterCountRef.current++;

    if (logPerformance) {
      console.log(`[useOptimizedFilters] Filtered ${people.length} → ${results.length} in ${duration.toFixed(2)}ms`);
    }

    return results;
  }, [people, filterGroup, peopleTaskInfo, enableCache, enableIndexes, logPerformance]);

  // Clear cache when component unmounts or people change significantly
  useEffect(() => {
    return () => {
      if (enableCache) {
        clearFilterCache();
      }
    };
  }, [enableCache]);

  // Get performance stats
  const getPerformanceStats = useCallback(() => {
    return {
      lastFilterTime: filterTimeRef.current,
      filterCount: filterCountRef.current,
      averageTime: filterCountRef.current > 0
        ? (filterTimeRef.current / filterCountRef.current).toFixed(2)
        : 0,
    };
  }, []);

  return {
    filteredPeople,
    filteredCount: filteredPeople.length,
    totalCount: people.length,
    hasFilters: filterGroup && filterGroup.conditions?.length > 0,
    matchPercentage: people.length > 0
      ? Math.round((filteredPeople.length / people.length) * 100)
      : 0,
    getPerformanceStats,
  };
}

/**
 * Hook for debounced filter updates
 * Useful for search inputs and real-time filter changes
 *
 * @param {Function} onFilterChange - Callback when filters change
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced filter update function
 */
export function useDebouncedFilterUpdate(onFilterChange, delay = 300) {
  const debouncedCallback = useRef(
    debounce((newFilter) => {
      onFilterChange(newFilter);
    }, delay)
  ).current;

  useEffect(() => {
    return () => {
      // Cancel pending debounced calls on unmount
      if (debouncedCallback.cancel) {
        debouncedCallback.cancel();
      }
    };
  }, [debouncedCallback]);

  return useCallback(
    (newFilter) => {
      debouncedCallback(newFilter);
    },
    [debouncedCallback]
  );
}

/**
 * Hook for tracking filter performance metrics
 * Useful for identifying slow filters and optimizing
 *
 * @returns {Object} Performance tracking utilities
 */
export function useFilterPerformanceTracking() {
  const metricsRef = useRef({
    totalFilters: 0,
    totalTime: 0,
    slowestFilter: null,
    fastestFilter: null,
  });

  const trackFilter = useCallback((filterGroup, duration) => {
    const metrics = metricsRef.current;

    metrics.totalFilters++;
    metrics.totalTime += duration;

    if (!metrics.slowestFilter || duration > metrics.slowestFilter.duration) {
      metrics.slowestFilter = { filterGroup, duration };
    }

    if (!metrics.fastestFilter || duration < metrics.fastestFilter.duration) {
      metrics.fastestFilter = { filterGroup, duration };
    }
  }, []);

  const getMetrics = useCallback(() => {
    const metrics = metricsRef.current;

    return {
      totalFilters: metrics.totalFilters,
      totalTime: metrics.totalTime.toFixed(2),
      averageTime: metrics.totalFilters > 0
        ? (metrics.totalTime / metrics.totalFilters).toFixed(2)
        : 0,
      slowestFilter: metrics.slowestFilter,
      fastestFilter: metrics.fastestFilter,
    };
  }, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      totalFilters: 0,
      totalTime: 0,
      slowestFilter: null,
      fastestFilter: null,
    };
  }, []);

  return {
    trackFilter,
    getMetrics,
    resetMetrics,
  };
}

export default useOptimizedFilters;
