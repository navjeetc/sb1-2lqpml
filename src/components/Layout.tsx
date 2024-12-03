import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Users, Home, X, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { appConfig } from '../config/appConfig';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Patient List', href: '/patients', icon: Users },
    { name: 'Add New Patient', href: '/new', icon: UserPlus },
  ];

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  const handleFeatureClick = (feature: string) => {
    toast('This feature is under construction', {
      icon: '🚧',
      duration: 3000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-30 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-900">MedOnboard</h1>
            <span className="text-xs text-gray-500">v{appConfig.version}</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <nav className="mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href === '/' && location.pathname === '/patients');
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleMenuItemClick}
                className={`flex items-center px-4 py-2 text-sm font-medium ${
                  isActive
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
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2 ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  MedOnboard
                </h1>
                <span className="text-xs text-gray-500">v{appConfig.version}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleFeatureClick('notifications')}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Bell className="h-6 w-6 text-gray-600" />
              </button>
              <button 
                onClick={() => handleFeatureClick('profile')}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <User className="h-6 w-6 text-gray-600" />
              </button>
              <button 
                onClick={() => handleFeatureClick('logout')}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <LogOut className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}