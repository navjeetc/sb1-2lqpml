import { getAllPatients, updatePatient } from '../db/patientOperations';
import { syncPatient } from '../../services/database/queries';
import type { Patient } from '../../types/patient';

export async function syncWithServer(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline: Skipping sync');
    return;
  }

  try {
    const localPatients = await getAllPatients();
    
    for (const patient of localPatients) {
      try {
        const { error } = await syncPatient(patient);
        if (error) {
          console.error(`Error syncing patient ${patient.id}:`, error);
          continue;
        }
      } catch (error) {
        console.error(`Error processing patient ${patient.id}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Error during sync:', error);
  }
}