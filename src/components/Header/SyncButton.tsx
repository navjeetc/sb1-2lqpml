import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { syncWithServer } from '../../utils/syncManager';
import { toast } from 'react-hot-toast';

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;

    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      setIsSyncing(true);
      await syncWithServer();
      toast.success('Data synchronized successfully');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to synchronize data');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={isSyncing}
      className="p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
      title="Sync data"
    >
      <RefreshCw 
        className={`h-6 w-6 text-gray-600 ${isSyncing ? 'animate-spin' : ''}`} 
      />
    </button>
  );
}