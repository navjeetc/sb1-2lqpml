import { supabase } from '../config/supabase';
import type { Patient } from '../types/patient';

// Convert client model to database model
function toDbModel(patient: Patient) {
  return {
    id: patient.id,
    first_name: patient.firstName,
    last_name: patient.lastName,
    date_of_birth: patient.dateOfBirth,
    gender: patient.gender,
    email: patient.email,
    phone: patient.phone,
    address_street: patient.address.street,
    address_city: patient.address.city,
    address_state: patient.address.state,
    address_zip_code: patient.address.zipCode,
    emergency_contact_name: patient.emergencyContact.name,
    emergency_contact_relationship: patient.emergencyContact.relationship,
    emergency_contact_phone: patient.emergencyContact.phone,
    insurance_provider: patient.insurance.provider,
    insurance_policy_number: patient.insurance.policyNumber,
    insurance_group_number: patient.insurance.groupNumber,
    vital_signs: patient.vitalSigns,
    medical_history: patient.medicalHistory,
    chief_complaint: patient.chiefComplaint,
    symptoms: patient.symptoms,
    last_updated: patient.lastUpdated,
    last_updated_by: patient.lastUpdatedBy,
    deleted: patient.deleted || false,
    deleted_at: patient.deletedAt,
    deleted_by: patient.deletedBy,
    synced_at: new Date().toISOString()
  };
}

// Convert database model to client model
function toClientModel(dbRecord: any): Patient {
  return {
    id: dbRecord.id,
    firstName: dbRecord.first_name,
    lastName: dbRecord.last_name,
    dateOfBirth: dbRecord.date_of_birth,
    gender: dbRecord.gender,
    email: dbRecord.email,
    phone: dbRecord.phone,
    address: {
      street: dbRecord.address_street,
      city: dbRecord.address_city,
      state: dbRecord.address_state,
      zipCode: dbRecord.address_zip_code,
    },
    emergencyContact: {
      name: dbRecord.emergency_contact_name,
      relationship: dbRecord.emergency_contact_relationship,
      phone: dbRecord.emergency_contact_phone,
    },
    insurance: {
      provider: dbRecord.insurance_provider,
      policyNumber: dbRecord.insurance_policy_number,
      groupNumber: dbRecord.insurance_group_number,
    },
    vitalSigns: dbRecord.vital_signs,
    medicalHistory: dbRecord.medical_history,
    chiefComplaint: dbRecord.chief_complaint,
    symptoms: dbRecord.symptoms,
    lastUpdated: dbRecord.last_updated,
    lastUpdatedBy: dbRecord.last_updated_by,
    deleted: dbRecord.deleted,
    deletedAt: dbRecord.deleted_at,
    deletedBy: dbRecord.deleted_by
  };
}

export async function syncPatientWithServer(patient: Patient): Promise<void> {
  if (!navigator.onLine || !supabase) {
    console.log('Offline or no Supabase client: Skipping server sync');
    return;
  }

  try {
    const dbModel = toDbModel(patient);
    const { error } = await supabase
      .from('patients')
      .upsert(dbModel);

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing patient with server:', error);
    return;
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
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return (data || []).map(toClientModel);
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
    const { error } = await supabase
      .from('patients')
      .update({ 
        deleted: true, 
        deleted_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting patient from server:', error);
    return;
  }
}