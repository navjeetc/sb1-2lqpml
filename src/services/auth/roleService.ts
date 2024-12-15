import { supabase } from '../../config/supabase';
import type { UserRole } from '../../types/role';

export async function assignDefaultRole(userId: string): Promise<void> {
  try {
    // Direct insert approach instead of RPC
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'receptionist',
        created_by: userId,
        updated_by: userId
      })
      .single();

    if (error) {
      // If insert fails due to unique constraint, try update
      if (error.code === '23505') {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({
            role: 'receptionist',
            updated_by: userId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error assigning default role:', error);
    throw error;
  }
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}