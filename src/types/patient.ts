export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    timestamp: string;
  };
  medicalHistory: {
    conditions: string[];
    surgeries: string[];
    medications: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
    allergies: {
      substance: string;
      severity: 'mild' | 'moderate' | 'severe';
      reaction: string;
    }[];
  };
  chiefComplaint: string;
  symptoms: string[];
  lastUpdated: string;
  lastUpdatedBy: string;
  createdBy: string;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}