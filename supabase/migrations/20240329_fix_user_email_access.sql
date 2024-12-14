-- Drop existing function
DROP FUNCTION IF EXISTS get_user_email(UUID);

-- Create improved version with better security and error handling
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Only allow authenticated users to access emails
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check if user has permission (admin or staff)
    IF NOT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
    ) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    -- Get the email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
REVOKE ALL ON FUNCTION get_user_email(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID with proper authorization checks';