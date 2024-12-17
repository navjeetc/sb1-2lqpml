// Environment configuration types
export interface EnvConfig {
  supabase: SupabaseConfig;
  app: AppConfig;
  practice: PracticeConfig;
  features: FeatureFlags;
  api: ApiConfig;
  cache: CacheConfig;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface AppConfig {
  version: string;
  name: string;
  description: string;
}

export interface PracticeConfig {
  name: string;
  emailDomain: string;
  address: string;
  phone: string;
  website: string;
}

export interface FeatureFlags {
  enableOfflineMode: boolean;
  enableNotifications: boolean;
}

export interface ApiConfig {
  timeout: number;
  retryAttempts: number;
}

export interface CacheConfig {
  duration: number;
  maxSize: number;
}