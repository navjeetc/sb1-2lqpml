-- Create new user handler
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
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();