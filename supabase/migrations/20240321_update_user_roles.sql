-- Update the handle_new_user function to use email domain check
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    staff_domain text;
BEGIN
    -- Get the staff email domain from settings
    staff_domain := current_setting('app.settings.staff_email_domain', TRUE);
    
    -- If no domain is set, default to 'hospital.com'
    IF staff_domain IS NULL THEN
        staff_domain := 'hospital.com';
    END IF;

    -- Check email domain and assign role accordingly
    IF NEW.email LIKE '%@' || staff_domain THEN
        INSERT INTO user_roles (user_id, role, created_by)
        VALUES (NEW.id, 'receptionist', NEW.id);
    ELSE
        INSERT INTO user_roles (user_id, role, created_by)
        VALUES (NEW.id, 'patient', NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Add patient to user_role type
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'patient';

-- Create function to set staff email domain
CREATE OR REPLACE FUNCTION set_staff_email_domain(domain text)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.settings.staff_email_domain', domain, FALSE);
END;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_staff_email_domain TO authenticated;

-- Create RLS policy for patients to view only their own records
CREATE POLICY "Patients can view only their own records"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'patient'
            AND patients.created_by = auth.uid()
        )
    );

CREATE POLICY "Patients can update only their own records"
    ON patients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'patient'
            AND patients.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'patient'
            AND patients.created_by = auth.uid()
        )
    );

-- Add comments
COMMENT ON FUNCTION set_staff_email_domain IS 'Sets the email domain used to identify staff members';
COMMENT ON FUNCTION handle_new_user IS 'Automatically assigns roles based on email domain';