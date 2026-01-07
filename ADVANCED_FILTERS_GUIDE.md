# Advanced Filters System - Implementation Guide

## Overview

The new advanced filtering system provides:
- **Action Presets**: Quick access to common filter scenarios
- **Query Builder**: Visual AND/OR filter builder
- **Saved Views**: Save and share custom filter configurations
- **Filter Statistics**: Real-time counts for filter options

## Migration Path

The new system is **backward compatible** with the existing AdvancedFilterDialog. Here's how to migrate:

### Option 1: Test Side-by-Side (Recommended)

1. Keep the existing `AdvancedFilterDialog.js` as-is
2. The new enhanced version is in `AdvancedFilterDialogNew.js`
3. Test the new version in a dev environment
4. Once validated, rename files:
   ```bash
   mv src/components/AdvancedFilterDialog.js src/components/AdvancedFilterDialogOld.js
   mv src/components/AdvancedFilterDialogNew.js src/components/AdvancedFilterDialog.js
   ```

### Option 2: Direct Replacement

Replace `AdvancedFilterDialog.js` with `AdvancedFilterDialogNew.js` if you're confident in the new system.

## How to Use

### 1. Action Presets

Click any preset card to instantly apply that filter:

```javascript
import ActionPresetsPanel from './ActionPresets/ActionPresetsPanel';

<ActionPresetsPanel
  people={people}
  peopleTaskInfo={peopleTaskInfo}
  onPresetSelect={(preset) => {
    // Apply preset filters
    setFilters(preset.filterConfig);
  }}
/>
```

Available presets:
- **Financial**: Follow Up on Payment, Payments Today
- **Shirt Management**: Get Shirt Sizes, Ready to Distribute, Distributed Today
- **Contact & Tasks**: Need Contact Info, Pending Tasks, Overdue Tasks
- **Special Cases**: Kids Without Sizes, Print Orders, Main Location Pending

### 2. Query Builder

Build complex filters with AND/OR logic:

```javascript
import QueryBuilderMain from './FilterQueryBuilder/QueryBuilderMain';

<QueryBuilderMain
  filterGroup={filterGroup}
  onChange={setFilterGroup}
  viewType="shirts"
  people={people}
  peopleTaskInfo={peopleTaskInfo}
  showPreview={true}
/>
```

**Filter Group Structure:**
```javascript
{
  id: 'group_1',
  operator: 'AND', // or 'OR'
  conditions: [
    {
      id: 'condition_1',
      field: 'paymentStatus',
      operator: 'equals',
      value: 'paid',
      label: 'Payment is Paid'
    }
  ],
  nestedGroups: [] // One level of nesting allowed
}
```

### 3. Saved Views

Save filter configurations for reuse:

```javascript
import SavedViewsPanel from './SavedViews/SavedViewsPanel';
import SaveViewDialog from './SavedViews/SaveViewDialog';

// Panel to list saved views
<SavedViewsPanel
  viewType="shirts"
  people={people}
  userId={currentUserId}
  onViewSelect={(view) => {
    setFilters(view.filters);
  }}
  onCreateNew={() => setShowSaveDialog(true)}
/>

// Dialog to save/edit views
<SaveViewDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  onSave={async (viewData) => {
    await createSavedView({
      ...viewData,
      filters: currentFilterGroup,
      viewType: 'shirts'
    }, userId);
  }}
  filterConfig={currentFilterGroup}
/>
```

## Integration with ShirtManagementView

### Current Implementation

The existing `ShirtManagementView.js` uses the old filter format:

```javascript
const applyAdvancedFilters = (peopleList, filters) => {
  // Old flat filter object
  if (filters.paymentStatus !== 'All') { ... }
  if (filters.printStatus !== 'All') { ... }
}
```

### New Implementation

Replace with the new filter engine:

```javascript
import { applyFilterGroups } from '../services/filterEngine';
import { migrateFiltersIfNeeded } from '../utils/filterMigration';

const filteredPeople = useMemo(() => {
  if (!advancedFilters) return people;

  // Auto-migrate old filters to new format
  const migratedFilters = migrateFiltersIfNeeded(advancedFilters);

  return applyFilterGroups(people, migratedFilters, peopleTaskInfo);
}, [people, advancedFilters, peopleTaskInfo]);
```

## Database Setup

Run the SQL migration in your Supabase dashboard:

```bash
cat database/migrations/create_saved_filter_views.sql
```

This creates:
- `saved_filter_views` table
- RLS policies for data security
- `increment_view_usage()` function

## File Structure

```
src/
├── components/
│   ├── AdvancedFilterDialog.js (old - keep for now)
│   ├── AdvancedFilterDialogNew.js (new enhanced version)
│   ├── ActionPresets/
│   │   ├── ActionPresetsPanel.js
│   │   └── ActionPresetCard.js
│   ├── FilterQueryBuilder/
│   │   ├── QueryBuilderMain.js
│   │   ├── FilterGroup.js
│   │   ├── FilterCondition.js
│   │   ├── FieldSelector.js
│   │   ├── OperatorSelector.js
│   │   └── ValueInput.js
│   └── SavedViews/
│       ├── SavedViewsPanel.js
│       ├── SavedViewCard.js
│       ├── SaveViewDialog.js
│       └── ShareViewDialog.js
├── services/
│   ├── filterEngine.js (core filter logic)
│   ├── filterStatistics.js (real-time counts)
│   └── savedViews.js (database operations)
├── constants/
│   ├── filterFields.js (field definitions)
│   └── actionPresets.js (preset configurations)
├── contexts/
│   └── FilterContext.js (shared filter state)
└── utils/
    └── filterMigration.js (backward compatibility)
```

## Testing Checklist

Before going live:

- [ ] Database migration completed successfully
- [ ] Action presets show correct counts
- [ ] Query builder creates valid filter groups
- [ ] Saved views can be created, edited, deleted
- [ ] Filter statistics update in real-time
- [ ] Backward compatibility with existing saved filters
- [ ] Mobile responsive (test on small screens)
- [ ] Performance with large datasets (500+ people)

## Rollback Plan

If issues arise, rollback is simple:

1. Rename files back:
   ```bash
   mv src/components/AdvancedFilterDialog.js src/components/AdvancedFilterDialogNew.js
   mv src/components/AdvancedFilterDialogOld.js src/components/AdvancedFilterDialog.js
   ```

2. The database table can remain (it won't affect old code)

## Support

- See `/DEVELOPMENT.md` for original implementation plan
- Check console for error messages
- All new components have JSDoc comments
- Filter validation errors are logged to console

## Next Steps

After Phase 6 (current):
- **Phase 7**: Update ShirtManagementView to use new filter engine
- **Phase 8**: Performance optimizations (memoization, web workers, indexing)
