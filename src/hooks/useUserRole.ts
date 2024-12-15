import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRole } from '../services/api/roleService';
import { checkSupabaseConnection } from '../config/supabase';
import type { UserRole } from '../types/role';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check database connection first
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      const userRole = await getUserRole();
      if (!userRole) {
        setError('No role assigned');
        setRole(null);
      } else {
        setError(null);
        setRole(userRole);
      }
    } catch (err) {
      console.error('Error fetching role:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch role');
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return { role, loading, error };
}