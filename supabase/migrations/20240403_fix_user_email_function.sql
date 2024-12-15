-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_email(UUID);

-- Create a more reliable function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    RETURN COALESCE(user_email, 'Unknown');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;

-- Ensure auth.users is accessible
GRANT SELECT ON auth.users TO authenticated;

-- Create policy for auth.users access
DROP POLICY IF EXISTS "Allow email lookup" ON auth.users;
CREATE POLICY "Allow email lookup"
    ON auth.users
    FOR SELECT
    USING (true);

-- Add comment
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID';