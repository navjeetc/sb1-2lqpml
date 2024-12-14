// Re-export all database operations from their respective modules
export { initDB } from './db/initDb';
export {
  addPatient,
  getAllPatients,
  getPatient,
  updatePatient,
  softDeletePatient
} from './db/patientOperations';
export {
  addToSyncQueue,
  processOfflineQueue
} from './db/syncOperations';