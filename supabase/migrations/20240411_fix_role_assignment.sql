-- Create a more reliable function for role assignment
CREATE OR REPLACE FUNCTION assign_role_to_user(
    target_user_id UUID,
    role_name user_role DEFAULT 'receptionist'
)
RETURNS void AS $$
BEGIN
    -- Insert new role with proper error handling
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION assign_role_to_user TO authenticated;

-- Add comment
COMMENT ON FUNCTION assign_role_to_user IS 'Assigns or updates a role for a user with proper error handling';

-- Ensure trigger for new users is working correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure role is assigned
    PERFORM assign_role_to_user(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();