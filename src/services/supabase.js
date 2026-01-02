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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  
  return { data, error };
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
  console.log('Getting profile for userId:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .limit(1);
  
  console.log('getUserProfile result:', { data, error });
  return { data: data?.[0] || null, error };
};

export const verifyRegistrationCode = async (code) => {
  console.log('Verifying code:', code); // DEBUG
  
  const { data, error } = await supabase
    .from('registration_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();
  
  console.log('Verification result:', { data, error }); // DEBUG
  
  return { isValid: !!data && !error, data, error };
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};