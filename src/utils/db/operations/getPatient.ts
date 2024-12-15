import { initDB, STORE_NAME } from '../initDb';
import type { Patient } from '../../../types/patient';

export async function getPatient(id: string): Promise<Patient | null> {
  const db = await initDB();
  const patient = await db.get(STORE_NAME, id);
  if (patient?.deleted) return null;
  return patient;
}