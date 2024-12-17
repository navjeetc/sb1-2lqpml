import type { EnvConfig } from './types';

export const defaultConfig: EnvConfig = {
  supabase: {
    url: 'https://xyzcompanyid.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXZ3eHJsYnBzYmtrdGpzYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYyMjE5NDcsImV4cCI6MjAyMTc5Nzk0N30.0C_6n4QABxKgQzY-yqEYdnvqOWUq3sKbNBKq3J9FUvQ',
  },
  app: {
    version: '1.13',
    name: 'MedOnboard',
    description: 'Medical Patient Onboarding System',
  },
  practice: {
    name: 'Lamba Medical Group',
    emailDomain: 'lmg.com',
    address: '123 Medical Center Dr',
    phone: '(555) 123-4567',
    website: 'https://www.lmg.com',
  },
  features: {
    enableOfflineMode: true,
    enableNotifications: true,
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
  cache: {
    duration: 3600000,
    maxSize: 50,
  },
};