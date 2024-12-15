import { supabase } from '../../config/supabase';
import { assignDefaultRole } from './roleService';
import type { AuthError } from '@supabase/supabase-js';

export async function signUpUser(email: string, password: string) {
  try {
    // First, attempt to sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    // Then, assign the default role
    try {
      await assignDefaultRole(authData.user.id);
    } catch (roleError) {
      console.error('Role assignment error:', roleError);
      // Continue with signup even if role assignment fails
      // The role will be assigned by the database trigger
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      data: null,
      error: error as AuthError
    };
  }
}