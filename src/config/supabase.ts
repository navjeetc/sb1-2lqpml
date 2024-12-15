import { createClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './auth';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseKey || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: AUTH_CONFIG.flowType,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
    },
  }
);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};

// Helper function to check connection with timeout
export const checkSupabaseConnection = async () => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    const checkPromise = supabase
      .from('user_roles')
      .select('count')
      .limit(1)
      .single();

    await Promise.race([checkPromise, timeoutPromise]);
    return true;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};