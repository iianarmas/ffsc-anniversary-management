# System Settings Setup Guide

## Overview
The System Settings feature allows administrators to control application-wide permissions including:
- Adding new people to the system
- Changing shirt sizes
- Modifying print options
- Updating payment status
- Changing distribution status

## Database Setup

### Step 1: Create the Database Table
Run the SQL migration in your Supabase SQL Editor:

```sql
-- Location: database/migrations/create_system_settings_table.sql
```

Or copy and paste the SQL from that file into your Supabase SQL Editor and execute it.

### Step 2: Verify Table Creation
After running the migration, verify the table exists:

```sql
SELECT * FROM system_settings;
```

You should see one row with all settings set to `true` (enabled).

### Step 3: Enable Realtime (if not already enabled)
Make sure realtime is enabled for the system_settings table in your Supabase dashboard:

1. Go to Database → Replication
2. Find `system_settings` table
3. Enable replication

## Application Setup

### Step 1: Wrap Your App with SystemSettingsProvider

In `src/App.js`, wrap your application with the `SystemSettingsProvider`:

```javascript
import { SystemSettingsProvider } from './components/SystemSettingsProvider';

function App() {
  return (
    <AuthProvider>
      <SystemSettingsProvider>
        {/* Your existing app content */}
      </SystemSettingsProvider>
    </AuthProvider>
  );
}
```

### Step 2: Add System Settings to Admin Menu

Add a link to the System Settings page in your admin navigation/sidebar.

Example route:
```javascript
<Route path="/admin/system-settings" element={<SystemSettings />} />
```

## Usage

### For Administrators

1. Navigate to the System Settings page (admin-only)
2. Toggle any feature on/off using the switches
3. Click "Save Changes" to apply
4. Changes take effect immediately for all users

### For Regular Users

When a feature is disabled:
- UI controls for that feature will be disabled/hidden
- Users will see a professional message explaining the feature is temporarily disabled
- The message directs them to contact an administrator

## Integration Points

The system settings affect these areas:

1. **Add Person**:
   - Registration view "+" button
   - Shirt Management view "+" button
   - Mobile bottom navigation "+" button
   - AddPersonSidebar

2. **Shirt Size Changes**:
   - AccountSidebar shirt size dropdown
   - Mobile shirt management view
   - Bulk operations

3. **Print Option**:
   - Status chips in tables
   - Account sidebar toggles
   - Mobile views

4. **Payment Status**:
   - Status chips in tables
   - Account sidebar toggles
   - Mobile views

5. **Distribution Status**:
   - Status chips in tables
   - Account sidebar toggles
   - Mobile views

## Example Usage in Components

```javascript
import { useSystemSettings } from './components/SystemSettingsProvider';
import FeatureDisabledMessage from './components/FeatureDisabledMessage';

function MyComponent() {
  const { settings } = useSystemSettings();

  if (!settings.allowAddPerson) {
    return <FeatureDisabledMessage feature="addPerson" />;
  }

  return (
    <button
      disabled={!settings.allowShirtSizeChange}
      onClick={handleShirtSizeChange}
    >
      Change Size
    </button>
  );
}
```

## Security

- Only users with role='admin' can modify system settings
- All users can read settings (needed for UI state)
- Changes propagate in real-time via Supabase Realtime
- Settings are validated on both client and server side

## Troubleshooting

### Settings not updating in real-time
1. Check that Realtime is enabled for the system_settings table
2. Verify the Realtime subscription in browser console
3. Refresh the page to force reload settings

### Users can still access disabled features
1. Verify the SystemSettingsProvider is wrapping the app
2. Check that components are using the `useSystemSettings` hook
3. Ensure the database table has the correct values

### Admin cannot save settings
1. Verify the admin's role in the profiles table
2. Check RLS policies on system_settings table
3. Look for errors in browser console
