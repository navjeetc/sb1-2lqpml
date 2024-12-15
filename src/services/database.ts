import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { Patient } from '../types/patient';

interface MedicalDB extends DBSchema {
  patients: {
    key: string;
    value: Patient;
    indexes: {
      'by-last-name': string;
      'by-email': string;
      'by-updated': string;
    };
  };
  syncQueue: {
    key: number;
    value: {
      operation: 'add' | 'update' | 'delete';
      data: any;
      timestamp: string;
    };
  };
}

const DB_NAME = 'medical-records';
const DB_VERSION = 1;

export async function openDatabase() {
  return openDB<MedicalDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Patients store
      const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
      patientStore.createIndex('by-last-name', 'lastName');
      patientStore.createIndex('by-email', 'email');
      patientStore.createIndex('by-updated', 'lastUpdated');

      // Sync queue store
      db.createObjectStore('syncQueue', { 
        keyPath: 'id',
        autoIncrement: true 
      });
    },
  });
}