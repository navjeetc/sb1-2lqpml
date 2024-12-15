import { initDB, STORE_NAME } from '../initDb';
import { fetchPatientsFromServer } from '../../../services/api';
import { getCurrentUser } from '../../../services/auth';
import { getUserRole } from '../../../services/api/roleService';
import type { Patient } from '../../../types/patient';

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

      // Return all patients for admin, filter for others
      if (role === 'admin') {
        return serverPatients;
      } else if (role === 'patient') {
        return serverPatients.filter(p => p.createdBy === user.id && !p.deleted);
      } else {
        return serverPatients.filter(p => !p.deleted);
      }
    }

    // If no server data, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);

    // Return all patients for admin, filter for others
    if (role === 'admin') {
      return patients;
    } else if (role === 'patient') {
      return patients.filter(p => p.createdBy === user.id && !p.deleted);
    } else {
      return patients.filter(p => !p.deleted);
    }
  } catch (error) {
    console.error('Error getting patients:', error);
    // If server fetch fails, fall back to local data
    const db = await initDB();
    const patients = await db.getAll(STORE_NAME);

    // Still apply role-based filtering even in error case
    const role = await getUserRole();
    if (role === 'admin') {
      return patients;
    } else if (role === 'patient' && user) {
      return patients.filter(p => p.createdBy === user.id && !p.deleted);
    } else {
      return patients.filter(p => !p.deleted);
    }
  }
}