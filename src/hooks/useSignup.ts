import { useState } from 'react';
import { signUpUser } from '../services/auth/signupService';
import { assignDefaultRole } from '../services/auth/roleService';
import { toast } from 'react-hot-toast';

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signupError } = await signUpUser(email, password);

      if (signupError) {
        throw signupError;
      }

      if (data.user) {
        await assignDefaultRole(data.user.id);
        toast.success('Account created successfully! Please check your email to confirm your account.');
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}