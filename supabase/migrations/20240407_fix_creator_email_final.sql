-- Drop existing function and views
DROP FUNCTION IF EXISTS get_user_email CASCADE;
DROP VIEW IF EXISTS public.users CASCADE;

-- Create a secure view for user emails
CREATE VIEW public.user_emails AS
SELECT id, email
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON public.user_emails TO authenticated;

-- Create function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get email from the view
    SELECT email INTO user_email
    FROM public.user_emails
    WHERE id = user_id;

    -- Return the email or 'Unknown'
    RETURN COALESCE(user_email, 'Unknown');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Unknown';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;

-- Add comments
COMMENT ON VIEW public.user_emails IS 'Secure view for accessing user email addresses';
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID';