-- Drop existing function and policies
DROP FUNCTION IF EXISTS get_user_email(UUID);
DROP POLICY IF EXISTS "Allow reading user emails" ON auth.users;

-- Create a secure function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT email 
        FROM auth.users 
        WHERE id = user_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_email IS 'Retrieve email address for a given user ID';