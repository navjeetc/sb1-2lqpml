import { supabase } from '../../config/supabase';
import { assignDefaultRole, checkRoleExists } from './roleService';
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

    // Wait for trigger to execute (with timeout)
    let attempts = 0;
    const maxAttempts = 3;
    const delay = 1000; // 1 second between attempts

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
      // Check if role was assigned by trigger
      const hasRole = await checkRoleExists(authData.user.id);
      if (hasRole) {
        console.log('Role assigned successfully by trigger');
        break;
      }

      attempts++;
      // On last attempt, try to assign role manually
      if (attempts === maxAttempts) {
        console.log('Trigger failed to assign role, attempting manual assignment');
        try {
          await assignDefaultRole(authData.user.id);
        } catch (roleError) {
          console.error('Manual role assignment failed:', roleError);
          // Continue with signup even if role assignment fails
          // The role can be assigned later
        }
      }
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