export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist';

export interface UserRoleInfo {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}