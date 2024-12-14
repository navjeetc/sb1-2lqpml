import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { PatientListItem } from './PatientListItem';
import { PatientListEmpty } from './PatientListEmpty';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function PatientList() {
  const { patients, loading, error } = usePatients();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return <PatientListEmpty />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Patient Records</h2>
        <Link
          to="/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add New Patient
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            {patients.length} total patients
          </p>
        </div>

        <ul className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <PatientListItem key={patient.id} patient={patient} />
          ))}
        </ul>
      </div>
    </div>
  );
}