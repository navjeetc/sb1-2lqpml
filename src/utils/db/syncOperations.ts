import { initDB, SYNC_STORE } from './initDb';
import { syncPatientWithServer, deletePatientFromServer } from '../../services/api';

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