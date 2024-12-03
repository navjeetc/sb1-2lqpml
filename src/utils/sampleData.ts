import { Patient } from '../types/patient';

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
}

export const generateSamplePatient = (): Omit<Patient, 'id'> => {
  const timestamp = new Date().toISOString();
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const email = generateEmail(firstName, lastName);
  
  return {
    firstName,
    lastName,
    dateOfBirth: '1985-06-15',
    gender: 'male',
    email,
    phone: '(555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '(555) 987-6543',
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456789',
      groupNumber: 'G987654321',
    },
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      timestamp: timestamp,
    },
    medicalHistory: {
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      surgeries: ['Appendectomy (2010)'],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
        },
      ],
      allergies: [
        {
          substance: 'Penicillin',
          severity: 'moderate',
          reaction: 'Rash and hives',
        },
      ],
    },
    chiefComplaint: 'Persistent headache and dizziness for the past 3 days',
    symptoms: ['Headache', 'Dizziness', 'Fatigue'],
    lastUpdated: timestamp,
    lastUpdatedBy: 'current-user',
  };
};