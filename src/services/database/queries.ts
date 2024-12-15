import { supabase } from '../../config/supabase';
import type { Patient } from '../../types/patient';
import { getCurrentUser } from '../auth';

export async function fetchPatients() {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        creator:created_by(email),
        updater:updated_by(email)
      `)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching patients:', error);
    return { data: null, error };
  }
}

export async function syncPatient(patient: Patient) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('patients')
      .upsert({
        id: patient.id,
        first_name: patient.firstName,
        last_name: patient.lastName,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        emergency_contact: patient.emergencyContact,
        insurance: patient.insurance,
        vital_signs: patient.vitalSigns,
        medical_history: patient.medicalHistory,
        chief_complaint: patient.chiefComplaint,
        symptoms: patient.symptoms,
        created_by: patient.createdBy || user.id,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error syncing patient:', error);
    return { error };
  }
}