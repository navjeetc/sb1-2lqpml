-- Create a secure view for user emails
CREATE OR REPLACE VIEW public.users AS
SELECT id, email
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON public.users TO authenticated;

-- Create function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT email 
        FROM public.users 
        WHERE id = user_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;

-- Add comments
COMMENT ON VIEW public.users IS 'Secure view for accessing user email addresses';
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID';