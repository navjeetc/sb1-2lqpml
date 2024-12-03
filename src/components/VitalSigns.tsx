import React from 'react';
import { Activity } from 'lucide-react';

interface VitalSignsProps {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  timestamp: string;
  onUpdate: (vitals: any) => void;
}

export function VitalSigns({
  bloodPressure,
  heartRate,
  temperature,
  respiratoryRate,
  oxygenSaturation,
  timestamp,
  onUpdate,
}: VitalSignsProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Vital Signs</h2>
        </div>
        <span className="text-sm text-gray-500">
          Last updated: {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Blood Pressure</h3>
          <p className="mt-1 text-2xl font-semibold">{bloodPressure}</p>
          <p className="text-xs text-gray-500">mmHg</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Heart Rate</h3>
          <p className="mt-1 text-2xl font-semibold">{heartRate}</p>
          <p className="text-xs text-gray-500">bpm</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Temperature</h3>
          <p className="mt-1 text-2xl font-semibold">{temperature}</p>
          <p className="text-xs text-gray-500">°F</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Respiratory Rate</h3>
          <p className="mt-1 text-2xl font-semibold">{respiratoryRate}</p>
          <p className="text-xs text-gray-500">breaths/min</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">O2 Saturation</h3>
          <p className="mt-1 text-2xl font-semibold">{oxygenSaturation}</p>
          <p className="text-xs text-gray-500">%</p>
        </div>
      </div>

      <button
        onClick={() => onUpdate({})}
        className="mt-6 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Update Vital Signs
      </button>
    </div>
  );
}