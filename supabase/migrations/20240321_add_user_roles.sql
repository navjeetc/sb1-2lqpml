-- Create roles enum
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist');

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Ensure each user can only have one role
    CONSTRAINT unique_user_role UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage roles"
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to set default role on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_id, role, created_by)
    VALUES (NEW.id, 'receptionist', NEW.id);
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger to set default role
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update patients table policies based on roles
DROP POLICY IF EXISTS "Users can view their own patients" ON patients;
DROP POLICY IF EXISTS "Users can create patients" ON patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON patients;

-- New role-based policies
CREATE POLICY "Role-based patient view"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND (
                role = 'admin'
                OR role = 'doctor'
                OR role = 'nurse'
                OR (role = 'receptionist' AND NOT patients.deleted)
            )
        )
    );

CREATE POLICY "Role-based patient create"
    ON patients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND (
                role = 'admin'
                OR role = 'doctor'
                OR role = 'nurse'
                OR role = 'receptionist'
            )
        )
    );

CREATE POLICY "Role-based patient update"
    ON patients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND (
                role = 'admin'
                OR role = 'doctor'
                OR role = 'nurse'
                OR (role = 'receptionist' AND NOT patients.deleted)
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND (
                role = 'admin'
                OR role = 'doctor'
                OR role = 'nurse'
                OR (role = 'receptionist' AND NOT patients.deleted)
            )
        )
    );

CREATE POLICY "Role-based patient delete"
    ON patients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND (role = 'admin' OR role = 'doctor')
        )
    );

-- Add comments
COMMENT ON TABLE user_roles IS 'Stores user roles for the medical system';
COMMENT ON COLUMN user_roles.role IS 'User role enum: admin, doctor, nurse, or receptionist';