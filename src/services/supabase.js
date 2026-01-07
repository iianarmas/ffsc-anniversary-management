import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bxeumobdnfqnjtribmtc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXVtb2JkbmZxbmp0cmlibXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3OTYwMjksImV4cCI6MjA4MjM3MjAyOX0.cb_kkdm7SW3k-VD8BhmMZDRCmrk_9wYZW9_gVzUMWxo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  return { data, error };
};

export const signUp = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: undefined
      }
    });
    
    // Wait a moment for the trigger to create the profile
    if (data?.user && !error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { data, error };
  } catch (err) {
    console.error('SignUp exception:', err);
    return { data: null, error: err };
  }
};

// Alternative signup that uses admin API
export const signUpAlternative = async (email, password, fullName) => {
  try {
    // First check if user already exists
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email);

    if (existingUsers && existingUsers.length > 0) {
      return { data: null, error: { message: 'User already exists with this email' } };
    }

    // Create auth user with autoconfirm
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: undefined
      }
    });
    
    // Return immediately without waiting
    return { data, error };
  } catch (err) {
    console.error('SignUp exception:', err);
    return { data: null, error: err };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Profile fetch error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getUserProfile:', err);
    return { data: null, error: err };
  }
};

export const verifyRegistrationCode = async (code) => {
  
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('registration_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    
    const endTime = Date.now();
    
    if (error) {
      console.error('Verification error:', error);
      return { isValid: false, data: null, error };
    }
    
    return { isValid: !!data, data, error: null };
  } catch (err) {
    console.error('Exception in verifyRegistrationCode:', err);
    return { isValid: false, data: null, error: err };
  }
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================
// PROFILE PICTURE FUNCTIONS
// ============================================

export const uploadAvatar = async (userId, file) => {
  try {
    // Delete old avatar if exists
    const { data: oldFiles } = await supabase.storage
      .from('avatars')
      .list(userId);
    
    if (oldFiles && oldFiles.length > 0) {
      await supabase.storage
        .from('avatars')
        .remove(oldFiles.map(file => `${userId}/${file.name}`));
    }

    // Upload new avatar
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { url: null, error };
  }
};

export const deleteAvatar = async (userId) => {
  try {
    // Delete from storage
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(userId);
    
    if (files && files.length > 0) {
      await supabase.storage
        .from('avatars')
        .remove(files.map(file => `${userId}/${file.name}`));
    }

    // Remove from profile
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return { success: false, error };
  }
};