// Type definitions for environment variables
interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    version: string;
    name: string;
    description: string;
  };
  practice: {
    name: string;
    emailDomain: string;
    address: string;
    phone: string;
    website: string;
  };
  features: {
    enableOfflineMode: boolean;
    enableNotifications: boolean;
  };
  api: {
    timeout: number;
    retryAttempts: number;
  };
  cache: {
    duration: number;
    maxSize: number;
  };
}

// Load and validate environment variables
export const env: EnvConfig = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    version: import.meta.env.VITE_APP_VERSION || '1.01',
    name: import.meta.env.VITE_APP_NAME || 'MedOnboard',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Medical Patient Onboarding System',
  },
  practice: {
    name: import.meta.env.VITE_PRACTICE_NAME || 'Medical Practice',
    emailDomain: import.meta.env.VITE_PRACTICE_EMAIL_DOMAIN || 'hospital.com',
    address: import.meta.env.VITE_PRACTICE_ADDRESS || '',
    phone: import.meta.env.VITE_PRACTICE_PHONE || '',
    website: import.meta.env.VITE_PRACTICE_WEBSITE || '',
  },
  features: {
    enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  },
  api: {
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    retryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  },
  cache: {
    duration: Number(import.meta.env.VITE_CACHE_DURATION) || 3600000,
    maxSize: Number(import.meta.env.VITE_MAX_CACHE_SIZE) || 50,
  },
};

// Validate required environment variables
export function validateEnv() {
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