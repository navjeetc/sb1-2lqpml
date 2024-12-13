// Practice-specific configuration
export const PRACTICE_CONFIG = {
  // Email domain for staff members (e.g., doctors, nurses, receptionists)
  staffEmailDomain: import.meta.env.VITE_PRACTICE_EMAIL_DOMAIN || 'hospital.com',
  
  // Practice information
  name: import.meta.env.VITE_PRACTICE_NAME || 'Medical Practice',
  address: import.meta.env.VITE_PRACTICE_ADDRESS || '',
  phone: import.meta.env.VITE_PRACTICE_PHONE || '',
  website: import.meta.env.VITE_PRACTICE_WEBSITE || '',
};

// Helper function to check if an email belongs to staff
export function isStaffEmail(email: string): boolean {
  return email.endsWith(`@${PRACTICE_CONFIG.staffEmailDomain}`);
}