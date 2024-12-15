import { useState, useEffect } from 'react';
import { getAllPatients } from '../utils/db/patientOperations';
import type { Patient } from '../types/patient';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        setError(null);
        const allPatients = await getAllPatients();
        setPatients(allPatients);
      } catch (error) {
        console.error('Error loading patients:', error);
        setError('Failed to load patients. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  return { patients, loading, error };
}