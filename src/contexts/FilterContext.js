import React, { createContext, useContext, useState, useMemo } from 'react';
import { applyFilterGroups } from '../services/filterEngine';
import { calculateFilterStats } from '../services/filterStatistics';

/**
 * Filter Context
 * Provides shared state for filters across components
 */
const FilterContext = createContext(null);

export function FilterProvider({ children, people = [], peopleTaskInfo = {}, viewType = 'collections' }) {
  const [activeFilters, setActiveFilters] = useState(null);
  const [filterStats, setFilterStats] = useState({});
  const [savedViews, setSavedViews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Apply filters and get filtered results
  const filteredPeople = useMemo(() => {
    if (!activeFilters) return people;

    try {
      return applyFilterGroups(people, activeFilters, peopleTaskInfo);
    } catch (error) {
      console.error('Error applying filters:', error);
      return people;
    }
  }, [people, activeFilters, peopleTaskInfo]);

  // Calculate filter statistics
  const stats = useMemo(() => {
    return calculateFilterStats(people, activeFilters, viewType, peopleTaskInfo);
  }, [people, activeFilters, viewType, peopleTaskInfo]);

  const value = {
    // State
    activeFilters,
    filterStats: stats,
    savedViews,
    isLoading,
    filteredPeople,

    // Actions
    setActiveFilters,
    setSavedViews,
    setIsLoading,

    // Computed
    totalCount: people.length,
    filteredCount: filteredPeople.length,
    hasFilters: activeFilters !== null && (activeFilters.conditions?.length > 0 || activeFilters.nestedGroups?.length > 0),
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

/**
 * Hook to use filter context
 */
export function useFilters() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }

  return context;
}

export default FilterContext;
