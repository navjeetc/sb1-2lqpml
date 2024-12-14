import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Activity } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Patient List',
      description: 'View and manage all patient records',
      icon: Users,
      action: () => navigate('/patients'),
      color: 'bg-blue-500',
    },
    {
      title: 'New Patient',
      description: 'Register a new patient',
      icon: UserPlus,
      action: () => navigate('/new'),
      color: 'bg-green-500',
    },
    {
      title: 'Recent Activity',
      description: 'View recent patient updates',
      icon: Activity,
      action: () => navigate('/activity'),
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          
          return (
            <button
              key={card.title}
              onClick={card.action}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg ${card.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {card.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}