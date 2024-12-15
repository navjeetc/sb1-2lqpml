-- Drop existing function
DROP FUNCTION IF EXISTS get_user_email(UUID);

-- Create improved version with better error handling and logging
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
    requesting_user_id UUID;
    requesting_user_role TEXT;
BEGIN
    -- Get requesting user's ID
    requesting_user_id := auth.uid();
    
    -- Get requesting user's role
    SELECT role::TEXT INTO requesting_user_role
    FROM user_roles
    WHERE user_id = requesting_user_id;

    -- Log request details (helpful for debugging)
    RAISE NOTICE 'Email request - Requesting user: %, Role: %, Target user: %', 
        requesting_user_id, requesting_user_role, user_id;

    -- Verify authentication
    IF requesting_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get the email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    -- Log result
    IF user_email IS NULL THEN
        RAISE NOTICE 'No email found for user: %', user_id;
    END IF;

    RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions
REVOKE ALL ON FUNCTION get_user_email(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_email IS 'Retrieve email address for a given user ID with logging for debugging';

-- Create index to improve performance
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);

-- Ensure RLS is properly configured for auth.users
ALTER TABLE auth.users FORCE ROW LEVEL SECURITY;