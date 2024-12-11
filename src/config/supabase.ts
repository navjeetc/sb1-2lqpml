import { createClient } from '@supabase/supabase-js';
import { AUTH_CONFIG, getSiteUrl } from './auth';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseKey ? 'Set' : 'Missing'
  });
}

// Get the correct site URL for the current environment
const siteUrl = getSiteUrl();

// Create Supabase client with validated credentials
export const supabase = createClient(
  supabaseUrl || '',  // Fallback to empty string to prevent URL constructor error
  supabaseKey || '',  // Fallback to empty string to prevent invalid key error
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: AUTH_CONFIG.flowType,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
      debug: import.meta.env.DEV,
    },
  }
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};

export const getActiveUser = async () => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not properly configured');
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};