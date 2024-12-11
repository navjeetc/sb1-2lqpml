import { openDB } from 'idb';
import type { Patient } from '../types/patient';
import { syncPatientWithServer, deletePatientFromServer } from '../services/api';
import { supabase } from '../config/supabase';

const DB_NAME = 'medical-records';
const STORE_NAME = 'patients';
const SYNC_STORE = 'sync-queue';

export async function initDB() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastName', 'lastName');
        store.createIndex('dateOfBirth', 'dateOfBirth');
        store.createIndex('lastUpdated', 'lastUpdated');
        store.createIndex('deleted', 'deleted');
      }

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
  
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
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

  // Sync with server if online
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
  
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
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

export async function softDeletePatient(id: string) {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (!patient) return;

  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
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

  return updatedPatient;
}

export async function addToSyncQueue(operation: string, data: any) {
  const db = await initDB();
  await db.add(SYNC_STORE, {
    operation,
    data,
    timestamp: new Date().toISOString()
  });
}

export async function processOfflineQueue() {
  const db = await initDB();
  const tx = db.transaction(SYNC_STORE, 'readwrite');
  const store = tx.objectStore(SYNC_STORE);
  const items = await store.getAll();

  for (const item of items) {
    try {
      switch (item.operation) {
        case 'add':
        case 'update':
          await syncPatientWithServer(item.data);
          break;
        case 'delete':
          await deletePatientFromServer(item.data.id);
          break;
      }
      await store.delete(item.id);
    } catch (error) {
      console.error('Error processing sync queue item:', error);
    }
  }
}