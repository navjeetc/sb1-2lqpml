-- Drop existing functions and triggers to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS assign_role_to_user(UUID, user_role) CASCADE;

-- Create base function to assign role
CREATE OR REPLACE FUNCTION assign_role_to_user(
    target_user_id UUID,
    role_name user_role
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_by,
        updated_by
    ) VALUES (
        target_user_id,
        role_name,
        target_user_id,
        target_user_id
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW(),
        updated_by = EXCLUDED.updated_by;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in assign_role_to_user: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified handler for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION assign_role_to_user(UUID, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- Ensure user_roles table exists and has correct permissions
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'receptionist'::user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own role"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own role"
    ON public.user_roles FOR UPDATE
    USING (auth.uid() = user_id);

-- Grant necessary table permissions
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;