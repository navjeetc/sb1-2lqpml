-- Drop existing trigger and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create a more robust trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_exists boolean;
    max_attempts integer := 3;
    current_attempt integer := 0;
BEGIN
    -- Add delay to ensure transaction is committed
    PERFORM pg_sleep(0.5);
    
    LOOP
        current_attempt := current_attempt + 1;
        
        -- Check if role already exists
        SELECT EXISTS (
            SELECT 1 
            FROM public.user_roles 
            WHERE user_id = NEW.id
        ) INTO role_exists;

        -- Only insert if role doesn't exist
        IF NOT role_exists THEN
            BEGIN
                INSERT INTO public.user_roles (
                    user_id,
                    role,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                ) VALUES (
                    NEW.id,
                    'receptionist'::user_role,
                    NEW.id,
                    NEW.id,
                    NOW(),
                    NOW()
                );
                
                -- Log successful role assignment
                RAISE NOTICE 'Role assigned for user % on attempt %: receptionist', NEW.id, current_attempt;
                EXIT; -- Exit loop on success
            EXCEPTION
                WHEN unique_violation THEN
                    RAISE NOTICE 'Role already exists for user %', NEW.id;
                    EXIT;
                WHEN OTHERS THEN
                    IF current_attempt >= max_attempts THEN
                        RAISE WARNING 'Failed to assign role to user % after % attempts: %', 
                            NEW.id, max_attempts, SQLERRM;
                        EXIT;
                    END IF;
                    -- Wait before retry
                    PERFORM pg_sleep(0.5);
            END;
        ELSE
            EXIT; -- Role exists, no need to continue
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger with AFTER INSERT
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create function to manually assign role
CREATE OR REPLACE FUNCTION ensure_user_role(user_id UUID)
RETURNS void AS $$
BEGIN
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
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION ensure_user_role(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION handle_new_user IS 'Trigger function to assign default role to new users with retry logic';
COMMENT ON FUNCTION ensure_user_role IS 'Manually assign default role to a user if trigger failed';