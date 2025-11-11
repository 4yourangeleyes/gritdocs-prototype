-- Configure Supabase for production deployment
-- Check what auth tables exist and configure properly

-- First, let's see what auth schema contains
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'auth' ORDER BY tablename;

-- Check if we have any existing users 
SELECT count(*) as user_count FROM auth.users;

-- Ensure our profiles table is working
SELECT count(*) as profile_count FROM public.profiles;

-- Check current auth settings if any config table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'config') THEN
        RAISE NOTICE 'Auth config table exists, checking settings...';
    ELSE 
        RAISE NOTICE 'No auth config table found - settings managed through Supabase Dashboard';
    END IF;
END $$;