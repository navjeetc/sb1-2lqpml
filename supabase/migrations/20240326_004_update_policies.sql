-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "View own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin view all" ON public.user_roles;
DROP POLICY IF EXISTS "Admin manage roles" ON public.user_roles;

-- Create new policies
CREATE POLICY "view_own_role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "admin_view_all"
    ON public.user_roles
    FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "admin_manage_roles"
    ON public.user_roles
    FOR ALL
    USING (is_admin(auth.uid()));