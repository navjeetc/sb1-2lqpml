import { supabase } from '../../config/supabase';
import type { UserRole } from '../../types/role';

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
    console.error('Error fetching user role:', error);
    return null;
  }
}

export async function assignUserRole(userId: string, role: UserRole) {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        created_by: userId,
        updated_by: userId
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error assigning user role:', error);
    return { error };
  }
}