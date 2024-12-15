import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PatientForm } from '../components/PatientForm';
import { addPatient } from '../utils/db/patientOperations';
import type { Patient } from '../types/patient';

export function NewPatientPage() {
  const navigate = useNavigate();
  
  const handleSubmit = async (data: Omit<Patient, 'id'>) => {
    try {
      await addPatient(data);
      toast.success('Patient added successfully');
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Error saving patient. Please try again.');
    }
  };

  return <PatientForm onSubmit={handleSubmit} />;
}