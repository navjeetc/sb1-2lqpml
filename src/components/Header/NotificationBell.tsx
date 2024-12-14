import React from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function NotificationBell() {
  const handleClick = () => {
    toast('Notifications coming soon!', {
      icon: '🔔',
      duration: 2000
    });
  };

  return (
    <button 
      onClick={handleClick}
      className="p-2 rounded-md hover:bg-gray-100 transition-colors"
    >
      <Bell className="h-6 w-6 text-gray-600" />
    </button>
  );
}