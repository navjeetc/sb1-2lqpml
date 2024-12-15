-- Create a secure function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- Only allow authenticated users to access emails
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    RETURN (
        SELECT email 
        FROM auth.users 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID';