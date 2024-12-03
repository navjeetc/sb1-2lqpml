import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, User, Activity, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { getPatient, softDeletePatient } from '../utils/db';
import type { Patient } from '../types/patient';
import { VitalSigns } from './VitalSigns';
import toast from 'react-hot-toast';

export function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatient() {
      try {
        if (!id) return;
        setLoading(true);
        setError(null);
        const data = await getPatient(id);
        if (!data) {
          setError('Patient not found');
          return;
        }
        setPatient(data);
      } catch (error) {
        console.error('Error loading patient:', error);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [id]);

  const handleDelete = async () => {
    if (!patient?.id) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this patient record? This action can be undone later.'
    );
    
    if (confirmed) {
      try {
        await softDeletePatient(patient.id);
        toast.success('Patient record deleted successfully');
        navigate('/patients');
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error('Failed to delete patient record');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-2 text-sm text-red-600 hover:text-red-500"
        >
          Return to Patient List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Patient List
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Patient
          </button>
          <span className="text-sm text-gray-500">
            Last updated: {format(new Date(patient.lastUpdated), 'PPpp')}
          </span>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* ... */}
    </div>
  );
}