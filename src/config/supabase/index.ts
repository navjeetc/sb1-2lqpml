// Re-export all Supabase configuration
export * from './types';
export * from './config';
export * from './client';
export * from './connection';

// For backward compatibility
export { supabase } from './client';