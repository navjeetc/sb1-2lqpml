import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function LogoutButton() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <button 
      onClick={handleSignOut}
      className="p-2 rounded-md hover:bg-gray-100 transition-colors"
      aria-label="Sign out"
    >
      <LogOut className="h-6 w-6 text-gray-600" />
    </button>
  );
}