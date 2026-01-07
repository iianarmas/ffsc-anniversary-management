import { supabase } from './supabase';

/**
 * System Settings Service
 * Manages application-wide settings that control feature availability
 */

// Default settings structure
export const DEFAULT_SETTINGS = {
  allowAddPerson: true,
  allowShirtSizeChange: true,
  allowPrintChange: true,
  allowPaymentChange: true,
  allowDistributionChange: true,
};

/**
 * Convert database snake_case to frontend camelCase
 */
function dbToFrontend(dbSettings) {
  return {
    allowAddPerson: dbSettings.allow_add_person ?? true,
    allowShirtSizeChange: dbSettings.allow_shirt_size_change ?? true,
    allowPrintChange: dbSettings.allow_print_change ?? true,
    allowPaymentChange: dbSettings.allow_payment_change ?? true,
    allowDistributionChange: dbSettings.allow_distribution_change ?? true,
  };
}

/**
 * Convert frontend camelCase to database snake_case
 */
function frontendToDb(frontendSettings) {
  return {
    allow_add_person: frontendSettings.allowAddPerson,
    allow_shirt_size_change: frontendSettings.allowShirtSizeChange,
    allow_print_change: frontendSettings.allowPrintChange,
    allow_payment_change: frontendSettings.allowPaymentChange,
    allow_distribution_change: frontendSettings.allowDistributionChange,
  };
}

/**
 * Get system settings from Supabase
 * Settings are stored in a single row with key-value pairs
 */
export async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      // If no settings exist yet, return defaults
      if (error.code === 'PGRST116') {
        return { data: DEFAULT_SETTINGS, error: null };
      }
      throw error;
    }

    return { data: dbToFrontend(data || {}), error: null };
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return { data: DEFAULT_SETTINGS, error };
  }
}

/**
 * Update system settings
 * Only admins should be able to call this
 */
export async function updateSystemSettings(settings) {
  try {
    // Convert frontend format to database format
    const dbSettings = frontendToDb(settings);

    // First, check if settings exist
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .single();

    let result;
    if (existing) {
      // Update existing settings
      result = await supabase
        .from('system_settings')
        .update({
          ...dbSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new settings
      result = await supabase
        .from('system_settings')
        .insert({
          ...dbSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return { data: dbToFrontend(result.data), error: null };
  } catch (error) {
    console.error('Error updating system settings:', error);
    return { data: null, error };
  }
}

/**
 * Subscribe to real-time settings changes
 */
export function subscribeToSettings(callback) {
  const subscription = supabase
    .channel('system_settings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'system_settings',
      },
      (payload) => {
        const settings = payload.new ? dbToFrontend(payload.new) : DEFAULT_SETTINGS;
        callback(settings);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Unsubscribe from settings changes
 */
export function unsubscribeFromSettings(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}
