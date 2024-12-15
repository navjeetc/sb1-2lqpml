import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, UserPlus } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';

interface NavigationProps {
  onItemClick: () => void;
}

export function Navigation({ onItemClick }: NavigationProps) {
  const location = useLocation();
  const { navigationItems } = useNavigation();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/' && location.pathname === '/patients');
  };

  return (
    <nav className="mt-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}