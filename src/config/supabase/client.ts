import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';
import { SupabaseConfigError } from './errors';
import { AUTH_CONFIG } from '../auth';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    const config = getSupabaseConfig();
    
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: AUTH_CONFIG.flowType,
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
      },
    });

    return supabaseInstance;
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      console.error('Supabase configuration error:', error.message);
    } else {
      console.error('Failed to initialize Supabase client:', error);
    }
    throw error;
  }
}

// Export for backward compatibility
export const supabase = getSupabaseClient();