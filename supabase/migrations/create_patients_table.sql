-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe');

-- Create the patients table
CREATE TABLE patients (
    -- Primary key and timestamps
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- User relationships
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Basic information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Contact information as JSONB
    address JSONB NOT NULL DEFAULT '{
        "street": "",
        "city": "",
        "state": "",
        "zipCode": ""
    }'::JSONB,
    
    emergency_contact JSONB NOT NULL DEFAULT '{
        "name": "",
        "relationship": "",
        "phone": ""
    }'::JSONB,
    
    -- Insurance information as JSONB
    insurance JSONB NOT NULL DEFAULT '{
        "provider": "",
        "policyNumber": "",
        "groupNumber": ""
    }'::JSONB,
    
    -- Medical information
    vital_signs JSONB NOT NULL DEFAULT '{
        "bloodPressure": "",
        "heartRate": 0,
        "temperature": 0,
        "respiratoryRate": 0,
        "oxygenSaturation": 0,
        "timestamp": null
    }'::JSONB,
    
    medical_history JSONB NOT NULL DEFAULT '{
        "conditions": [],
        "surgeries": [],
        "medications": [],
        "allergies": []
    }'::JSONB,
    
    -- Additional fields
    chief_complaint TEXT,
    symptoms JSONB DEFAULT '[]'::JSONB,
    
    -- Soft delete
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_patients_created_by ON patients(created_by);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_deleted ON patients(deleted);
CREATE INDEX idx_patients_updated_at ON patients(updated_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own patients"
    ON patients FOR SELECT
    USING (auth.uid() = created_by AND NOT deleted);

CREATE POLICY "Users can create patients"
    ON patients FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own patients"
    ON patients FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Add comments
COMMENT ON TABLE patients IS 'Stores patient information with user relationships';
COMMENT ON COLUMN patients.created_by IS 'References the user who created the patient record';
COMMENT ON COLUMN patients.updated_by IS 'References the user who last updated the patient record';
COMMENT ON COLUMN patients.deleted_by IS 'References the user who deleted the patient record';
COMMENT ON COLUMN patients.address IS 'JSON object containing patient address details';
COMMENT ON COLUMN patients.emergency_contact IS 'JSON object containing emergency contact information';
COMMENT ON COLUMN patients.insurance IS 'JSON object containing insurance details';
COMMENT ON COLUMN patients.vital_signs IS 'JSON object containing latest vital signs measurements';
COMMENT ON COLUMN patients.medical_history IS 'JSON object containing patient medical history';
COMMENT ON COLUMN patients.symptoms IS 'Array of current symptoms';