import { openDB } from 'idb';
import type { Patient } from '../types/patient';

const DB_NAME = 'medical-records';
const STORE_NAME = 'patients';
const SYNC_STORE = 'sync-queue';

export async function initDB() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      // Create patients store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastName', 'lastName');
        store.createIndex('dateOfBirth', 'dateOfBirth');
        store.createIndex('lastUpdated', 'lastUpdated');
        store.createIndex('deleted', 'deleted');
      }

      // Create sync queue store if it doesn't exist
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { 
          keyPath: 'id',
          autoIncrement: true 
        });
      }
    },
  });
  return db;
}

export async function addPatient(patientData: Omit<Patient, 'id'>) {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const patient: Patient = {
    id,
    firstName: patientData.firstName || '',
    lastName: patientData.lastName || '',
    dateOfBirth: patientData.dateOfBirth || '',
    gender: patientData.gender || 'other',
    email: patientData.email || '',
    phone: patientData.phone || '',
    address: {
      street: patientData.address?.street || '',
      city: patientData.address?.city || '',
      state: patientData.address?.state || '',
      zipCode: patientData.address?.zipCode || '',
    },
    emergencyContact: {
      name: patientData.emergencyContact?.name || '',
      relationship: patientData.emergencyContact?.relationship || '',
      phone: patientData.emergencyContact?.phone || '',
    },
    insurance: {
      provider: patientData.insurance?.provider || '',
      policyNumber: patientData.insurance?.policyNumber || '',
      groupNumber: patientData.insurance?.groupNumber || '',
    },
    vitalSigns: {
      bloodPressure: patientData.vitalSigns?.bloodPressure || '',
      heartRate: patientData.vitalSigns?.heartRate || 0,
      temperature: patientData.vitalSigns?.temperature || 0,
      respiratoryRate: patientData.vitalSigns?.respiratoryRate || 0,
      oxygenSaturation: patientData.vitalSigns?.oxygenSaturation || 0,
      timestamp: timestamp,
    },
    medicalHistory: {
      conditions: patientData.medicalHistory?.conditions || [],
      surgeries: patientData.medicalHistory?.surgeries || [],
      medications: patientData.medicalHistory?.medications || [],
      allergies: patientData.medicalHistory?.allergies || [],
    },
    chiefComplaint: patientData.chiefComplaint || '',
    symptoms: patientData.symptoms || [],
    lastUpdated: timestamp,
    lastUpdatedBy: 'current-user',
    deleted: false,
  };
  
  await db.add(STORE_NAME, patient);
  return patient;
}

export async function getAllPatients() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const patients = await store.getAll();
  return patients.filter(patient => !patient.deleted);
}

export async function getPatient(id: string) {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (patient?.deleted) return null;
  return patient;
}

export async function updatePatient(patient: Patient) {
  const db = await initDB();
  const timestamp = new Date().toISOString();
  
  const updatedPatient = {
    ...patient,
    lastUpdated: timestamp,
    lastUpdatedBy: 'current-user',
  };
  
  await db.put(STORE_NAME, updatedPatient);
  return updatedPatient;
}

export async function softDeletePatient(id: string) {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (!patient) return;

  const timestamp = new Date().toISOString();
  const updatedPatient = {
    ...patient,
    deleted: true,
    deletedAt: timestamp,
    deletedBy: 'current-user',
    lastUpdated: timestamp,
    lastUpdatedBy: 'current-user',
  };

  await db.put(STORE_NAME, updatedPatient);
  return updatedPatient;
}

export async function restorePatient(id: string) {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (!patient) return;

  const timestamp = new Date().toISOString();
  const updatedPatient = {
    ...patient,
    deleted: false,
    deletedAt: undefined,
    deletedBy: undefined,
    lastUpdated: timestamp,
    lastUpdatedBy: 'current-user',
  };

  await db.put(STORE_NAME, updatedPatient);
  return updatedPatient;
}