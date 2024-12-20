import { supabase } from '../../config/supabase';
import type { UserRole } from '../../types/role';
import { createDoctorProfile } from '../api/doctorService';
import { DOCTOR_SPECIALTIES } from '../../types/doctor';

export async function assignDefaultRole(userId: string): Promise<void> {
  try {
    // First check if role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      console.log('Role already exists for user:', userId);
      return;
    }

    // Call the RPC function to ensure role
    const { error } = await supabase
      .rpc('ensure_user_role', { user_id: userId });

    if (error) {
      console.error('Error assigning role:', error);
      throw error;
    }

    // Check if the assigned role is a doctor
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData?.role === 'doctor') {
      // Create doctor profile with default specialty
      await createDoctorProfile(userId, DOCTOR_SPECIALTIES.GENERAL_PHYSICIAN);
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