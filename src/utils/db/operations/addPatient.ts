import { initDB, STORE_NAME } from '../initDb';
import { syncPatientWithServer } from '../../../services/api';
import { addToSyncQueue } from '../syncOperations';
import { getCurrentUser } from '../../../services/auth';
import type { Patient } from '../../../types/patient';

export async function addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const user = await getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  
  const patient: Patient = {
    id,
    firstName: patientData.firstName || '',
    lastName: patientData.lastName || '',
    dateOfBirth: patientData.dateOfBirth || '',
    gender: patientData.gender || 'other',
    email: patientData.email || '',
    phone: patientData.phone || '',
    address: patientData.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    emergencyContact: patientData.emergencyContact || {
      name: '',
      relationship: '',
      phone: '',
    },
    insurance: patientData.insurance || {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    },
    vitalSigns: patientData.vitalSigns || {
      bloodPressure: '',
      heartRate: 0,
      temperature: 0,
      respiratoryRate: 0,
      oxygenSaturation: 0,
      timestamp: timestamp,
    },
    medicalHistory: patientData.medicalHistory || {
      conditions: [],
      surgeries: [],
      medications: [],
      allergies: [],
    },
    chiefComplaint: patientData.chiefComplaint || '',
    symptoms: patientData.symptoms || [],
    lastUpdated: timestamp,
    lastUpdatedBy: user.id,
    createdBy: user.id,
    deleted: false,
  };
  
  await db.add(STORE_NAME, patient);

  if (navigator.onLine) {
    try {
      await syncPatientWithServer(patient);
    } catch (error) {
      console.error('Error syncing new patient:', error);
      await addToSyncQueue('add', patient);
    }
  } else {
    await addToSyncQueue('add', patient);
  }

  return patient;
}