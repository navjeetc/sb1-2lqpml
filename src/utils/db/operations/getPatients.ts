import { initDB, STORE_NAME } from '../initDb';
import { fetchPatientsFromServer } from '../../../services/api';
import { getCurrentUser } from '../../../services/auth';
import { getUserRole } from '../../../services/api/roleService';

export async function getAllPatients(): Promise<Patient[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const role = await getUserRole();
    
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

      // Filter for patient role
      if (role === 'patient') {
        return serverPatients.filter(p => p.createdBy === user.id && !p.deleted);
      }
      return serverPatients.filter(p => !p.deleted);
    }

    // If no server data, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);
    const nonDeletedPatients = patients.filter(p => !p.deleted);

    // Filter for patient role
    if (role === 'patient') {
      return nonDeletedPatients.filter(p => p.createdBy === user.id);
    }
    return nonDeletedPatients;
  } catch (error) {
    console.error('Error getting patients:', error);
    // If server fetch fails, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);
    const nonDeletedPatients = patients.filter(p => !p.deleted);

    // Still apply patient role filter even in error case
    const user = await getCurrentUser();
    const role = await getUserRole();
    if (role === 'patient' && user) {
      return nonDeletedPatients.filter(p => p.createdBy === user.id);
    }
    return nonDeletedPatients;
  }
}