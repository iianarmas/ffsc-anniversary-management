import React, { useState, useEffect } from 'react';
import { Settings, Lock, Unlock, Save, RefreshCw } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '../../services/systemSettings';

/**
 * SystemSettings Component
 * Admin panel for controlling system-wide feature permissions
 */
export default function SystemSettings() {
  const [settings, setSettings] = useState({
    allowAddPerson: true,
    allowShirtSizeChange: true,
    allowPrintChange: true,
    allowPaymentChange: true,
    allowDistributionChange: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await getSystemSettings();

    if (error) {
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } else {
      setSettings(data);
    }

    setLoading(false);
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const { data, error } = await updateSystemSettings(settings);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }

    setSaving(false);
  };

  const settingsConfig = [
    {
      key: 'allowAddPerson',
      label: 'Allow Adding People',
      description: 'When disabled, users cannot add new people to the system through any interface.',
      icon: Lock,
    },
    {
      key: 'allowShirtSizeChange',
      label: 'Allow Shirt Size Changes',
      description: 'When disabled, users cannot modify shirt sizes for any person.',
      icon: Lock,
    },
    {
      key: 'allowPrintChange',
      label: 'Allow Print Option Changes',
      description: 'When disabled, users cannot toggle the print option for shirts.',
      icon: Lock,
    },
    {
      key: 'allowPaymentChange',
      label: 'Allow Payment Status Changes',
      description: 'When disabled, users cannot modify payment status.',
      icon: Lock,
    },
    {
      key: 'allowDistributionChange',
      label: 'Allow Distribution Status Changes',
      description: 'When disabled, users cannot modify shirt distribution status.',
      icon: Lock,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-[#0f2a71]" />
          <h1 className="text-2xl font-bold text-[#0f2a71]">System Settings</h1>
        </div>
        <p className="text-gray-600">
          Control system-wide permissions and feature availability for all users.
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {settingsConfig.map((config) => {
          const isEnabled = settings[config.key];
          const Icon = isEnabled ? Unlock : Lock;

          return (
            <div key={config.key} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-red-600'}`} />
                    <h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(config.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f2a71] focus:ring-offset-2 ${
                    isEnabled ? 'bg-[#0f2a71]' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={isEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={loadSettings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[#0f2a71] text-white rounded-lg hover:bg-[#0f2a71]/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Warning Message */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>⚠️ Important:</strong> These settings affect all users immediately. Disabling features
          will prevent all non-admin users from performing those actions until re-enabled.
        </p>
      </div>
    </div>
  );
}
