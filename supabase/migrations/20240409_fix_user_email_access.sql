-- Drop existing views and functions
DROP VIEW IF EXISTS public.user_emails CASCADE;
DROP FUNCTION IF EXISTS get_user_email CASCADE;

-- Create a secure view for user emails
CREATE OR REPLACE VIEW public.user_emails AS
SELECT 
    id,
    email,
    CASE 
        WHEN id = auth.uid() THEN true
        ELSE EXISTS (
            SELECT 1 
            FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    END AS can_view_details
FROM auth.users;

-- Enable RLS on the view
ALTER VIEW public.user_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for the view
CREATE POLICY "Users can view authorized emails"
    ON public.user_emails
    FOR SELECT
    USING (can_view_details);

-- Grant access to the view
GRANT SELECT ON public.user_emails TO authenticated;

-- Create function to get user email
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    viewer_role TEXT;
    result TEXT;
BEGIN
    -- Get the role of the requesting user
    SELECT role INTO viewer_role
    FROM user_roles
    WHERE user_id = auth.uid();

    -- Get email based on role
    IF viewer_role = 'admin' THEN
        SELECT email INTO result
        FROM auth.users
        WHERE id = user_id;
    ELSE
        SELECT email INTO result
        FROM auth.users
        WHERE id = user_id
        AND (
            id = auth.uid() -- User can see their own email
            OR EXISTS (
                SELECT 1 
                FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('doctor', 'nurse', 'receptionist')
            )
        );
    END IF;

    RETURN COALESCE(result, 'Unknown');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email TO authenticated;

-- Add comments
COMMENT ON VIEW public.user_emails IS 'Secure view for accessing user email addresses with role-based access control';
COMMENT ON FUNCTION get_user_email IS 'Securely retrieve email address for a given user ID with role-based access control';