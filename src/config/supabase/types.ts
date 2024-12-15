export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date | null;
  error: Error | null;
}