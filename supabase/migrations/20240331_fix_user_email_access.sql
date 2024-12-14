-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_email(UUID);

-- Create a more permissive function for email access
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the email directly from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    -- Return the email or a default message
    RETURN COALESCE(user_email, 'Email not found');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- Create policy to allow reading auth.users
CREATE POLICY "Allow reading user emails"
    ON auth.users
    FOR SELECT
    TO authenticated
    USING (true);

-- Add comment
COMMENT ON FUNCTION get_user_email IS 'Retrieve email address for a given user ID';