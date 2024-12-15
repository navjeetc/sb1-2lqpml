-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS ensure_user_role(UUID) CASCADE;

-- Create a more reliable trigger function with transaction handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure we're in a transaction
    IF NOT EXISTS (SELECT 1 FROM pg_stat_activity WHERE pid = pg_backend_pid() AND state = 'idle in transaction') THEN
        RAISE NOTICE 'Creating new transaction for user %', NEW.id;
    END IF;

    -- Insert role immediately
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_by,
        updated_by,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        'patient'::user_role,
        NEW.id,
        NEW.id,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Role assigned successfully for user %', NEW.id;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create function to manually assign role with better error handling
CREATE OR REPLACE FUNCTION ensure_user_role(user_id UUID)
RETURNS void AS $$
DECLARE
    user_exists boolean;
BEGIN
    -- Check if user exists
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = user_id
    ) INTO user_exists;

    IF NOT user_exists THEN
        RAISE EXCEPTION 'User % does not exist', user_id;
    END IF;

    -- Insert or update role
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_by,
        updated_by,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'receptionist'::user_role,
        user_id,
        user_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        updated_at = NOW(),
        updated_by = user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure RLS is properly configured
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

CREATE POLICY "view_own_role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "insert_own_role"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_role TO authenticated;

-- Fix any existing users without roles
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id 
        FROM auth.users u
        WHERE NOT EXISTS (
            SELECT 1 
            FROM public.user_roles ur 
            WHERE ur.user_id = u.id
        )
    LOOP
        BEGIN
            PERFORM ensure_user_role(user_record.id);
            RAISE NOTICE 'Assigned role for existing user %', user_record.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to assign role for user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
END;
$$;