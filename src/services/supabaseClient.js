import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1qhA0xAnNSd3VxpoLdxYrQ_yUemEhaP';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_URL.startsWith('http') && 
  SUPABASE_ANON_KEY
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;
