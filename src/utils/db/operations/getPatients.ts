import { initDB, STORE_NAME } from '../initDb';
import { fetchPatientsFromServer } from '../../../services/api';

export async function getAllPatients(): Promise<Patient[]> {
  try {
    // First try to get patients from server
    const serverPatients = await fetchPatientsFromServer();
    
    // If we got server data, sync it with local and return
    if (serverPatients.length > 0) {
      const db = await initDB();
      // Update local database with server data
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const patient of serverPatients) {
        await tx.store.put(patient);
      }
      await tx.done;
      return serverPatients;
    }

    // If no server data, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);
    return patients.filter(patient => !patient.deleted);
  } catch (error) {
    console.error('Error getting patients:', error);
    // If server fetch fails, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);
    return patients.filter(patient => !patient.deleted);
  }
}

export async function getPatient(id: string): Promise<Patient | null> {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (patient?.deleted) return null;
  return patient;
}