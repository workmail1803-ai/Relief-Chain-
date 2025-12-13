-- Fix Foreign Key for Supabase Joins
-- The API needs an explicit FK to public.profiles to allow joining (select *, profiles(*))

DO $$
BEGIN
  -- 1. Drop existing constraint if it strictly references auth.users only (optional but safe)
  -- We want to ensure it explicitly references public.profiles for the API to see the link.
  
  -- Check if we can add a second FK or if we need to switch.
  -- Ideally, user_id references profiles(id) is best because profiles is in the public schema.
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'disaster_volunteers_user_id_fkey_profiles'
  ) THEN
    ALTER TABLE public.disaster_volunteers
    ADD CONSTRAINT disaster_volunteers_user_id_fkey_profiles
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  END IF;

END $$;

-- Verify/Refresh Schema Cache (Supabase usually does this automatically on DDL, but good to know)
NOTIFY pgrst, 'reload config';
