# System Settings - Quick Start Guide

## 🚀 Quick Setup (5 Steps)

### 1. Create Database Table (2 minutes)
```sql
-- Go to Supabase SQL Editor
-- Copy/paste from: database/migrations/create_system_settings_table.sql
-- Click "Run"
```

### 2. Enable Realtime (30 seconds)
- Supabase Dashboard → Database → Replication
- Find `system_settings`
- Toggle ON

### 3. Add Provider to App (1 minute)
```javascript
// src/App.js
import { SystemSettingsProvider } from './components/SystemSettingsProvider';

function AppContent() {
  return (
    <AuthProvider>
      <SystemSettingsProvider>
        {/* Existing app content */}
      </SystemSettingsProvider>
    </AuthProvider>
  );
}
```

### 4. Add Admin Route (1 minute)
```javascript
// In your route configuration
import SystemSettings from './components/admin/SystemSettings';

<Route
  path="/admin/system-settings"
  element={
    <ProtectedRoute requiredRole="admin">
      <SystemSettings />
    </ProtectedRoute>
  }
/>
```

### 5. Add Nav Link (30 seconds)
```javascript
// In your admin navigation/sidebar
<Link to="/admin/system-settings">
  <Settings className="w-4 h-4" />
  System Settings
</Link>
```

## ✅ Test It Works

1. Login as admin
2. Go to `/admin/system-settings`
3. Toggle a setting
4. Click "Save Changes"
5. Check that the feature is now disabled in the app

## 🔧 Common Integrations

### Disable "Add Person" Button
```javascript
import { useSystemSettings } from './components/SystemSettingsProvider';

function MyComponent() {
  const { settings } = useSystemSettings();

  return (
    <button
      disabled={!settings.allowAddPerson}
      onClick={handleAddPerson}
    >
      Add Person
    </button>
  );
}
```

### Show Message When Feature Disabled
```javascript
import { useSystemSettings } from './components/SystemSettingsProvider';
import FeatureDisabledMessage from './components/FeatureDisabledMessage';

function AddPersonSidebar() {
  const { settings } = useSystemSettings();

  if (!settings.allowAddPerson) {
    return <FeatureDisabledMessage feature="addPerson" />;
  }

  return <form>{/* ... */}</form>;
}
```

### Disable Status Chip Clicks
```javascript
function StatusChip({ person, onToggle }) {
  const { settings } = useSystemSettings();

  return (
    <button
      onClick={() => settings.allowPaymentChange && onToggle()}
      disabled={!settings.allowPaymentChange}
      className={!settings.allowPaymentChange ? 'opacity-50 cursor-not-allowed' : ''}
    >
      {person.paid ? 'Paid' : 'Unpaid'}
    </button>
  );
}
```

## 📋 Settings Reference

| Setting | Controls |
|---------|----------|
| `allowAddPerson` | Adding people to system |
| `allowShirtSizeChange` | Changing shirt sizes |
| `allowPrintChange` | Toggling print option |
| `allowPaymentChange` | Changing payment status |
| `allowDistributionChange` | Changing distribution status |

## 📚 Full Documentation

- **Complete Setup**: See `SYSTEM_SETTINGS_SETUP.md`
- **Code Examples**: See `INTEGRATION_EXAMPLES.md`
- **Full Summary**: See `SYSTEM_SETTINGS_SUMMARY.md`

## 🆘 Troubleshooting

**Settings not updating?**
- Check realtime is enabled in Supabase
- Refresh browser

**Can't save settings?**
- Verify you're logged in as admin
- Check browser console for errors

**Features still work when disabled?**
- Make sure SystemSettingsProvider wraps your app
- Check component is using `useSystemSettings()` hook
