-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default role for new user
    INSERT INTO user_roles (
        user_id,
        role,
        created_by,
        updated_by
    ) VALUES (
        NEW.id,
        'receptionist',  -- Default role
        NEW.id,
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to manually assign role to existing users
CREATE OR REPLACE FUNCTION assign_role_to_user(
    target_user_id UUID,
    role_name user_role DEFAULT 'receptionist'
)
RETURNS void AS $$
BEGIN
    INSERT INTO user_roles (
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
        role = role_name,
        updated_at = NOW(),
        updated_by = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assign roles to any existing users that don't have one
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id 
        FROM auth.users u
        WHERE NOT EXISTS (
            SELECT 1 
            FROM user_roles ur 
            WHERE ur.user_id = u.id
        )
    LOOP
        PERFORM assign_role_to_user(user_record.id);
    END LOOP;
END;
$$;