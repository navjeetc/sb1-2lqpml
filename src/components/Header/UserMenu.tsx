import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { Tooltip } from '../ui/Tooltip';

export function UserMenu() {
  const { user } = useAuth();
  const { role, loading, error } = useRole();

  const getRoleDisplay = () => {
    if (loading) return 'Loading...';
    if (error) return `Error: ${error}`;
    if (!role) return 'No role assigned';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const tooltipContent = (
    <div className="text-sm space-y-1">
      <p className="font-medium truncate">
        {user?.email || 'Not signed in'}
      </p>
      <p className={`${error ? 'text-red-300' : 'text-gray-300'}`}>
        Role: {getRoleDisplay()}
      </p>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <button 
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        <User className="h-6 w-6 text-gray-600" />
      </button>
    </Tooltip>
  );
}