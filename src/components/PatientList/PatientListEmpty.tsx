import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';

export function PatientListEmpty() {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 text-center">
      <User className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No patients</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by adding a new patient.
      </p>
      <div className="mt-6">
        <Link
          to="/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add New Patient
        </Link>
      </div>
    </div>
  );
}