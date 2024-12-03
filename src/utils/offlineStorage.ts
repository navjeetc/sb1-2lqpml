import { openDB } from 'idb';
import type { Patient } from '../types/patient';

const DB_NAME = 'medical-records';
const STORE_NAME = 'patients';
const SYNC_STORE = 'sync-queue';

export async function initDB() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      // Create patients store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastName', 'lastName');
        store.createIndex('dateOfBirth', 'dateOfBirth');
        store.createIndex('lastUpdated', 'lastUpdated');
      }

      // Create sync queue store
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
      // Process each queued operation
      switch (item.operation) {
        case 'add':
          await db.add(STORE_NAME, item.data);
          break;
        case 'update':
          await db.put(STORE_NAME, item.data);
          break;
        case 'delete':
          await db.delete(STORE_NAME, item.data.id);
          break;
      }
      // Remove processed item from queue
      await store.delete(item.id);
    } catch (error) {
      console.error('Error processing offline queue item:', error);
    }
  }
}

// Check online status and process queue when back online
export function initOfflineSync() {
  window.addEventListener('online', async () => {
    console.log('Back online - processing offline queue...');
    await processOfflineQueue();
  });
}

// Modified database operations to work offline
export async function addPatient(patientData: Omit<Patient, 'id'>) {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const patient: Patient = {
    id,
    ...patientData,
    lastUpdated: timestamp,
    lastUpdatedBy: 'current-user'
  };

  try {
    await db.add(STORE_NAME, patient);
  } catch (error) {
    // If offline, add to sync queue
    await addToSyncQueue('add', patient);
  }
  
  return patient;
}

export async function updatePatient(patient: Patient) {
  const db = await initDB();
  const timestamp = new Date().toISOString();
  
  const updatedPatient = {
    ...patient,
    lastUpdated: timestamp,
    lastUpdatedBy: 'current-user'
  };

  try {
    await db.put(STORE_NAME, updatedPatient);
  } catch (error) {
    await addToSyncQueue('update', updatedPatient);
  }

  return updatedPatient;
}

export async function deletePatient(id: string) {
  const db = await initDB();
  try {
    await db.delete(STORE_NAME, id);
  } catch (error) {
    await addToSyncQueue('delete', { id });
  }
}

export async function getAllPatients() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function getPatient(id: string) {
  const db = await initDB();
  return db.get(STORE_NAME, id);
}