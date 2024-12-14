import { supabase } from '../../config/supabase';
import type { UserRole } from '../../types/role';

export async function getUserRole(): Promise<UserRole | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed');
    }

    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    // Fetch user role with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });

    const fetchPromise = supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Database error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      console.log('No role found for user');
      return null;
    }

    return data.role;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    throw error;
  }
}