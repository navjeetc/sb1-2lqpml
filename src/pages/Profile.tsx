import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import { getDoctorProfile, updateDoctorProfile } from '../services/api/doctorService';
import type { DoctorProfile } from '../types/doctor';
import { DOCTOR_SPECIALTIES } from '../types/doctor';

export function Profile() {
  const { user } = useAuth();
  const { role } = useRole();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    specialty: '',
    description: '',
    education: '',
    yearsOfExperience: '',
    acceptingNewPatients: true
  });

  useEffect(() => {
    async function loadDoctorProfile() {
      if (user?.id && role === 'doctor') {
        setIsLoading(true);
        const profile = await getDoctorProfile(user.id);
        setDoctorProfile(profile);
        if (profile) {
          setFormData({
            specialty: profile.specialty,
            description: profile.description || '',
            education: profile.education || '',
            yearsOfExperience: profile.yearsOfExperience?.toString() || '',
            acceptingNewPatients: profile.acceptingNewPatients
          });
        }
        setIsLoading(false);
      }
    }
    loadDoctorProfile();
  }, [user?.id, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const success = await updateDoctorProfile({
        userId: user.id,
        specialty: formData.specialty as keyof typeof DOCTOR_SPECIALTIES,
        description: formData.description,
        education: formData.education,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        acceptingNewPatients: formData.acceptingNewPatients
      });

      if (success) {
        setIsEditing(false);
        const updatedProfile = await getDoctorProfile(user.id);
        if (updatedProfile) setDoctorProfile(updatedProfile);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">Role: {role}</p>
          </div>

          {role === 'doctor' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Doctor Profile</h2>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select a specialty</option>
                      {Object.entries(DOCTOR_SPECIALTIES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="acceptingNewPatients"
                      checked={formData.acceptingNewPatients}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Accepting New Patients
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : isLoading ? (
                <p className="text-gray-600">Loading profile...</p>
              ) : doctorProfile ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Specialty:</span> {doctorProfile.specialty}
                  </p>
                  {doctorProfile.description && (
                    <p className="text-gray-600">
                      <span className="font-medium">Description:</span> {doctorProfile.description}
                    </p>
                  )}
                  {doctorProfile.education && (
                    <p className="text-gray-600">
                      <span className="font-medium">Education:</span> {doctorProfile.education}
                    </p>
                  )}
                  {doctorProfile.yearsOfExperience !== undefined && (
                    <p className="text-gray-600">
                      <span className="font-medium">Years of Experience:</span>{' '}
                      {doctorProfile.yearsOfExperience}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">Accepting New Patients:</span>{' '}
                    {doctorProfile.acceptingNewPatients ? 'Yes' : 'No'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">No profile exists. Click "Create Profile" to create your profile.</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {role === 'doctor' && (
          <div className="mt-5 flex justify-end">
            {doctorProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
