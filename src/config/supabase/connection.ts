import { getSupabaseClient } from './client';
import { ConnectionStatus } from './types';

let connectionStatus: ConnectionStatus = {
  isConnected: false,
  lastChecked: null,
  error: null
};

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    const checkPromise = supabase
      .from('user_roles')
      .select('count')
      .limit(1)
      .single();

    await Promise.race([checkPromise, timeoutPromise]);

    connectionStatus = {
      isConnected: true,
      lastChecked: new Date(),
      error: null
    };

    return true;
  } catch (error) {
    connectionStatus = {
      isConnected: false,
      lastChecked: new Date(),
      error: error instanceof Error ? error : new Error('Unknown error')
    };

    console.error('Supabase connection check failed:', error);
    return false;
  }
}

export function getConnectionStatus(): ConnectionStatus {
  return { ...connectionStatus };
}

export function setupConnectionMonitoring(checkInterval = 30000) {
  let intervalId: number;

  const checkConnection = async () => {
    await checkSupabaseConnection();
  };

  const startMonitoring = () => {
    checkConnection();
    intervalId = window.setInterval(checkConnection, checkInterval);
  };

  const stopMonitoring = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  // Start monitoring when online
  window.addEventListener('online', startMonitoring);
  window.addEventListener('offline', stopMonitoring);

  // Initial check if online
  if (navigator.onLine) {
    startMonitoring();
  }

  // Return cleanup function
  return () => {
    stopMonitoring();
    window.removeEventListener('online', startMonitoring);
    window.removeEventListener('offline', stopMonitoring);
  };
}