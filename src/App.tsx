import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { PatientDetails } from './components/PatientDetails';
import { VitalSigns } from './components/VitalSigns';
import { OfflineIndicator } from './components/OfflineIndicator';
import { addPatient } from './utils/db';
import type { Patient } from './types/patient';

function NewPatientPage() {
  const navigate = useNavigate();
  
  const handleSubmit = async (data: Omit<Patient, 'id'>) => {
    try {
      await addPatient(data);
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient. Please try again.');
    }
  };

  const mockVitals = {
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 98.6,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    timestamp: new Date().toISOString()
  };

  return (
    <>
      <VitalSigns {...mockVitals} onUpdate={() => {}} />
      <PatientForm onSubmit={handleSubmit} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/patients" />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patient/:id" element={<PatientDetails />} />
          <Route path="/new" element={<NewPatientPage />} />
        </Routes>
        <OfflineIndicator />
      </Layout>
    </BrowserRouter>
  );
}

export default App;