import { supabase } from '../../config/supabase';
import type { Patient } from '../../types/patient';

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
    address: {
      street: patient.address.street,
      city: patient.address.city,
      state: patient.address.state,
      zipCode: patient.address.zipCode,
    },
    emergency_contact: {
      name: patient.emergencyContact.name,
      relationship: patient.emergencyContact.relationship,
      phone: patient.emergencyContact.phone,
    },
    insurance: {
      provider: patient.insurance.provider,
      policyNumber: patient.insurance.policyNumber,
      groupNumber: patient.insurance.groupNumber,
    },
    vital_signs: patient.vitalSigns,
    medical_history: patient.medicalHistory,
    chief_complaint: patient.chiefComplaint,
    symptoms: patient.symptoms,
    deleted: patient.deleted || false,
    deleted_at: patient.deletedAt,
    deleted_by: patient.deletedBy,
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
    address: dbRecord.address,
    emergencyContact: dbRecord.emergency_contact,
    insurance: dbRecord.insurance,
    vitalSigns: dbRecord.vital_signs,
    medicalHistory: dbRecord.medical_history,
    chiefComplaint: dbRecord.chief_complaint,
    symptoms: dbRecord.symptoms,
    lastUpdated: dbRecord.updated_at,
    lastUpdatedBy: dbRecord.updated_by,
    createdBy: dbRecord.created_by,
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
      .select('*')
      .order('updated_at', { ascending: false });

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
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting patient from server:', error);
    throw error;
  }
}