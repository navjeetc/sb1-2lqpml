import { useEffect, useState } from 'react';
import { syncWithServer } from '../utils/sync';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let syncInterval: number;

    async function performSync() {
      if (!navigator.onLine || isSyncing) return;

      try {
        setIsSyncing(true);
        setError(null);
        await syncWithServer();
        setLastSync(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sync failed');
      } finally {
        setIsSyncing(false);
      }
    }

    // Initial sync
    performSync();

    // Set up periodic sync
    if (navigator.onLine) {
      syncInterval = window.setInterval(performSync, 5 * 60 * 1000); // Every 5 minutes
    }

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, []);

  return { isSyncing, lastSync, error };
}