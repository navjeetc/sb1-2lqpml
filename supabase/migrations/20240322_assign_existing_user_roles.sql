-- Function to assign roles to existing users
CREATE OR REPLACE FUNCTION assign_roles_to_existing_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    staff_domain text;
BEGIN
    -- Get the staff email domain from settings
    staff_domain := current_setting('app.settings.staff_email_domain', TRUE);
    
    -- If no domain is set, default to 'hospital.com'
    IF staff_domain IS NULL THEN
        staff_domain := 'hospital.com';
    END IF;

    -- Find users without roles
    FOR user_record IN 
        SELECT au.id, au.email
        FROM auth.users au
        LEFT JOIN user_roles ur ON au.id = ur.user_id
        WHERE ur.id IS NULL
    LOOP
        -- Assign role based on email domain
        IF user_record.email LIKE '%@' || staff_domain THEN
            INSERT INTO user_roles (user_id, role, created_by)
            VALUES (user_record.id, 'receptionist', user_record.id);
        ELSE
            INSERT INTO user_roles (user_id, role, created_by)
            VALUES (user_record.id, 'patient', user_record.id);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually update a user's role
CREATE OR REPLACE FUNCTION admin_update_user_role(
    target_user_id UUID,
    new_role user_role
)
RETURNS void AS $$
BEGIN
    -- Check if the executing user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only administrators can update user roles';
    END IF;

    -- Update or insert the role
    INSERT INTO user_roles (user_id, role, created_by, updated_by)
    VALUES (target_user_id, new_role, auth.uid(), auth.uid())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        role = new_role,
        updated_by = auth.uid(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION assign_roles_to_existing_users TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_user_role TO authenticated;

-- Run the function to assign roles to existing users
SELECT assign_roles_to_existing_users();

-- Add comments
COMMENT ON FUNCTION assign_roles_to_existing_users IS 'Assigns default roles to users who don''t have any role assigned';
COMMENT ON FUNCTION admin_update_user_role IS 'Allows administrators to update user roles';