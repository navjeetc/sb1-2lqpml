export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

export class SupabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConnectionError';
  }
}