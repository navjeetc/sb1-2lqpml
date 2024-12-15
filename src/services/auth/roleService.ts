import { supabase } from '../../config/supabase';
import type { UserRole } from '../../types/role';
import { getCurrentUser } from './sessionService';

export async function assignDefaultRole(userId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    // First check if role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      console.log('Role already exists for user:', userId);
      return;
    }

    // Insert new role
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
      console.error('Error inserting role:', error);
      throw error;
    }

    console.log('Role assigned successfully for user:', userId);
  } catch (error) {
    console.error('Error in assignDefaultRole:', error);
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

    if (error) {
      console.error('Error fetching user role:', error);
      throw error;
    }

    return data?.role || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

export async function checkRoleExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error checking role:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkRoleExists:', error);
    return false;
  }
}