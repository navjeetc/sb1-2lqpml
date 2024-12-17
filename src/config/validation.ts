import { env } from './env';

export function validateEnv(): void {
  const required = [
    ['VITE_SUPABASE_URL', env.supabase.url],
    ['VITE_SUPABASE_ANON_KEY', env.supabase.anonKey],
  ];

  const missing = required.filter(([name, value]) => !value);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing
        .map(([name]) => name)
        .join(', ')}`
    );
  }
}