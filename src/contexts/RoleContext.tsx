import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole } from '../services/api/roleService';
import type { UserRole } from '../types/role';

interface RoleContextType {
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  loading: true,
  error: null,
  refreshRole: async () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = async () => {
    try {
      setLoading(true);
      setError(null);
      const userRole = await getUserRole();
      setRole(userRole);
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError('Failed to fetch user role');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  const refreshRole = async () => {
    await fetchRole();
  };

  return (
    <RoleContext.Provider value={{ role, loading, error, refreshRole }}>
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