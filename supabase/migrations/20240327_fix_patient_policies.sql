-- Drop existing policies
DROP POLICY IF EXISTS "Role-based patient view" ON patients;
DROP POLICY IF EXISTS "Role-based patient create" ON patients;
DROP POLICY IF EXISTS "Role-based patient update" ON patients;
DROP POLICY IF EXISTS "Role-based patient delete" ON patients;

-- Create function to check if user has staff role
CREATE OR REPLACE FUNCTION is_staff_role(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_id = $1 
        AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies with proper admin access
CREATE POLICY "admin_full_access"
    ON patients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "staff_view_active"
    ON patients
    FOR SELECT
    USING (
        NOT deleted 
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('doctor', 'nurse', 'receptionist')
        )
    );

CREATE POLICY "staff_create"
    ON patients
    FOR INSERT
    WITH CHECK (
        is_staff_role(auth.uid())
    );

CREATE POLICY "staff_update_active"
    ON patients
    FOR UPDATE
    USING (
        NOT deleted
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('doctor', 'nurse', 'receptionist')
        )
    )
    WITH CHECK (
        NOT deleted
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('doctor', 'nurse', 'receptionist')
        )
    );

-- Grant necessary permissions
GRANT ALL ON patients TO authenticated;