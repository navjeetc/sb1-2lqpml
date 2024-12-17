import { defaultConfig } from './defaults';
import type { EnvConfig } from './types';

// Load and validate environment variables with fallback to defaults
export const env: EnvConfig = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || defaultConfig.supabase.url,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || defaultConfig.supabase.anonKey,
  },
  app: {
    version: import.meta.env.VITE_APP_VERSION || defaultConfig.app.version,
    name: import.meta.env.VITE_APP_NAME || defaultConfig.app.name,
    description: import.meta.env.VITE_APP_DESCRIPTION || defaultConfig.app.description,
  },
  practice: {
    name: import.meta.env.VITE_PRACTICE_NAME || defaultConfig.practice.name,
    emailDomain: import.meta.env.VITE_PRACTICE_EMAIL_DOMAIN || defaultConfig.practice.emailDomain,
    address: import.meta.env.VITE_PRACTICE_ADDRESS || defaultConfig.practice.address,
    phone: import.meta.env.VITE_PRACTICE_PHONE || defaultConfig.practice.phone,
    website: import.meta.env.VITE_PRACTICE_WEBSITE || defaultConfig.practice.website,
  },
  features: {
    enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true' || defaultConfig.features.enableOfflineMode,
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true' || defaultConfig.features.enableNotifications,
  },
  api: {
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || defaultConfig.api.timeout,
    retryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || defaultConfig.api.retryAttempts,
  },
  cache: {
    duration: Number(import.meta.env.VITE_CACHE_DURATION) || defaultConfig.cache.duration,
    maxSize: Number(import.meta.env.VITE_MAX_CACHE_SIZE) || defaultConfig.cache.maxSize,
  },
};