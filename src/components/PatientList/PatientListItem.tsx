import React from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Patient } from '../../types/patient';
import { usePatientCreator } from '../../hooks/usePatientCreator';

interface PatientListItemProps {
  patient: Patient;
}

export function PatientListItem({ patient }: PatientListItemProps) {
  const { creatorEmail, loading } = usePatientCreator(patient.createdBy);

  return (
    <li>
      <Link to={`/patient/${patient.id}`} className="block hover:bg-gray-50">
        <div className="flex items-center px-6 py-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {patient.firstName} {patient.lastName}
              </p>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-gray-500">
                DOB: {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')} • 
                Last updated: {format(new Date(patient.lastUpdated), 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-gray-400">
                Created by: {loading ? (
                  <span className="inline-block w-24 h-3 bg-gray-100 animate-pulse rounded">&nbsp;</span>
                ) : (
                  <span className="font-medium">{creatorEmail}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}