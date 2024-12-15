import { env } from '../env';
import { SupabaseConfig } from './types';
import { SupabaseConfigError } from './types';

export function getSupabaseConfig(): SupabaseConfig {
  const { url, anonKey } = env.supabase;

  if (!url || !anonKey) {
    throw new SupabaseConfigError('Missing Supabase configuration. Check environment variables.');
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  try {
    const config = getSupabaseConfig();
    return Boolean(config.url && config.anonKey);
  } catch {
    return false;
  }
}