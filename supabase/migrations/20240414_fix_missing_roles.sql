-- Function to assign roles to existing users
CREATE OR REPLACE FUNCTION fix_missing_roles()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    role_count INTEGER;
    fixed_count INTEGER := 0;
BEGIN
    -- Get count of users without roles
    SELECT COUNT(*)
    INTO role_count
    FROM auth.users u
    WHERE NOT EXISTS (
        SELECT 1 
        FROM public.user_roles ur 
        WHERE ur.user_id = u.id
    );

    RAISE NOTICE 'Found % users without roles', role_count;

    -- Iterate through users without roles
    FOR user_record IN 
        SELECT id, email, created_at
        FROM auth.users u
        WHERE NOT EXISTS (
            SELECT 1 
            FROM public.user_roles ur 
            WHERE ur.user_id = u.id
        )
    LOOP
        BEGIN
            -- Insert role for user
            INSERT INTO public.user_roles (
                user_id,
                role,
                created_by,
                updated_by,
                created_at,
                updated_at
            ) VALUES (
                user_record.id,
                'receptionist'::user_role,
                user_record.id,
                user_record.id,
                user_record.created_at,
                NOW()
            );

            fixed_count := fixed_count + 1;
            RAISE NOTICE 'Assigned role for user %: %', user_record.id, user_record.email;

        EXCEPTION 
            WHEN unique_violation THEN
                RAISE NOTICE 'Role already exists for user %: %', user_record.id, user_record.email;
            WHEN OTHERS THEN
                RAISE WARNING 'Error assigning role to user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE 'Fixed roles for % users', fixed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check role assignments
CREATE OR REPLACE FUNCTION check_role_assignments()
RETURNS TABLE (
    total_users BIGINT,
    users_with_roles BIGINT,
    users_without_roles BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.user_roles) as users_with_roles,
        (
            SELECT COUNT(*)
            FROM auth.users u
            WHERE NOT EXISTS (
                SELECT 1 
                FROM public.user_roles ur 
                WHERE ur.user_id = u.id
            )
        ) as users_without_roles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION fix_missing_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION check_role_assignments() TO authenticated;

-- Run the fix
SELECT check_role_assignments();
SELECT fix_missing_roles();
SELECT check_role_assignments();

-- Add comments
COMMENT ON FUNCTION fix_missing_roles IS 'Assigns default roles to users who don''t have any role assigned';
COMMENT ON FUNCTION check_role_assignments IS 'Reports statistics about user role assignments';