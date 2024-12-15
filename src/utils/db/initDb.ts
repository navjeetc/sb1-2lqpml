import { openDB } from 'idb';

export const DB_NAME = 'medical-records';
export const STORE_NAME = 'patients';
export const SYNC_STORE = 'sync-queue';

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