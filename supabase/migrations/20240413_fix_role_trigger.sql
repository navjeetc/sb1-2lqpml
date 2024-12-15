-- Drop existing trigger and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create a more reliable trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_exists boolean;
BEGIN
    -- Check if role already exists
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = NEW.id
    ) INTO role_exists;

    -- Only insert if role doesn't exist
    IF NOT role_exists THEN
        INSERT INTO public.user_roles (
            user_id,
            role,
            created_by,
            updated_by
        ) VALUES (
            NEW.id,
            'receptionist'::user_role,
            NEW.id,
            NEW.id
        );
        
        -- Log successful role assignment
        RAISE NOTICE 'Role assigned for user %: receptionist', NEW.id;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't prevent user creation
        RAISE WARNING 'Error assigning role to user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Update policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

CREATE POLICY "Users can view their own role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.user_roles TO authenticated;