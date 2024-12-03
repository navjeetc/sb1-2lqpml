import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Default to offline mode if credentials are missing
let supabase = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('Supabase credentials not found. Running in offline-only mode.');
  }
} catch (error) {
  console.warn('Failed to initialize Supabase client. Running in offline-only mode.');
}

export { supabase };