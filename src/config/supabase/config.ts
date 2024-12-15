import { SupabaseConfig } from './types';
import { SupabaseConfigError } from './errors';

export function getSupabaseConfig(): SupabaseConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new SupabaseConfigError('Missing Supabase configuration. Check environment variables.');
  }

  return { supabaseUrl, supabaseKey };
}

export function isSupabaseConfigured(): boolean {
  try {
    const config = getSupabaseConfig();
    return Boolean(config.supabaseUrl && config.supabaseKey);
  } catch {
    return false;
  }
}