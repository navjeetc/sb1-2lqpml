-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow email lookup" ON auth.users;

-- Create a more permissive policy for email lookup
CREATE POLICY "Allow authenticated email lookup"
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
COMMENT ON POLICY "Allow authenticated email lookup" ON auth.users 
    IS 'Allows authenticated users to look up email addresses';