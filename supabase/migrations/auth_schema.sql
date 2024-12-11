-- Auth Schema Overview
SELECT 
    schemaname as schema,
    tablename as table,
    tableowner as owner
FROM pg_tables
WHERE schemaname = 'auth'
ORDER BY schemaname, tablename;

-- Users Table Structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

/*
The auth schema includes these main tables:

1. auth.users - Main users table containing:
   - id (uuid): Primary key
   - email (text): User's email
   - encrypted_password (text): Hashed password
   - email_confirmed_at (timestamp): Email verification timestamp
   - last_sign_in_at (timestamp): Last login timestamp
   - raw_app_meta_data (jsonb): Application metadata
   - raw_user_meta_data (jsonb): User metadata
   - created_at (timestamp): Account creation date
   - updated_at (timestamp): Last update timestamp
   - deleted_at (timestamp): Deletion timestamp if applicable

2. auth.sessions - User sessions
3. auth.refresh_tokens - For token refresh functionality
4. auth.audit_log_entries - Authentication activity logs
5. auth.instances - Instance configuration
6. auth.schema_migrations - Schema version tracking

Note: These tables are managed by Supabase - avoid direct modifications
*/