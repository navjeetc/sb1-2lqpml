import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';
import { SupabaseConfigError } from './types';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    const config = getSupabaseConfig();
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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