import { supabase } from '../../config/supabase';
import type { UserRole, UserRoleInfo } from '../../types/role';

export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.user.id)
      .single();

    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

export async function getAllRoles(): Promise<UserRoleInfo[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        updated_at,
        created_by,
        updated_by
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(role => ({
      id: role.id,
      userId: role.user_id,
      role: role.role,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
      createdBy: role.created_by,
      updatedBy: role.updated_by
    }));
  } catch (error) {
    console.error('Error fetching all roles:', error);
    return [];
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('user_roles')
      .update({ 
        role,
        updated_by: currentUser.user.id
      })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}