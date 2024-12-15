// Supabase configuration types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date | null;
  error: Error | null;
}

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}