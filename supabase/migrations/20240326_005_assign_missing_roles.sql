-- Assign roles to users who don't have one
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