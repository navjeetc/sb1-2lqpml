export const DOCTOR_SPECIALTIES = {
    GENERAL_PHYSICIAN: 'General Physician',
    ONCOLOGIST: 'Oncologist',
    ENT: 'ENT',
    HEART_SURGEON: 'Heart Surgeon',
    PEDIATRICIAN: 'Pediatrician',
    NEUROLOGIST: 'Neurologist',
    DERMATOLOGIST: 'Dermatologist',
    ORTHOPEDIST: 'Orthopedist',
} as const;

export type DoctorSpecialty = typeof DOCTOR_SPECIALTIES[keyof typeof DOCTOR_SPECIALTIES];

export interface DoctorProfile {
    userId: string;
    specialty: DoctorSpecialty;
    description?: string;
    education?: string;
    yearsOfExperience?: number;
    acceptingNewPatients: boolean;
    createdAt: string;
    updatedAt: string;
}
