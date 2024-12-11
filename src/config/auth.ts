// Auth configuration constants
export const AUTH_CONFIG = {
  flowType: 'pkce' as const,
  providers: [] as const,
  appearance: {
    theme: {
      colors: {
        brand: '#2563eb',
        brandAccent: '#1d4ed8',
      },
    },
    classes: {
      container: 'w-full',
      button: 'w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md',
      input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    },
  },
};

// Helper to get the correct site URL based on environment
export function getSiteUrl(): string {
  // Always use the current origin for auth callbacks
  // This ensures it works in all environments (Bolt, local dev, production)
  return window.location.origin;
}