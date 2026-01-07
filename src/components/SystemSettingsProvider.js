import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemSettings, subscribeToSettings, unsubscribeFromSettings } from '../services/systemSettings';
import Header from './Header';

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
    <div className="fixed top-0 left-0 right-0 bg-[#f9fafa] border-b border-gray-200 shadow-sm z-20">
      <Header 
                viewTitle="Home" 
                showSearch={false}
                showBell={true}
                onOpenPersonNotes={(personId) => {
                }}
              />
      <SystemSettingsContext.Provider value={value}>
        {children}
      </SystemSettingsContext.Provider>
    </div>
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
