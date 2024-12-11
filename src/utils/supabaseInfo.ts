import { supabase } from '../config/supabase';

export function getSupabaseProjectInfo() {
  if (!supabase) {
    return {
      projectName: 'Not configured',
      isConfigured: false
    };
  }

  try {
    const url = new URL(supabase.supabaseUrl);
    const projectName = url.hostname.split('.')[0];
    return {
      projectName,
      isConfigured: true
    };
  } catch (error) {
    return {
      projectName: 'Invalid configuration',
      isConfigured: false
    };
  }
}