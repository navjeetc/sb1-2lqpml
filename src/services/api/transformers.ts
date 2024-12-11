import type { Patient } from '../../types/patient';

export function toDbModel(patient: Patient, userId: string) {
  return {
    id: patient.id,
    created_by: userId,
    updated_by: userId,
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
    deleted: patient.deleted || false,
    deleted_at: patient.deletedAt,
    deleted_by: patient.deletedBy,
    updated_at: new Date().toISOString()
  };
}

export function toClientModel(dbRecord: any): Patient {
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
    deleted: dbRecord.deleted,
    deletedAt: dbRecord.deleted_at,
    deletedBy: dbRecord.deleted_by
  };
}