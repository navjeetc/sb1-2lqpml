import { useState, useEffect } from 'react';
import { 
  checkSupabaseConnection, 
  setupConnectionMonitoring,
  getConnectionStatus,
  type ConnectionStatus 
} from '../config/supabase';

export function useSupabaseConnection() {
  const [status, setStatus] = useState<ConnectionStatus>(getConnectionStatus());
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      if (checking || !mounted) return;
      
      setChecking(true);
      await checkSupabaseConnection();
      
      if (mounted) {
        setStatus(getConnectionStatus());
        setChecking(false);
      }
    };

    // Set up connection monitoring
    const cleanup = setupConnectionMonitoring();

    // Initial check
    checkConnection();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  return {
    isConnected: status.isConnected,
    lastChecked: status.lastChecked,
    error: status.error,
    checking
  };
}