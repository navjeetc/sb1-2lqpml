-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe');

-- Create the patients table
CREATE TABLE patients (
    -- Primary key and timestamps
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ,
    
    -- Basic information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Address
    address_street VARCHAR(255) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_state VARCHAR(50) NOT NULL,
    address_zip_code VARCHAR(20) NOT NULL,
    
    -- Emergency contact
    emergency_contact_name VARCHAR(200) NOT NULL,
    emergency_contact_relationship VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    
    -- Insurance information
    insurance_provider VARCHAR(200) NOT NULL,
    insurance_policy_number VARCHAR(100) NOT NULL,
    insurance_group_number VARCHAR(100) NOT NULL,
    
    -- Vital signs (latest)
    vital_signs JSONB NOT NULL DEFAULT '{}'::JSONB,
    
    -- Medical history
    medical_history JSONB NOT NULL DEFAULT '{
        "conditions": [],
        "surgeries": [],
        "medications": [],
        "allergies": []
    }'::JSONB,
    
    -- Additional fields
    chief_complaint TEXT,
    symptoms JSONB DEFAULT '[]'::JSONB,
    
    -- Metadata
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    last_updated_by VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(100)
);

-- Create indexes
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_patients_date_of_birth ON patients(date_of_birth);
CREATE INDEX idx_patients_deleted ON patients(deleted);
CREATE INDEX idx_patients_last_updated ON patients(last_updated);

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

-- Create RLS policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy for selecting patients (only non-deleted)
CREATE POLICY "Select non-deleted patients" ON patients
    FOR SELECT
    USING (deleted = false);

-- Policy for inserting patients
CREATE POLICY "Insert patients" ON patients
    FOR INSERT
    WITH CHECK (true);

-- Policy for updating patients
CREATE POLICY "Update patients" ON patients
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Add comments
COMMENT ON TABLE patients IS 'Stores patient information for medical onboarding system';
COMMENT ON COLUMN patients.vital_signs IS 'JSON object containing latest vital signs measurements';
COMMENT ON COLUMN patients.medical_history IS 'JSON object containing patient medical history';
COMMENT ON COLUMN patients.symptoms IS 'Array of current symptoms';