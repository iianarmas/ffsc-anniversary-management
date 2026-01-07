# Phase 7: ShirtManagementView Integration - Changes Summary

## What Changed

Updated `ShirtManagementView.js` to use the new filter engine instead of the old inline filtering logic.

## Before (Old Implementation)

```javascript
// 120+ lines of manual filter logic
const applyAdvancedFilters = (peopleList, filters) => {
  if (!filters) return peopleList;

  return peopleList.filter(person => {
    // Payment status check
    if (filters.paymentStatus !== 'All') {
      if (filters.paymentStatus === 'Paid' && !person.paid) return false;
      // ... etc
    }
    // ... 100+ more lines of filter checks
  });
};

const filteredPeople = applyAdvancedFilters(people, advancedFilters);
```

**Problems:**
- ❌ Only supports AND logic (all conditions must match)
- ❌ No OR support
- ❌ No nested groups
- ❌ Duplicated logic across components
- ❌ Hard to maintain
- ❌ 120+ lines of code

## After (New Implementation)

```javascript
import { applyFilterGroups } from '../services/filterEngine';
import { migrateFiltersIfNeeded } from '../utils/filterMigration';

const filteredPeople = useMemo(() => {
  if (!advancedFilters) return people;

  try {
    // Auto-migrate old filter format to new format if needed
    const migratedFilters = migrateFiltersIfNeeded(advancedFilters);

    // Use the new filter engine to apply filters
    return applyFilterGroups(people, migratedFilters, peopleTaskInfo);
  } catch (error) {
    console.error('Error applying filters:', error);
    return people;
  }
}, [people, advancedFilters, peopleTaskInfo]);
```

**Benefits:**
- ✅ Supports AND/OR logic
- ✅ Supports nested filter groups
- ✅ Backward compatible (auto-migrates old filters)
- ✅ Centralized filter logic (reusable)
- ✅ Easy to maintain
- ✅ Only 13 lines of code
- ✅ Performance optimized with `useMemo`
- ✅ Error handling included

## Code Changes

### 1. Added Imports
```javascript
import { useMemo } from 'react';  // Added to existing React import
import { applyFilterGroups } from '../services/filterEngine';
import { migrateFiltersIfNeeded } from '../utils/filterMigration';
```

### 2. Replaced Filter Function
**Removed:** `applyAdvancedFilters()` function (120+ lines)
**Added:** 13-line `useMemo` hook with new filter engine

### 3. Backward Compatibility
The migration utility automatically converts old flat filter objects to the new filter group format:

**Old Format:**
```javascript
{
  paymentStatus: 'Paid',
  printStatus: 'With Print',
  categories: ['Kids', 'Teen'],
  locations: ['Main']
}
```

**New Format (auto-converted):**
```javascript
{
  id: 'group_123',
  operator: 'AND',
  conditions: [
    { field: 'paymentStatus', operator: 'equals', value: 'paid' },
    { field: 'printStatus', operator: 'equals', value: 'withPrint' },
    { field: 'categories', operator: 'in', value: ['Kids', 'Teen'] },
    { field: 'location', operator: 'in', value: ['Main'] }
  ],
  nestedGroups: []
}
```

## Testing Checklist

- [ ] Existing saved filters still work (backward compatibility)
- [ ] New filters from AdvancedFilterDialogNew work correctly
- [ ] Action presets apply filters properly
- [ ] Filter counts are accurate
- [ ] Performance is good with large datasets
- [ ] No console errors

## Rollback Plan

If issues occur, revert the changes:

```bash
git checkout src/components/ShirtManagementView.js
```

Or manually restore the old `applyAdvancedFilters` function from git history.

## Performance Improvements

1. **Memoization**: Filter results are cached using `useMemo`, only recalculating when dependencies change
2. **Single Pass**: Filter engine processes all conditions in one pass
3. **Early Exit**: Stops checking conditions as soon as a mismatch is found
4. **Smart Migration**: Old filters are migrated once, not on every render

## Next Steps

After validating this works correctly:
- Update RegistrationView.js to use the same pattern
- Update CollectionsView.js to use the same pattern
- Remove old filter code once fully migrated
- Proceed to Phase 8: Performance Optimizations
