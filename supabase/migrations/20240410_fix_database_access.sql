-- Drop existing policies and functions
DROP POLICY IF EXISTS "admin_access" ON patients;
DROP POLICY IF EXISTS "staff_view" ON patients;
DROP POLICY IF EXISTS "staff_create" ON patients;
DROP POLICY IF EXISTS "staff_update" ON patients;
DROP FUNCTION IF EXISTS get_user_email CASCADE;

-- Create helper function for role checks
CREATE OR REPLACE FUNCTION has_role(required_roles text[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_id = auth.uid()
        AND role::text = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- Return email if user has appropriate role
    IF has_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']) THEN
        RETURN (
            SELECT email 
            FROM auth.users 
            WHERE id = user_id
        );
    END IF;
    
    RETURN 'Unknown';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for patients table
CREATE POLICY "admin_full_access"
    ON patients
    FOR ALL
    USING (has_role(ARRAY['admin']));

CREATE POLICY "staff_view_active"
    ON patients
    FOR SELECT
    USING (
        has_role(ARRAY['doctor', 'nurse', 'receptionist'])
        AND NOT deleted
    );

CREATE POLICY "staff_create"
    ON patients
    FOR INSERT
    WITH CHECK (has_role(ARRAY['doctor', 'nurse', 'receptionist']));

CREATE POLICY "staff_update_active"
    ON patients
    FOR UPDATE
    USING (
        has_role(ARRAY['doctor', 'nurse', 'receptionist'])
        AND NOT deleted
    )
    WITH CHECK (
        has_role(ARRAY['doctor', 'nurse', 'receptionist'])
        AND NOT deleted
    );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;
GRANT EXECUTE ON FUNCTION has_role TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID';
COMMENT ON FUNCTION has_role IS 'Check if the current user has any of the specified roles';