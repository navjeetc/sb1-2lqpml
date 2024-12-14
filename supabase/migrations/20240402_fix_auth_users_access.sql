-- Enable access to auth.users for email lookup
CREATE POLICY "Allow email lookup"
    ON auth.users
    FOR SELECT
    TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT SELECT ON auth.users TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_auth_users_id_email 
    ON auth.users(id, email);

-- Add comment
COMMENT ON POLICY "Allow email lookup" ON auth.users 
    IS 'Allows authenticated users to look up email addresses';