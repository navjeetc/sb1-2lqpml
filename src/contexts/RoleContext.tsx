import React, { createContext, useContext } from 'react';
import { useUserRole } from '../hooks/useUserRole';
import type { UserRole } from '../types/role';

interface RoleContextType {
  role: UserRole | null;
  loading: boolean;
  error: string | null;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  loading: true,
  error: null,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const roleState = useUserRole();

  return (
    <RoleContext.Provider value={roleState}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}