import React from 'react';
import { Menu } from 'lucide-react';
import { appConfig } from '../../config/appConfig';
import { NotificationBell } from './NotificationBell';
import { SyncButton } from './SyncButton';
import { UserMenu } from './UserMenu';
import { LogoutButton } from './LogoutButton';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={onMenuClick} 
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2 ml-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {appConfig.name}
              </h1>
              <span className="text-xs text-gray-500">v{appConfig.version}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <SyncButton />
            <UserMenu />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}