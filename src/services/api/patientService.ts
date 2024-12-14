import { supabase } from '../../config/supabase';
import type { Patient } from '../../types/patient';
import { toDbModel, toClientModel } from './transformers';

export async function syncPatientWithServer(patient: Patient): Promise<void> {
  if (!navigator.onLine || !supabase) {
    console.log('Offline or no Supabase client: Skipping server sync');
    return;
  }

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const dbModel = toDbModel(patient, user.user.id);
    const { error } = await supabase
      .from('patients')
      .upsert(dbModel, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing patient with server:', error);
    throw error;
  }
}

export async function fetchPatientsFromServer(): Promise<Patient[]> {
  if (!navigator.onLine || !supabase) {
    console.log('Offline or no Supabase client: Using local data only');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*, created_by')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Get creator emails in parallel
    const patients = await Promise.all(
      data.map(async (record) => {
        const { data: email } = await supabase
          .rpc('get_user_email', { user_id: record.created_by });

        return {
          ...toClientModel(record),
          creatorEmail: email || 'Unknown'
        };
      })
    );

    return patients;
  } catch (error) {
    console.error('Error fetching patients from server:', error);
    return [];
  }
}

export async function deletePatientFromServer(id: string): Promise<void> {
  if (!navigator.onLine || !supabase) {
    console.log('Offline or no Supabase client: Skipping server deletion');
    return;
  }

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('patients')
      .update({ 
        deleted: true, 
        deleted_at: new Date().toISOString(),
        deleted_by: user.user.id,
        updated_at: new Date().toISOString(),
        updated_by: user.user.id
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting patient from server:', error);
    throw error;
  }
}