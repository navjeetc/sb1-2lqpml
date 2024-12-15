import { supabase } from '../../config/supabase';
import type { Patient } from '../../types/patient';
import { initDB, STORE_NAME } from './initDb';
import { addToSyncQueue } from './syncOperations';
import { syncPatientWithServer, deletePatientFromServer, fetchPatientsFromServer } from '../../services/api';
import { getCurrentUser } from '../../services/auth';

export async function getAllPatients(): Promise<Patient[]> {
  try {
    // First try to get patients from server
    const serverPatients = await fetchPatientsFromServer();
    
    // If we got server data, sync it with local and return
    if (serverPatients.length > 0) {
      const db = await initDB();
      // Update local database with server data
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const patient of serverPatients) {
        await tx.store.put(patient);
      }
      await tx.done;
      return serverPatients;
    }

    // If no server data, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);
    return patients.filter(patient => !patient.deleted);
  } catch (error) {
    console.error('Error getting patients:', error);
    // If server fetch fails, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);
    return patients.filter(patient => !patient.deleted);
  }
}

export async function getPatient(id: string): Promise<Patient | null> {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (patient?.deleted) return null;
  return patient;
}

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

export async function updatePatient(patient: Patient): Promise<Patient> {
  const db = await initDB();
  const timestamp = new Date().toISOString();
  
  const user = await getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  
  const updatedPatient = {
    ...patient,
    lastUpdated: timestamp,
    lastUpdatedBy: user.id,
  };
  
  await db.put(STORE_NAME, updatedPatient);

  if (navigator.onLine) {
    try {
      await syncPatientWithServer(updatedPatient);
    } catch (error) {
      console.error('Error syncing updated patient:', error);
      await addToSyncQueue('update', updatedPatient);
    }
  } else {
    await addToSyncQueue('update', updatedPatient);
  }

  return updatedPatient;
}

export async function softDeletePatient(id: string): Promise<void> {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (!patient) return;

  const user = await getCurrentUser();
  if (!user) throw new Error('No authenticated user');

  const timestamp = new Date().toISOString();
  const updatedPatient = {
    ...patient,
    deleted: true,
    deletedAt: timestamp,
    deletedBy: user.id,
    lastUpdated: timestamp,
    lastUpdatedBy: user.id,
  };

  await db.put(STORE_NAME, updatedPatient);

  if (navigator.onLine) {
    try {
      await deletePatientFromServer(id);
    } catch (error) {
      console.error('Error syncing patient deletion:', error);
      await addToSyncQueue('delete', { id });
    }
  } else {
    await addToSyncQueue('delete', { id });
  }
}