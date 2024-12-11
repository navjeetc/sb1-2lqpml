import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { AuthPage } from './pages/AuthPage';
import { Layout } from './components/Layout';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { PatientDetails } from './components/PatientDetails';
import { VitalSigns } from './components/VitalSigns';
import { OfflineIndicator } from './components/OfflineIndicator';
import { addPatient } from './utils/db';
import type { Patient } from './types/patient';

function AuthCallback() {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // After auth callback, redirect to the main page
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

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

function ProtectedRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/patients" />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patient/:id" element={<PatientDetails />} />
        <Route path="/new" element={<NewPatientPage />} />
      </Routes>
      <OfflineIndicator />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <ProtectedRoutes />
              </AuthGuard>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;