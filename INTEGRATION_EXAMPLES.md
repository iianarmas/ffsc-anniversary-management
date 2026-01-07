# System Settings Integration Examples

This document shows how to integrate the system settings into various components of your application.

## 1. App.js - Wrap with Provider

```javascript
import { SystemSettingsProvider } from './components/SystemSettingsProvider';

function AppContent() {
  // ... existing code ...

  return (
    <SystemSettingsProvider>
      <Router>
        {/* Your routes */}
      </Router>
    </SystemSettingsProvider>
  );
}
```

## 2. AddPersonSidebar - Disable When Not Allowed

```javascript
import { useSystemSettings } from './SystemSettingsProvider';
import FeatureDisabledMessage from './FeatureDisabledMessage';

export default function AddPersonSidebar({ isOpen, onClose, onPersonAdded }) {
  const { settings } = useSystemSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="sidebar-content">
        <h2>Add New Person</h2>

        {!settings.allowAddPerson ? (
          <FeatureDisabledMessage feature="addPerson" />
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Form fields */}
          </form>
        )}
      </div>
    </div>
  );
}
```

## 3. ActionButtons - Disable Add Person Button

```javascript
import { useSystemSettings } from './SystemSettingsProvider';

export default function ActionButtons({ onOpenAddPerson, ... }) {
  const { settings } = useSystemSettings();

  return (
    <div className="action-buttons">
      <button
        onClick={onOpenAddPerson}
        disabled={!settings.allowAddPerson}
        className={`add-button ${!settings.allowAddPerson ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!settings.allowAddPerson ? 'Adding people is currently disabled' : 'Add new person'}
      >
        <Plus size={16} />
        Add Person
      </button>
    </div>
  );
}
```

## 4. AccountSidebar - Disable Shirt Size Dropdown

```javascript
import { useSystemSettings } from './SystemSettingsProvider';
import FeatureDisabledMessage from './FeatureDisabledMessage';

export default function AccountSidebar({ person, onClose }) {
  const { settings } = useSystemSettings();

  return (
    <div className="sidebar">
      {/* Shirt Size Section */}
      <div className="form-group">
        <label>Shirt Size</label>

        {!settings.allowShirtSizeChange && (
          <FeatureDisabledMessage feature="shirtSize" inline />
        )}

        <select
          value={formData.shirtSize}
          onChange={handleShirtSizeChange}
          disabled={!settings.allowShirtSizeChange}
          className={!settings.allowShirtSizeChange ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <option value="">Select Size</option>
          {/* Size options */}
        </select>
      </div>
    </div>
  );
}
```

## 5. Status Chips - Disable Click When Not Allowed

```javascript
import { useSystemSettings } from './SystemSettingsProvider';

function PaymentStatusChip({ person, onToggle }) {
  const { settings } = useSystemSettings();
  const isDisabled = !settings.allowPaymentChange;

  return (
    <button
      onClick={() => !isDisabled && onToggle(person.id)}
      disabled={isDisabled}
      className={`status-chip ${person.paid ? 'paid' : 'unpaid'} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      title={isDisabled ? 'Payment changes are currently disabled' : ''}
    >
      {person.paid ? 'Paid' : 'Unpaid'}
    </button>
  );
}

function PrintStatusChip({ person, onToggle }) {
  const { settings } = useSystemSettings();
  const isDisabled = !settings.allowPrintChange;

  return (
    <button
      onClick={() => !isDisabled && onToggle(person.id)}
      disabled={isDisabled}
      className={`status-chip ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isDisabled ? 'Print changes are currently disabled' : ''}
    >
      {person.hasPrint ? 'With Print' : 'Plain'}
    </button>
  );
}

function DistributionStatusChip({ person, onToggle }) {
  const { settings } = useSystemSettings();
  const isDisabled = !settings.allowDistributionChange;

  return (
    <button
      onClick={() => !isDisabled && onToggle(person.id)}
      disabled={isDisabled}
      className={`status-chip ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isDisabled ? 'Distribution changes are currently disabled' : ''}
    >
      {person.shirtGiven ? 'Given' : 'Pending'}
    </button>
  );
}
```

## 6. Mobile Bottom Navigation - Hide Add Button

```javascript
import { useSystemSettings } from './SystemSettingsProvider';

export default function MobileBottomNav({ currentView, onViewChange, onOpenAddPerson }) {
  const { settings } = useSystemSettings();

  return (
    <div className="mobile-bottom-nav">
      {/* Other nav items */}

      {settings.allowAddPerson && (
        <button
          onClick={onOpenAddPerson}
          className="add-person-button"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
```

## 7. Bulk Operations - Check Before Execution

```javascript
import { useSystemSettings } from './SystemSettingsProvider';

export default function RegistrationView() {
  const { settings } = useSystemSettings();

  const handleBulkPaymentUpdate = async (personIds) => {
    if (!settings.allowPaymentChange) {
      alert('Payment changes are currently disabled by the administrator.');
      return;
    }

    // Proceed with bulk update
    await updatePaymentStatus(personIds);
  };

  const handleBulkShirtSizeUpdate = async (personIds, newSize) => {
    if (!settings.allowShirtSizeChange) {
      alert('Shirt size changes are currently disabled by the administrator.');
      return;
    }

    // Proceed with bulk update
    await updateShirtSizes(personIds, newSize);
  };
}
```

## 8. Admin Route - Add System Settings

```javascript
// In your routing configuration
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

## 9. Admin Sidebar - Add Link

```javascript
export default function AdminSidebar() {
  return (
    <nav>
      <Link to="/admin/users">User Management</Link>
      <Link to="/admin/system-settings">System Settings</Link>
      {/* Other admin links */}
    </nav>
  );
}
```

## Field Mapping Reference

The system settings use snake_case in the database but camelCase in the frontend:

| Database Column | Frontend Property | Feature |
|----------------|------------------|---------|
| `allow_add_person` | `allowAddPerson` | Adding people |
| `allow_shirt_size_change` | `allowShirtSizeChange` | Shirt size changes |
| `allow_print_change` | `allowPrintChange` | Print option changes |
| `allow_payment_change` | `allowPaymentChange` | Payment status changes |
| `allow_distribution_change` | `allowDistributionChange` | Distribution status changes |

The `systemSettings.js` service handles this conversion automatically.
