import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemSettings, subscribeToSettings, unsubscribeFromSettings } from '../services/systemSettings';

const SystemSettingsContext = createContext();

/**
 * SystemSettingsProvider
 * Provides system settings to the entire application with real-time updates
 */
export function SystemSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    allowAddPerson: true,
    allowShirtSizeChange: true,
    allowPrintChange: true,
    allowPaymentChange: true,
    allowDistributionChange: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial settings
    loadSettings();

    // Subscribe to real-time changes
    const subscription = subscribeToSettings((newSettings) => {
      setSettings(newSettings);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromSettings(subscription);
    };
  }, []);

  const loadSettings = async () => {
    const { data } = await getSystemSettings();
    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const value = {
    settings,
    loading,
    refreshSettings: loadSettings,
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

/**
 * Hook to access system settings
 */
export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within SystemSettingsProvider');
  }
  return context;
}
