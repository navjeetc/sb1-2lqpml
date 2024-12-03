import { getAllPatients, updatePatient } from './db';
import { fetchPatientsFromServer, syncPatientWithServer } from '../services/api';
import type { Patient } from '../types/patient';

export async function syncWithServer(): Promise<void> {
  // Skip sync if offline
  if (!navigator.onLine) {
    console.log('Offline: Skipping sync');
    return;
  }

  try {
    // Get all local patients
    const localPatients = await getAllPatients();
    const serverPatients = await fetchPatientsFromServer();

    // Create a map of server patients by ID for easy lookup
    const serverPatientsMap = new Map(
      serverPatients.map(patient => [patient.id, patient])
    );

    // Sync local patients to server
    for (const localPatient of localPatients) {
      try {
        const serverPatient = serverPatientsMap.get(localPatient.id);
        
        // If server version is newer, update local
        if (serverPatient && new Date(serverPatient.lastUpdated) > new Date(localPatient.lastUpdated)) {
          await updatePatient(serverPatient);
        } 
        // If local version is newer or no server version exists, sync to server
        else if (!serverPatient || new Date(localPatient.lastUpdated) > new Date(serverPatient.lastUpdated)) {
          await syncPatientWithServer(localPatient);
        }
      } catch (error) {
        console.error(`Error syncing patient ${localPatient.id}:`, error);
        // Continue with next patient
        continue;
      }
    }

    // Check for new patients on server that don't exist locally
    for (const serverPatient of serverPatients) {
      try {
        const exists = localPatients.some(p => p.id === serverPatient.id);
        if (!exists) {
          await updatePatient(serverPatient);
        }
      } catch (error) {
        console.error(`Error processing server patient ${serverPatient.id}:`, error);
        // Continue with next patient
        continue;
      }
    }
  } catch (error) {
    console.error('Error during sync:', error);
    // Don't throw to prevent blocking the app
    return;
  }
}

export function initializeSync(): void {
  // Sync when coming online
  window.addEventListener('online', () => {
    console.log('Online: Starting sync');
    syncWithServer().catch(error => {
      console.error('Error syncing when coming online:', error);
    });
  });

  // Initial sync if online
  if (navigator.onLine) {
    console.log('Online: Starting initial sync');
    syncWithServer().catch(error => {
      console.error('Error during initial sync:', error);
    });
  }

  // Set up periodic sync when online
  setInterval(() => {
    if (navigator.onLine) {
      syncWithServer().catch(error => {
        console.error('Error during periodic sync:', error);
      });
    }
  }, 5 * 60 * 1000); // Sync every 5 minutes
}