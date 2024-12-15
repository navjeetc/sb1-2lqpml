import { openDB } from 'idb';
import type { Patient } from '../../types/patient';

const DB_NAME = 'medical-records';
const SYNC_STORE = 'sync-queue';

interface SyncQueueItem {
  id?: number;
  operation: 'add' | 'update' | 'delete';
  data: Patient;
  timestamp: string;
}

export async function initOfflineDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { 
          keyPath: 'id',
          autoIncrement: true 
        });
      }
    },
  });
}

export async function addToSyncQueue(operation: SyncQueueItem['operation'], data: Patient) {
  const db = await initOfflineDB();
  await db.add(SYNC_STORE, {
    operation,
    data,
    timestamp: new Date().toISOString()
  });
}

export async function processSyncQueue() {
  const db = await initOfflineDB();
  const tx = db.transaction(SYNC_STORE, 'readwrite');
  const store = tx.objectStore(SYNC_STORE);
  const items = await store.getAll();

  for (const item of items) {
    try {
      await store.delete(item.id);
    } catch (error) {
      console.error('Error processing sync queue item:', error);
    }
  }
}