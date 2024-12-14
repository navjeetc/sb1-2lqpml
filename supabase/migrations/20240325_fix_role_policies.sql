-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP TRIGGER IF EXISTS ensure_user_role ON auth.users;

-- Create a secure function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = $1 
        AND role = 'admin'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified policies
CREATE POLICY "View own role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admin view all"
    ON public.user_roles
    FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admin manage roles"
    ON public.user_roles
    FOR ALL
    USING (is_admin(auth.uid()));

-- Create a secure function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Set default role for new user
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Ensure all existing users have roles
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
        INSERT INTO public.user_roles (
            user_id,
            role,
            created_by,
            updated_by
        ) VALUES (
            user_record.id,
            'receptionist'::user_role,
            user_record.id,
            user_record.id
        );
    END LOOP;
END;
$$;