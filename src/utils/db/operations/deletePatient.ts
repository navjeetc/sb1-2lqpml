import { initDB, STORE_NAME } from '../initDb';
import { deletePatientFromServer } from '../../../services/api';
import { addToSyncQueue } from '../syncOperations';
import { getCurrentUser } from '../../../services/auth';
import { getUserRole } from '../../../services/api/roleService';

export async function softDeletePatient(id: string): Promise<void> {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (!patient) return;

  const user = await getCurrentUser();
  if (!user) throw new Error('No authenticated user');

  // Check if user has admin role
  const role = await getUserRole();
  if (role !== 'admin') {
    throw new Error('Only administrators can delete patients');
  }

  const timestamp = new Date().toISOString();
  const updatedPatient = {
    ...patient,
    deleted: true,
    deletedAt: timestamp,
    deletedBy: user.id,
    lastUpdated: timestamp,
    lastUpdatedBy: user.id,
  };

  await db.put(STORE_NAME, updatedPatient);

  if (navigator.onLine) {
    try {
      await deletePatientFromServer(id);
    } catch (error) {
      console.error('Error syncing patient deletion:', error);
      await addToSyncQueue('delete', { id });
    }
  } else {
    await addToSyncQueue('delete', { id });
  }
}