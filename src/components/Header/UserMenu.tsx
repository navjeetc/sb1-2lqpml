import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { Link } from 'react-router-dom';

export function UserMenu() {
  const { user } = useAuth();
  const { role, loading, error } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleDisplay = () => {
    if (loading) return 'Loading...';
    if (error) return `Error: ${error}`;
    if (!role) return 'No role assigned';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className={`p-2 rounded-md transition-colors ${isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        aria-label="User menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-6 w-6 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-3 border-b">
            <p className="text-sm font-medium truncate">
              {user?.email || 'Not signed in'}
            </p>
            <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
              Role: {getRoleDisplay()}
            </p>
          </div>
          
          <div className="py-1">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              View Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}