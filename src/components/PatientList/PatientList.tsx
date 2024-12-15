import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { PatientListItem } from './PatientListItem';
import { PatientListEmpty } from './PatientListEmpty';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useRole } from '../../contexts/RoleContext';
import { useAuth } from '../../contexts/AuthContext';

export function PatientList() {
  const { patients, loading, error } = usePatients();
  const { role } = useRole();
  const { user } = useAuth();

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

  // Filter patients for patient role
  const filteredPatients = role === 'patient' 
    ? patients.filter(p => p.createdBy === user?.id)
    : patients;

  // Show create patient button for patients without a record
  const showCreateButton = role === 'patient' && filteredPatients.length === 0;

  if (filteredPatients.length === 0 && !showCreateButton) {
    return <PatientListEmpty />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {role === 'patient' ? 'My Medical Record' : 'Patient Records'}
        </h2>
        {(role !== 'patient' || showCreateButton) && (
          <Link
            to="/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {role === 'patient' ? 'Create My Record' : 'Add New Patient'}
          </Link>
        )}
      </div>

      {filteredPatients.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              {role === 'patient' ? 'Your medical record' : `${filteredPatients.length} total patients`}
            </p>
          </div>

          <ul className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <PatientListItem key={patient.id} patient={patient} />
            ))}
          </ul>
        </div>
      )}

      {showCreateButton && (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900">Welcome to MedOnboard</h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven't created your medical record yet. Get started by creating one now.
          </p>
          <div className="mt-6">
            <Link
              to="/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create My Medical Record
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}