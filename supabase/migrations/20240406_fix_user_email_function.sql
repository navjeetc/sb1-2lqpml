-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_user_email(UUID);

-- Create a more reliable function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Get email from auth.users
    SELECT email INTO result
    FROM auth.users
    WHERE id = user_id;

    -- Return the email or 'Unknown'
    RETURN COALESCE(result, 'Unknown');
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return 'Unknown' on any error
        RAISE WARNING 'Error getting email for user %: %', user_id, SQLERRM;
        RETURN 'Unknown';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID with error handling';