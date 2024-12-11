import { createClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials. Please check your environment variables.');
}

// Get the deployment URL or fallback to current origin
const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: AUTH_CONFIG.flowType,
    site: siteUrl,
    redirectTo: `${siteUrl}/auth/callback`
  },
});

export const getActiveUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};