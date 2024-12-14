-- Drop existing policies
DROP POLICY IF EXISTS "admin_full_access" ON patients;
DROP POLICY IF EXISTS "staff_view_active" ON patients;
DROP POLICY IF EXISTS "staff_create" ON patients;
DROP POLICY IF EXISTS "staff_update_active" ON patients;

-- Create new policies with proper admin access
CREATE POLICY "admin_access"
    ON patients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "staff_view"
    ON patients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('doctor', 'nurse', 'receptionist')
        )
        AND NOT deleted
    );

CREATE POLICY "staff_create"
    ON patients
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('doctor', 'nurse', 'receptionist')
        )
    );

CREATE POLICY "staff_update"
    ON patients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('doctor', 'nurse', 'receptionist')
        )
        AND NOT deleted
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('doctor', 'nurse', 'receptionist')
        )
        AND NOT deleted
    );

-- Add comments
COMMENT ON POLICY "admin_access" ON patients IS 'Administrators have full access to all patients';
COMMENT ON POLICY "staff_view" ON patients IS 'Staff can view non-deleted patients';
COMMENT ON POLICY "staff_create" ON patients IS 'Staff can create new patients';
COMMENT ON POLICY "staff_update" ON patients IS 'Staff can update non-deleted patients';