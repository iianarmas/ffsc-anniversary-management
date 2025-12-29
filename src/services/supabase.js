import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bxeumobdnfqnjtribmtc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXVtb2JkbmZxbmp0cmlibXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3OTYwMjksImV4cCI6MjA4MjM3MjAyOX0.cb_kkdm7SW3k-VD8BhmMZDRCmrk_9wYZW9_gVzUMWxo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);