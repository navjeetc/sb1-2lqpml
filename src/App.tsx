import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { AuthGuard } from './components/AuthGuard';
import { AuthPage } from './pages/AuthPage';
import { AuthCallback } from './components/AuthCallback';
import { Layout } from './components/Layout';
import { PatientList } from './components/PatientList/PatientList';
import { PatientDetails } from './components/PatientDetails';
import { Dashboard } from './pages/Dashboard';
import { NewPatientPage } from './pages/NewPatient';
import { Profile } from './pages/Profile';

function ProtectedRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patient/:id" element={<PatientDetails />} />
        <Route path="/new" element={<NewPatientPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
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
      </RoleProvider>
    </AuthProvider>
  );
}