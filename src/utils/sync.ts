import { openDatabase } from '../services/database';
import { syncPatientWithServer, fetchPatientsFromServer } from '../services/api';

export async function initializeSync() {
  // Set up online/offline handlers
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial sync if online
  if (navigator.onLine) {
    await syncWithServer();
  }
}

async function handleOnline() {
  console.log('Back online - starting sync');
  await syncWithServer();
}

function handleOffline() {
  console.log('Gone offline - sync paused');
}

async function syncWithServer() {
  try {
    const db = await openDatabase();
    
    // Process sync queue first
    const tx = db.transaction('syncQueue', 'readwrite');
    const queue = await tx.store.getAll();
    
    for (const item of queue) {
      try {
        if (item.operation === 'add' || item.operation === 'update') {
          await syncPatientWithServer(item.data);
        }
        await tx.store.delete(item.key);
      } catch (error) {
        console.error('Error processing queue item:', error);
      }
    }
    
    // Then sync with server
    const serverPatients = await fetchPatientsFromServer();
    if (serverPatients.length > 0) {
      const patientsTx = db.transaction('patients', 'readwrite');
      for (const patient of serverPatients) {
        await patientsTx.store.put(patient);
      }
    }
  } catch (error) {
    console.error('Error during sync:', error);
  }
}