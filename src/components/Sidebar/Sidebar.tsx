import React from 'react';
import { X } from 'lucide-react';
import { Navigation } from './Navigation';
import { appConfig } from '../../config/appConfig';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-900">{appConfig.name}</h1>
            <span className="text-xs text-gray-500">v{appConfig.version}</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        <Navigation onItemClick={onClose} />
      </div>
    </>
  );
}