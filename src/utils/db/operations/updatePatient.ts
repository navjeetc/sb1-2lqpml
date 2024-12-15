import { initDB, STORE_NAME } from '../initDb';
import { syncPatientWithServer } from '../../../services/api';
import { addToSyncQueue } from '../syncOperations';
import { getCurrentUser } from '../../../services/auth';
import type { Patient } from '../../../types/patient';

export async function updatePatient(patient: Patient): Promise<Patient> {
  const db = await initDB();
  const timestamp = new Date().toISOString();
  
  const user = await getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  
  const updatedPatient = {
    ...patient,
    lastUpdated: timestamp,
    lastUpdatedBy: user.id,
  };
  
  await db.put(STORE_NAME, updatedPatient);

  if (navigator.onLine) {
    try {
      await syncPatientWithServer(updatedPatient);
    } catch (error) {
      console.error('Error syncing updated patient:', error);
      await addToSyncQueue('update', updatedPatient);
    }
  } else {
    await addToSyncQueue('update', updatedPatient);
  }

  return updatedPatient;
}